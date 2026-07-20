"use server"

import { getPrisma } from "@/lib/tenant-context"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

// Helper to get prisma client
async function getPrismaClient() {
  return await getPrisma()
}

export async function addStudentAction(formData: any) {
  try {
    const prisma = await getPrismaClient()
    const { nom, email, password, id_classe } = formData
    
    // 1. Create User (Standard Prisma usually works for known tables, but using Raw SQL for consistency on this system)
    const hashedPassword = await bcrypt.hash(password, 10)
    
    await prisma.$executeRawUnsafe(
        `INSERT INTO users (nom, email, password, role, created_at) VALUES (?, ?, ?, 'student', NOW())`,
        nom, email, hashedPassword
    )

    // Get the newly created user ID
    const user: any = await prisma.$queryRawUnsafe(`SELECT id FROM users WHERE email = ?`, email)
    const userId = user[0]?.id

    if (userId && id_classe) {
      await prisma.$executeRawUnsafe(
          `INSERT INTO inscriptions (id_eleve, id_classe, annee_scolaire) VALUES (?, ?, '2023-2024')`,
          userId, parseInt(id_classe)
      )
    }

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/admin/students")
    revalidatePath("/dashboard/admin/teachers")
    return { success: true }
  } catch (error) {
    console.error("Error adding student:", error)
    return { success: false, error: "Erreur lors de l'ajout de l'élève" }
  }
}

export async function issueInvoiceAction(formData: any) {
  try {
    const prisma = await getPrismaClient()
    const { id_utilisateur, montant, type } = formData
    
    await prisma.$executeRawUnsafe(
        `INSERT INTO paiements (id_utilisateur, montant, type, status, date_paiement) VALUES (?, ?, ?, 'en_attente', NOW())`,
        parseInt(id_utilisateur), parseFloat(montant), type
    )

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
    
    // Formatting times for MySQL
    const hStart = `${heure_debut}:00`
    const hEnd = `${heure_fin}:00`

    await prisma.$executeRawUnsafe(
        `INSERT INTO emplois_du_temps (id_classe, id_enseignant, matiere, jour, heure_debut, heure_fin, salle) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        parseInt(id_classe), parseInt(id_enseignant), matiere, jour, hStart, hEnd, salle || "N/A"
    )

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
    
    await prisma.$executeRawUnsafe(
        `INSERT INTO annonces (titre, message, cible, id_auteur, date_creation) VALUES (?, ?, ?, ?, NOW())`,
        titre, message, cible, parseInt(id_auteur)
    )

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
        parent_links: {
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
    const prisma = await getPrismaClient()
    const students = await prisma.user.findMany({
      where: { role: 'student' },
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
  } catch (error) {
    console.error(error)
    return { success: false, error: "Failed to fetch students" }
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
      prisma.note.findMany({ select: { valeur: true, evaluations: { select: { matiere: true } } } }),
      prisma.user.count({ where: { role: 'student' } })
    ])

    // Process subjects
    const subjectMap: any = {}
    subjects.forEach(n => {
      const mat = n.evaluations.matiere
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
