"use server"

import { getPrisma } from "@/lib/tenant-context"
import { revalidatePath } from "next/cache"

export async function createClass(formData: FormData) {
  const prisma = await getPrisma()
  const nom = formData.get("nom") as string
  const niveau = formData.get("niveau") as string

  if (!nom || !niveau) {
    return { success: false, error: "Veuillez remplir tous les champs" }
  }

  try {
    const newClass = await prisma.class.create({
      data: {
        nom,
        niveau,
        // Assuming we link it to the first school if id_ecole is null or required
        // In a real multi-tenant app, we would get the school ID from the session
      }
    })

    revalidatePath("/dashboard/classes")
    return { success: true, data: newClass }
  } catch (error) {
    console.error("Error creating class:", error)
    return { success: false, error: "Une erreur est survenue lors de la création" }
  }
}

export async function updateClass(id: number, formData: FormData) {
  const prisma = await getPrisma()
  const nom = formData.get("nom") as string
  const niveau = formData.get("niveau") as string

  try {
    await prisma.class.update({
      where: { id },
      data: { nom, niveau }
    })
    revalidatePath("/dashboard/classes")
    return { success: true }
  } catch (error) {
    console.error("Error updating class:", error)
    return { success: false, error: "Erreur lors de la modification" }
  }
}

export async function deleteClass(id: number) {
  const prisma = await getPrisma()
  try {
    // Delete first related records if necessary depending on foreign keys (inscriptions, etc.)
    // In our schema, we should handle cascade or manual delete.
    await prisma.inscription.deleteMany({ where: { id_classe: id } })
    await prisma.emploiDuTemps.deleteMany({ where: { id_classe: id } })
    await prisma.evaluation.deleteMany({ where: { id_classe: id } })
    
    await prisma.class.delete({
      where: { id }
    })
    revalidatePath("/dashboard/classes")
    return { success: true }
  } catch (error) {
    console.error("Error deleting class:", error)
    return { success: false, error: "Erreur lors de la suppression" }
  }
}

export async function enrollStudentAction(studentId: number, classId: number) {
  const prisma = await getPrisma()
  try {
    // Check if duplicate (optional but safe)
    const exists: any = await prisma.$queryRawUnsafe(
        'SELECT id FROM inscriptions WHERE id_eleve = ? AND id_classe = ?',
        studentId, classId
    )
    
    if (exists.length > 0) return { success: false, error: "L'élève est déjà inscrit" }

    await prisma.$executeRawUnsafe(
        'INSERT INTO inscriptions (id_eleve, id_classe, annee_scolaire) VALUES (?, ?, ?)',
        studentId, classId, '2023-2024'
    )
    
    revalidatePath(`/dashboard/classes/${classId}`)
    return { success: true }
  } catch (error) {
    console.error("Enrollment error:", error)
    return { success: false, error: "Erreur lors de l'inscription" }
  }
}

export async function unenrollStudentAction(studentId: number, classId: number) {
  const prisma = await getPrisma()
  try {
    await prisma.$executeRawUnsafe(
        'DELETE FROM inscriptions WHERE id_eleve = ? AND id_classe = ?',
        studentId, classId
    )
    revalidatePath(`/dashboard/classes/${classId}`)
    return { success: true }
  } catch (error) {
    console.error("Unenrollment error:", error)
    return { success: false, error: "Erreur lors de la désinscription" }
  }
}

export async function getEligibleStudentsAction(classId: number) {
  const prisma = await getPrisma()
    try {
        // Find students NOT in this class
        const students = await prisma.$queryRawUnsafe(`
            SELECT id, nom, email FROM users 
            WHERE role = 'student' 
            AND id NOT IN (SELECT id_eleve FROM inscriptions WHERE id_classe = ?)
        `, classId)
        return { success: true, data: students }
    } catch (e) {
        return { success: false, error: "Erreur de chargement" }
    }
}
