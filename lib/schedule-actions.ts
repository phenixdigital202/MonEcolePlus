"use server"

import { getPrisma } from "@/lib/tenant-context"
import { revalidatePath } from "next/cache"

export async function addCourse(formData: FormData) {
  const prisma = await getPrisma()
  const id_classe = parseInt(formData.get("id_classe") as string)
  const id_enseignant = parseInt(formData.get("id_enseignant") as string)
  const matiere = formData.get("matiere") as string
  const jour = formData.get("jour") as any // emplois_du_temps_jour
  const heure_debut_str = formData.get("heure_debut") as string
  const heure_fin_str = formData.get("heure_fin") as string
  const salle = formData.get("salle") as string

  // Simple formatting of time strings to Date objects (Times in Prisma MySQL are tricky)
  // We'll use a dummy date and just the time part
  const heure_debut = new Date(`1970-01-01T${heure_debut_str}:00Z`)
  const heure_fin = new Date(`1970-01-01T${heure_fin_str}:00Z`)

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
  } catch (error) {
    console.error("Error adding course:", error)
    return { success: false, error: "Failed to add course" }
  }
}

export async function generateAIScheduleAll() {
  const prisma = await getPrisma()
  try {
    const classes = await prisma.class.findMany()
    const teachers = await prisma.user.findMany({ where: { role: 'teacher' } })
    
    if (classes.length === 0 || teachers.length === 0) {
      return { success: false, error: "No classes or teachers available" }
    }

    // Clear all existing schedules
    await prisma.emploiDuTemps.deleteMany()

    const subjects = ["Mathématiques", "Français", "Anglais", "SVT", "Physique-Chimie", "Histoire-Géo", "EPS", "Arts Plastiques"]
    const days: any[] = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
    const slots = ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]
    
    const newEntries = []

    for (const classe of classes) {
      for (const day of days) {
        // Generate 3-5 random courses per day
        const daySlots = [...slots].sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 3) + 3)
        
        for (const slot of daySlots) {
          const subject = subjects[Math.floor(Math.random() * subjects.length)]
          const teacher = teachers[Math.floor(Math.random() * teachers.length)]
          
          const heure_debut = new Date(`1970-01-01T${slot}:00Z`)
          const endHour = parseInt(slot.split(":")[0]) + 1
          const heure_fin = new Date(`1970-01-01T${endHour < 10 ? '0' + endHour : endHour}:00:00Z`)

          newEntries.push({
            id_classe: classe.id,
            id_enseignant: teacher.id,
            matiere: subject,
            jour: day,
            heure_debut,
            heure_fin,
            salle: `Salle ${Math.floor(Math.random() * 20) + 100}`
          })
        }
      }
    }

    // Bulk creation
    await prisma.emploiDuTemps.createMany({
        data: newEntries
    })

    revalidatePath("/dashboard/schedule")
    return { success: true, count: newEntries.length }
  } catch (error) {
    console.error("Error generating AI schedule:", error)
    return { success: false, error: "Failed to generate schedule" }
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
    const heure_debut = new Date(`1970-01-01T${hour}:00Z`)
    const endHour = parseInt(hour.split(":")[0]) + 1
    const heure_fin = new Date(`1970-01-01T${endHour < 10 ? '0' + endHour : endHour}:00:00Z`)

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
      const conflictRes = await checkCourseConflict(course.id, course.id_enseignant, course.salle, course.jour, hour)
      
      if (conflictRes.conflict) {
        // Find a free slot
        let found = false
        for (const d of days) {
          for (const s of slots) {
            const check = await checkCourseConflict(course.id, course.id_enseignant, course.salle, d, s)
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
