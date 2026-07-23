"use server"

import { getPrisma } from "@/lib/tenant-context"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import masterPrisma from "./prisma"

// Helper to get prisma client
async function getPrismaClient() {
  return await getPrisma()
}

export async function addStudentAction(formData: any) {
  try {
    console.log("[addStudentAction] Received formData:", formData)
    const { nom, email, password, id_classe } = formData
    
    if (!nom || !email || !password) {
      return { success: false, error: "Veuillez remplir tous les champs obligatoires (nom, email, mot de passe)." }
    }

    const cookieStore = await cookies()
    const schoolId = cookieStore.get("school_id")?.value
    const parsedSchoolId = schoolId ? parseInt(schoolId) : null

    const prisma = await getPrismaClient()

    // 1. Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return { success: false, error: "Un utilisateur avec cet email existe déjà." }
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    
    const newUser = await prisma.user.create({
      data: {
        nom,
        email,
        password: hashedPassword,
        role: 'student',
        id_ecole: parsedSchoolId,
        created_at: new Date()
      }
    })

    // 2. Sync user to Master DB if multi-tenant schoolId exists
    if (parsedSchoolId) {
      try {
        const existingMaster = await masterPrisma.user.findUnique({ where: { email } })
        if (!existingMaster) {
          await masterPrisma.user.create({
            data: {
              nom,
              email,
              password: hashedPassword,
              role: 'student',
              id_ecole: parsedSchoolId,
              created_at: new Date()
            }
          })
        }
      } catch (masterErr) {
        console.error("[addStudentAction] Master DB sync error (non-fatal):", masterErr)
      }
    }

    // 3. Create inscription if class selected
    if (newUser.id && id_classe && id_classe !== "") {
      const classIdNum = parseInt(id_classe)
      if (!isNaN(classIdNum)) {
        await prisma.inscription.create({
          data: {
            id_eleve: newUser.id,
            id_classe: classIdNum,
            annee_scolaire: '2023-2024'
          }
        })
      }
    }

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/admin/students")
    revalidatePath("/dashboard/admin/teachers")
    return { success: true }
  } catch (error: any) {
    console.error("[addStudentAction] FATAL ERROR:", error)
    return { success: false, error: error?.message || "Erreur lors de l'ajout" }
  }
}

export async function getTeachersAction() {
  try {
    const prisma = await getPrismaClient()
    const teachers = await prisma.user.findMany({
      where: { role: 'teacher' },
      orderBy: { nom: 'asc' }
    })
    return { success: true, data: teachers }
  } catch (error) {
    return { success: false, error: "Failed to fetch teachers" }
  }
}

export async function getParentsAction() {
  try {
    const prisma = await getPrismaClient()
    const parents = await prisma.user.findMany({
      where: { role: 'parent' },
      include: {
        parentEleveAsParent: {
          include: {
            eleve: {
              include: {
                inscriptions: {
                  include: {
                    classe: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { nom: 'asc' }
    })
    return { success: true, data: parents }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Failed to fetch parents" }
  }
}

export async function getAllUsersAction() {
  try {
    const prisma = await getPrismaClient()
    const users = await prisma.user.findMany({
      orderBy: { created_at: 'desc' }
    })
    return { success: true, data: users }
  } catch (error) {
    return { success: false, error: "Failed to fetch users" }
  }
}

export async function getStudentsAction() {
  try {
    const cookieStore = await cookies()
    const schoolId = cookieStore.get("school_id")?.value
    const prisma = await getPrismaClient()
    
    const whereClause: any = { role: 'student' }
    if (schoolId) {
      whereClause.OR = [
        { id_ecole: parseInt(schoolId) },
        { id_ecole: null }
      ]
    }

    const students = await prisma.user.findMany({
      where: whereClause,
      include: {
        inscriptions: {
          include: {
            classe: true
          }
        }
      },
      orderBy: { nom: 'asc' }
    })
    return { success: true, data: students }
  } catch (error: any) {
    console.error("[getStudentsAction] Error:", error)
    return { success: false, error: error?.message || "Failed to fetch students" }
  }
}

export async function linkParentStudentAction(parentId: number, studentId: number) {
  try {
    const prisma = await getPrismaClient()
    
    const existing = await prisma.parentEleve.findFirst({
      where: { id_parent: parentId, id_eleve: studentId }
    })

    if (existing) {
      return { success: false, error: "Cet élève est déjà rattaché à ce parent." }
    }

    await prisma.parentEleve.create({
      data: {
        id_parent: parentId,
        id_eleve: studentId
      }
    })

    revalidatePath("/dashboard/admin/parents")
    return { success: true }
  } catch (error: any) {
    console.error("[linkParentStudentAction] Error:", error)
    return { success: false, error: error?.message || "Erreur lors du raccordement" }
  }
}

export async function unlinkParentStudentAction(linkId: number) {
  try {
    const prisma = await getPrismaClient()
    await prisma.parentEleve.delete({
      where: { id: linkId }
    })

    revalidatePath("/dashboard/admin/parents")
    return { success: true }
  } catch (error: any) {
    console.error("[unlinkParentStudentAction] Error:", error)
    return { success: false, error: error?.message || "Erreur lors du détachement" }
  }
}

export async function addUserAction(formData: any) {
  try {
    const prisma = await getPrismaClient()
    const { nom, email, password, role, matiere } = formData
    const hashedPassword = await bcrypt.hash(password, 10)
    
    await prisma.user.create({
      data: {
        nom,
        email,
        password: hashedPassword,
        role,
        matiere: matiere || null,
        created_at: new Date()
      }
    })

    revalidatePath("/dashboard/admin/users")
    revalidatePath("/dashboard/admin/teachers")
    revalidatePath("/dashboard/admin/parents")
    revalidatePath("/dashboard/admin/students")
    return { success: true }
  } catch (error) {
    console.error("Error adding user:", error)
    return { success: false, error: "Erreur lors de l'ajout de l'utilisateur" }
  }
}

export async function deleteUserAction(id: number) {
  try {
    const prisma = await getPrismaClient()
    await prisma.user.delete({
      where: { id }
    })
    revalidatePath("/dashboard/admin/users")
    revalidatePath("/dashboard/admin/teachers")
    revalidatePath("/dashboard/admin/parents")
    revalidatePath("/dashboard/admin/students")
    return { success: true }
  } catch (error: any) {
    console.error("Error deleting user:", error)
    return { success: false, error: error?.message || "Erreur lors de la suppression de l'utilisateur" }
  }
}

export async function updateUserAction(id: number, data: any) {
  try {
    const prisma = await getPrismaClient()
    await prisma.user.update({
      where: { id },
      data: {
        nom: data.nom,
        email: data.email,
        role: data.role || undefined,
        matiere: data.matiere || undefined
      }
    })
    revalidatePath("/dashboard/admin/users")
    revalidatePath("/dashboard/admin/teachers")
    revalidatePath("/dashboard/admin/parents")
    revalidatePath("/dashboard/admin/students")
    return { success: true }
  } catch (error: any) {
    console.error("updateUserAction Error:", error)
    return { success: false, error: error?.message || "Erreur de mise à jour" }
  }
}

export async function issueInvoiceAction(formData: any) {
  try {
    const { studentId, amount } = formData
    const prisma = await getPrismaClient()
    await prisma.paiement.create({
      data: {
        id_utilisateur: parseInt(studentId),
        montant: parseFloat(amount),
        status: 'en_attente',
        type: 'scolarite',
        date_paiement: new Date()
      }
    })
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error: any) {
    console.error("[issueInvoiceAction] Error:", error)
    return { success: false, error: error?.message || "Erreur lors de l'émission de la facture" }
  }
}

export async function scheduleClassAction(formData: any) {
  try {
    const { classId, teacherId, subject, day, startTime, endTime } = formData
    const prisma = await getPrismaClient()
    await prisma.emploiDuTemps.create({
      data: {
        id_classe: parseInt(classId),
        id_enseignant: parseInt(teacherId),
        matiere: subject,
        jour: day,
        heure_debut: startTime,
        heure_fin: endTime
      }
    })
    revalidatePath("/dashboard")
    revalidatePath("/dashboard/schedule")
    return { success: true }
  } catch (error: any) {
    console.error("[scheduleClassAction] Error:", error)
    return { success: false, error: error?.message || "Erreur lors de la planification" }
  }
}

export async function broadcastAnnouncementAction(formData: any) {
  try {
    const { title, message, target, authorId } = formData
    const prisma = await getPrismaClient()
    await prisma.annonce.create({
      data: {
        titre: title,
        message: message,
        cible: target || 'tous',
        id_auteur: parseInt(authorId) || 1,
        date_creation: new Date()
      }
    })
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error: any) {
    console.error("[broadcastAnnouncementAction] Error:", error)
    return { success: false, error: error?.message || "Erreur lors de la diffusion" }
  }
}

export async function getAnalyticsData() {
  try {
    const prisma = await getPrismaClient()
    const [avgGrade, absenceStats, subjects, totalUsers] = await Promise.all([
      prisma.note.aggregate({ _avg: { valeur: true } }),
      prisma.absence.findMany({ select: { statut: true, date_absence: true } }),
      prisma.note.findMany({ select: { valeur: true, evaluation: { select: { matiere: true } } } }),
      prisma.user.count({ where: { role: 'student' } })
    ])

    const subjectMap: any = {}
    subjects.forEach(n => {
      const mat = n.evaluation.matiere
      if (!subjectMap[mat]) subjectMap[mat] = { sum: 0, count: 0 }
      subjectMap[mat].sum += Number(n.valeur)
      subjectMap[mat].count++
    })
    const subjectAverages = Object.keys(subjectMap).map(mat => ({
      subject: mat,
      average: Number((subjectMap[mat].sum / subjectMap[mat].count).toFixed(2))
    }))

    const months = ["Sept", "Oct", "Nov", "Dec", "Jan", "Fév", "Mars", "Avril", "Mai", "Juin"]
    const absenceByMonth = months.map(m => ({ month: m, justified: 0, unjustified: 0 }))
    
    absenceStats.forEach(a => {
      const label = new Date(a.date_absence).toLocaleDateString('fr-FR', { month: 'short' })
      const found = absenceByMonth.find(am => am.month.toLowerCase().includes(label.toLowerCase().replace('.', '')))
      if (found) {
        if (a.statut === 'justifie') found.justified++
        else if (a.statut === 'non_justifie') found.unjustified++
      }
    })

    return {
      success: true,
      data: {
        globalAverage: Number((avgGrade._avg.valeur || 0).toFixed(2)),
        attendanceRate: 95,
        successRate: subjects.length > 0 ? Math.round((subjects.filter(n => Number(n.valeur) >= 10).length / subjects.length) * 100) : 0,
        subjectAverages,
        absenceData: absenceByMonth,
        totalStudents: totalUsers
      }
    }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Failed to fetch analytics" }
  }
}

export async function getShortcutMetaData() {
  try {
    const prisma = await getPrismaClient()
    const [classes, teachers, students] = await Promise.all([
      prisma.class.findMany({ select: { id: true, nom: true, niveau: true } }),
      prisma.user.findMany({ where: { role: 'teacher' }, select: { id: true, nom: true, matiere: true } }),
      prisma.user.findMany({ where: { role: 'student' }, select: { id: true, nom: true } })
    ])
    return { success: true, data: { classes, teachers, students } }
  } catch (error) {
    return { success: false, error: "Data fetch failed" }
  }
}
