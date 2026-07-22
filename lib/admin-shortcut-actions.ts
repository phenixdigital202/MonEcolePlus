"use server"

import { getPrisma } from "@/lib/tenant-context"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

// Helper to get prisma client
async function getPrismaClient() {
  return await getPrisma()
}

import { cookies } from "next/headers"
import masterPrisma from "./prisma"

export async function addStudentAction(formData: any) {
  try {
    console.log("[addStudentAction] Received formData:", formData)
    const { nom, email, password, id_classe } = formData
    
    if (!nom || !email || !password) {
      console.warn("[addStudentAction] Missing required fields")
      return { success: false, error: "Veuillez remplir tous les champs obligatoires (nom, email, mot de passe)." }
    }

    const cookieStore = await cookies()
    const schoolId = cookieStore.get("school_id")?.value
    const parsedSchoolId = schoolId ? parseInt(schoolId) : null

    const prisma = await getPrismaClient()

    // 1. Check if user already exists in target DB
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      console.warn("[addStudentAction] Email already exists:", email)
      return { success: false, error: "Un utilisateur avec cet email existe déjà." }
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    
    console.log("[addStudentAction] Creating user in tenant DB with id_ecole:", parsedSchoolId)
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
    console.log("[addStudentAction] Created user ID:", newUser.id)

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
          console.log("[addStudentAction] Synced student to master DB")
        }
      } catch (masterErr) {
        console.error("[addStudentAction] Master DB sync error (non-fatal):", masterErr)
      }
    }

    // 3. Create inscription if class selected
    if (newUser.id && id_classe && id_classe !== "") {
      const classIdNum = parseInt(id_classe)
      if (!isNaN(classIdNum)) {
        console.log("[addStudentAction] Creating inscription for class ID:", classIdNum)
        await prisma.inscription.create({
          data: {
            id_eleve: newUser.id,
            id_classe: classIdNum,
            annee_scolaire: '2023-2024'
          }
        })
        console.log("[addStudentAction] Inscription created successfully")
      }
    }

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/admin/students")
    revalidatePath("/dashboard/admin/teachers")
    return { success: true }
  } catch (error: any) {
    console.error("[addStudentAction] FATAL ERROR:", {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
      stack: error?.stack
    })
    return { 
      success: false, 
      error: error?.message ? `Erreur: ${error.message}` : "Erreur lors de l'ajout de l'élève" 
    }
  }
}

export async function issueInvoiceAction(formData: any) {
  try {
    const prisma = await getPrismaClient()
    const { id_utilisateur, montant, type } = formData
    
    await prisma.paiement.create({
      data: {
        id_utilisateur: parseInt(id_utilisateur),
        montant: parseFloat(montant),
        type: type,
        status: 'en_attente',
        date_paiement: new Date()
      }
    })

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/admin/students")
    revalidatePath("/dashboard/admin/teachers")
    return { success: true }
  } catch (error) {
    console.error("Error issuing invoice:", error)
    return { success: false, error: "Erreur lors de l'émission de la facture" }
  }
}

export async function scheduleClassAction(formData: any) {
  try {
    const prisma = await getPrismaClient()
    const { id_classe, id_enseignant, matiere, jour, heure_debut, heure_fin, salle } = formData
    
    // Create Date objects for times (Prisma DateTime requires full ISO strings, but since only time is used, we can use a dummy date)
    const today = new Date().toISOString().split('T')[0]
    const startDateTime = new Date(`${today}T${heure_debut}:00Z`)
    const endDateTime = new Date(`${today}T${heure_fin}:00Z`)

    await prisma.emploiDuTemps.create({
      data: {
        id_classe: parseInt(id_classe),
        id_enseignant: parseInt(id_enseignant),
        matiere: matiere,
        jour: jour,
        heure_debut: startDateTime,
        heure_fin: endDateTime,
        salle: salle || "N/A"
      }
    })

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/admin/students")
    revalidatePath("/dashboard/admin/teachers")
    return { success: true }
  } catch (error) {
    console.error("Error scheduling class:", error)
    return { success: false, error: "Erreur lors de la planification du cours" }
  }
}

export async function broadcastAnnouncementAction(formData: any) {
  try {
    const prisma = await getPrismaClient()
    const { titre, message, cible, id_auteur } = formData
    
    await prisma.annonce.create({
      data: {
        titre,
        message,
        cible,
        id_auteur: parseInt(id_auteur),
        date_creation: new Date()
      }
    })

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/admin/students")
    revalidatePath("/dashboard/admin/teachers")
    return { success: true }
  } catch (error) {
    console.error("Error broadcasting announcement:", error)
    return { success: false, error: "Erreur lors de la diffusion de l'annonce" }
  }
}

export async function getShortcutMetaData() {
  try {
    const prisma = await getPrismaClient()
    const [classes, teachers, students] = await Promise.all([
      prisma.class.findMany({ select: { id: true, nom: true, niveau: true } }),
      prisma.user.findMany({ where: { role: 'teacher' }, select: { id: true, nom: true } }),
      prisma.user.findMany({ where: { role: 'student' }, select: { id: true, nom: true } })
    ])
    return { success: true, data: { classes, teachers, students } }
  } catch (error) {
    return { success: false, error: "Data fetch failed" }
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
            eleve: true
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
  } catch (error) {
    console.error(error)
    return { success: false, error: "Failed to delete user" }
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
        matiere: data.matiere
      }
    })
    revalidatePath("/dashboard/admin/users")
    revalidatePath("/dashboard/admin/teachers")
    revalidatePath("/dashboard/admin/parents")
    revalidatePath("/dashboard/admin/students")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to update user" }
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

    // Process subjects
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

    // Process absences by month
    const months = ["Sept", "Oct", "Nov", "Dec", "Jan", "Fév", "Mars", "Avril", "Mai", "Juin"]
    const absenceByMonth = months.map(m => ({ month: m, justified: 0, unjustified: 0 }))
    
    absenceStats.forEach(a => {
      const monthIdx = new Date(a.date_absence).getMonth()
      // Map JS month (0-11) to our academic months (assuming Sept is month 8)
      // For simplicity, just use a generic mapping or actual dates
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
        attendanceRate: 95, // Mock for now until we have total possible days
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
