"use server"

import { getPrisma } from "@/lib/tenant-context"
import { revalidatePath } from "next/cache"
import {
  validateTeacherAssignment,
  validateTimetable,
  preAuditTimetable,
  TimetableSlot
} from "@/lib/pedagogical-constraints-engine"

export async function addCourse(formData: FormData) {
  const prisma = await getPrisma()
  const id_classe = parseInt(formData.get("id_classe") as string)
  const id_enseignant = parseInt(formData.get("id_enseignant") as string)
  const matiere = formData.get("matiere") as string
  const jour = formData.get("jour") as any // emplois_du_temps_jour
  const heure_debut_str = formData.get("heure_debut") as string
  const heure_fin_str = formData.get("heure_fin") as string
  const salle = formData.get("salle") as string

  if (!id_classe || !id_enseignant || !matiere || !jour || !heure_debut_str || !heure_fin_str) {
    return { success: false, error: "Veuillez remplir tous les champs obligatoires du cours." }
  }

  const heure_debut = new Date(`1970-01-01T${heure_debut_str}:00Z`)
  const heure_fin = new Date(`1970-01-01T${heure_fin_str}:00Z`)

  // Validate teacher assignment & availability (RP-020, RP-021, RP-023)
  const validation = await validateTeacherAssignment({
    teacherId: id_enseignant,
    subject: matiere,
    day: jour,
    startTime: heure_debut,
    endTime: heure_fin,
    classId: id_classe
  })

  if (!validation.valid) {
    const blockingMsg = validation.violations.find(v => v.severity === "BLOCKING")?.message
    return { success: false, error: blockingMsg || "Contrainte pédagogique non respectée." }
  }

  try {
    await prisma.emploiDuTemps.create({
      data: {
        id_classe,
        id_enseignant,
        matiere,
        jour,
        heure_debut,
        heure_fin,
        salle
      }
    })

    revalidatePath("/dashboard/schedule")
    return { success: true }
  } catch (error: any) {
    console.error("Error adding course:", error)
    return { success: false, error: "Erreur lors de l'ajout du cours" }
  }
}

export async function generateAIScheduleAll() {
  const prisma = await getPrisma()
  try {
    // 1. Pre-Audit before generation
    const audit = await preAuditTimetable()
    if (!audit.canGenerate) {
      return {
        success: false,
        error: `Pré-audit bloquant : ${audit.blockingIssues.join(" | ")}`
      }
    }

    const classes = await prisma.class.findMany({
      include: {
        classSubjects: {
          include: {
            teachers: {
              include: {
                teacher: {
                  include: {
                    teacherAvailabilities: true
                  }
                }
              }
            }
          },
          orderBy: [{ ordre: 'asc' }, { id: 'asc' }]
        }
      }
    })

    const allTeachers = await prisma.user.findMany({
      where: { role: 'teacher' },
      include: {
        teacherSubjects: true,
        teacherAvailabilities: true
      }
    })

    const defaultSubjects = ["Mathématiques", "Français", "Anglais", "SVT", "Physique-Chimie", "Histoire-Géo", "EPS", "Arts Plastiques"]
    const days: any[] = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"]
    const slots = ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]
    
    // Track occupied teacher slots: "teacherId_day_slot"
    const busyTeacherSlots = new Set<string>()
    // Track occupied room slots: "room_day_slot"
    const busyRoomSlots = new Set<string>()

    const newEntries: TimetableSlot[] = []

    // CSP Slot Allocation using Class Pédagogie source of truth
    for (const classe of classes) {
      const configuredSubjects = classe.classSubjects || []

      if (configuredSubjects.length > 0) {
        // Class has explicit subjects & assigned teachers configured!
        for (const cs of configuredSubjects) {
          const matName = cs.matiere
          const hoursNeeded = Math.min(cs.volume_horaire_hebdo || 4, 6)
          
          // Get candidate teachers assigned to this class subject
          let assignedTeacherObjects = cs.teachers.map((cst: any) => cst.teacher)
          
          // Fallback: if no specific teacher assigned to class subject, search all teachers enabled for this subject
          if (assignedTeacherObjects.length === 0) {
            assignedTeacherObjects = allTeachers.filter(t => {
              const allowed = new Set<string>()
              if (t.matiere) allowed.add(t.matiere.trim().toLowerCase())
              t.teacherSubjects.forEach(ts => allowed.add(ts.matiere.trim().toLowerCase()))
              return allowed.has(matName.trim().toLowerCase())
            })
          }

          // Fallback: if still no teacher, pick any tenant teacher
          if (assignedTeacherObjects.length === 0) {
            assignedTeacherObjects = allTeachers
          }

          let hoursScheduled = 0

          for (const day of days) {
            if (hoursScheduled >= hoursNeeded) break

            // Daily slots for this class
            const availableDaySlots = day === "Mercredi" ? ["08:00", "09:00", "10:00", "11:00"] : ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00"]

            for (const slot of availableDaySlots) {
              if (hoursScheduled >= hoursNeeded) break

              // Find teacher among assigned objects who is free and available
              const freeTeacher = assignedTeacherObjects.find((t: any) => {
                const busyKey = `${t.id}_${day}_${slot}`
                if (busyTeacherSlots.has(busyKey)) return false

                // Check TeacherAvailability if defined
                if (t.teacherAvailabilities && t.teacherAvailabilities.length > 0) {
                  const dayAvail = t.teacherAvailabilities.filter((ta: any) => ta.jour === day)
                  if (dayAvail.length > 0) {
                    const slotMin = parseInt(slot.split(":")[0]) * 60
                    const isExplicitlyUnavail = dayAvail.some((ta: any) => {
                      if (!ta.est_disponible) {
                        const startMin = new Date(ta.heure_debut).getUTCHours() * 60
                        const endMin = new Date(ta.heure_fin).getUTCHours() * 60
                        return slotMin >= startMin && slotMin < endMin
                      }
                      return false
                    })
                    if (isExplicitlyUnavail) return false
                  }
                }

                return true
              })

              if (!freeTeacher) continue

              // Room selection
              let roomNum = (classes.indexOf(classe) % 10) + 101
              let roomName = `Salle ${roomNum}`
              while (busyRoomSlots.has(`${roomName}_${day}_${slot}`) && roomNum < 120) {
                roomNum++
                roomName = `Salle ${roomNum}`
              }

              busyTeacherSlots.add(`${freeTeacher.id}_${day}_${slot}`)
              busyRoomSlots.add(`${roomName}_${day}_${slot}`)

              const heure_debut = new Date(`1970-01-01T${slot}:00Z`)
              const endHour = parseInt(slot.split(":")[0]) + 1
              const heure_fin = new Date(`1970-01-01T${endHour < 10 ? '0' + endHour : endHour}:00:00Z`)

              newEntries.push({
                id_classe: classe.id,
                id_enseignant: freeTeacher.id,
                matiere: matName,
                jour: day,
                heure_debut,
                heure_fin,
                salle: roomName
              })

              hoursScheduled++
            }
          }
        }
      } else {
        // Fallback for classes without configured classSubjects yet
        for (const day of days) {
          const daySlots = ["08:00", "09:00", "10:00", "11:00"]
          if (day !== "Mercredi") daySlots.push("14:00")

          for (let idx = 0; idx < daySlots.length; idx++) {
            const slot = daySlots[idx]
            const subject = defaultSubjects[(classes.indexOf(classe) + days.indexOf(day) + idx) % defaultSubjects.length]

            let selectedTeacher = allTeachers.find(t => {
              const allowed = new Set<string>()
              if (t.matiere) allowed.add(t.matiere.trim().toLowerCase())
              t.teacherSubjects.forEach(ts => allowed.add(ts.matiere.trim().toLowerCase()))
              
              const matchesSubject = allowed.size === 0 || allowed.has(subject.toLowerCase())
              const isFree = !busyTeacherSlots.has(`${t.id}_${day}_${slot}`)
              return matchesSubject && isFree
            })

            if (!selectedTeacher) {
              selectedTeacher = allTeachers.find(t => !busyTeacherSlots.has(`${t.id}_${day}_${slot}`))
            }

            if (!selectedTeacher) continue

            let roomNum = (classes.indexOf(classe) % 10) + 101
            let roomName = `Salle ${roomNum}`
            while (busyRoomSlots.has(`${roomName}_${day}_${slot}`) && roomNum < 120) {
              roomNum++
              roomName = `Salle ${roomNum}`
            }

            busyTeacherSlots.add(`${selectedTeacher.id}_${day}_${slot}`)
            busyRoomSlots.add(`${roomName}_${day}_${slot}`)

            const heure_debut = new Date(`1970-01-01T${slot}:00Z`)
            const endHour = parseInt(slot.split(":")[0]) + 1
            const heure_fin = new Date(`1970-01-01T${endHour < 10 ? '0' + endHour : endHour}:00:00Z`)

            newEntries.push({
              id_classe: classe.id,
              id_enseignant: selectedTeacher.id,
              matiere: subject,
              jour: day,
              heure_debut,
              heure_fin,
              salle: roomName
            })
          }
        }
      }
    }

    // 2. Validate proposed timetable against all pedagogical rules
    const validation = await validateTimetable(newEntries)
    if (!validation.valid) {
      const blocking = validation.violations.filter(v => v.severity === "BLOCKING")
      return {
        success: false,
        error: `Emploi du temps rejeté par le moteur de contraintes (${blocking.length} violation(s) bloquante(s)) : ${blocking[0]?.message}`
      }
    }

    // 3. Clear existing and create verified entries
    await prisma.emploiDuTemps.deleteMany()
    await prisma.emploiDuTemps.createMany({
      data: newEntries.map(e => ({
        id_classe: e.id_classe,
        id_enseignant: e.id_enseignant,
        matiere: e.matiere,
        jour: e.jour as any,
        heure_debut: e.heure_debut as Date,
        heure_fin: e.heure_fin as Date,
        salle: e.salle
      }))
    })

    revalidatePath("/dashboard/schedule")
    return {
      success: true,
      count: newEntries.length,
      qualityScore: validation.qualityScore
    }
  } catch (error: any) {
    console.error("Error generating AI schedule:", error)
    return { success: false, error: error?.message || "Failed to generate schedule" }
  }
}

export async function getClasses() {
  const prisma = await getPrisma()
  return await prisma.class.findMany({
    orderBy: { nom: 'asc' }
  })
}

export async function updateCoursePosition(courseId: number, day: any, hour: string) {
  const prisma = await getPrisma()
  try {
    const course = await prisma.emploiDuTemps.findUnique({ where: { id: courseId } })
    if (!course) return { success: false, error: "Cours introuvable." }

    const heure_debut = new Date(`1970-01-01T${hour}:00Z`)
    const endHour = parseInt(hour.split(":")[0]) + 1
    const heure_fin = new Date(`1970-01-01T${endHour < 10 ? '0' + endHour : endHour}:00:00Z`)

    // Validate proposed position
    const validation = await validateTeacherAssignment({
      teacherId: course.id_enseignant,
      subject: course.matiere,
      day: day,
      startTime: heure_debut,
      endTime: heure_fin,
      classId: course.id_classe,
      excludeCourseId: courseId
    })

    if (!validation.valid) {
      const blockingMsg = validation.violations.find(v => v.severity === "BLOCKING")?.message
      return { success: false, error: blockingMsg || "Déplacement impossible (conflit de créneau)." }
    }

    await prisma.emploiDuTemps.update({
      where: { id: courseId },
      data: {
        jour: day,
        heure_debut,
        heure_fin
      }
    })

    revalidatePath("/dashboard/schedule")
    revalidatePath("/dashboard/schedule/edit")
    return { success: true }
  } catch (error) {
    console.error("Error updating course position:", error)
    return { success: false, error: "Failed to move course" }
  }
}

export async function getTeachers() {
  const prisma = await getPrisma()
  return await prisma.user.findMany({
    where: { role: 'teacher' },
    orderBy: { nom: 'asc' }
  })
}

export async function getScheduleData(classId?: number) {
  const prisma = await getPrisma()
  return await prisma.emploiDuTemps.findMany({
    where: { id_classe: classId },
    include: {
      user: true,
      classe: true
    }
  })
}

/**
 * Checks for conflicts in teacher or room assignments for a specific slot
 */
export async function checkCourseConflict(
  excludeCourseId: number | null,
  teacherId: number,
  room: string,
  day: string,
  hour: string
) {
  const prisma = await getPrisma()
  const targetHourDebut = new Date(`1970-01-01T${hour}:00Z`)

  // Check teacher conflict
  const teacherConflict = await prisma.emploiDuTemps.findFirst({
    where: {
      id_enseignant: teacherId,
      jour: day as any,
      heure_debut: targetHourDebut,
      id: excludeCourseId ? { not: excludeCourseId } : undefined
    },
    include: {
      classe: true,
      user: true
    }
  })

  if (teacherConflict) {
    return {
      conflict: true,
      reason: `L'enseignant ${teacherConflict.user.nom} est déjà affecté à la classe ${teacherConflict.classe.nom} le ${day} à ${hour}.`
    }
  }

  // Check room conflict
  const roomConflict = await prisma.emploiDuTemps.findFirst({
    where: {
      salle: room,
      jour: day as any,
      heure_debut: targetHourDebut,
      id: excludeCourseId ? { not: excludeCourseId } : undefined
    },
    include: {
      classe: true
    }
  })

  if (roomConflict) {
    return {
      conflict: true,
      reason: `La salle ${room} est déjà occupée par la classe ${roomConflict.classe.nom} le ${day} à ${hour}.`
    }
  }

  return { conflict: false }
}

/**
 * Automate scheduling optimization (heures, salles et enseignants)
 */
export async function optimizeSchedule(classId: number) {
  const prisma = await getPrisma()
  try {
    const courses = await prisma.emploiDuTemps.findMany({
      where: { id_classe: classId },
      include: { user: true, classe: true }
    })

    const days: any[] = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
    const slots = ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]

    let resolvedCount = 0

    for (const course of courses) {
      // Check current slot conflict
      const hour = new Date(course.heure_debut).toISOString().substring(11, 16)
      const conflictRes = await checkCourseConflict(course.id, course.id_enseignant, course.salle || "", course.jour, hour)
      
      if (conflictRes.conflict) {
        // Find a free slot
        let found = false
        for (const d of days) {
          for (const s of slots) {
            const check = await checkCourseConflict(course.id, course.id_enseignant, course.salle || "", d, s)
            if (!check.conflict) {
              // Move course here
              const hDebut = new Date(`1970-01-01T${s}:00Z`)
              const endHour = parseInt(s.split(":")[0]) + 1
              const hFin = new Date(`1970-01-01T${endHour < 10 ? '0' + endHour : endHour}:00:00Z`)

              await prisma.emploiDuTemps.update({
                where: { id: course.id },
                data: {
                  jour: d,
                  heure_debut: hDebut,
                  heure_fin: hFin
                }
              })
              resolvedCount++
              found = true
              break
            }
          }
          if (found) break
        }
      }
    }

    revalidatePath("/dashboard/schedule")
    revalidatePath("/dashboard/schedule/edit")
    return { success: true, resolvedCount }
  } catch (error: any) {
    console.error("Optimization error:", error)
    return { success: false, error: error.message }
  }
}
