"use server"

import { getPrisma } from "@/lib/tenant-context"
import { revalidatePath } from "next/cache"

export async function createAbsenceAction(data: {
  id_eleve: number,
  date_absence: string,
  statut?: 'justifie' | 'non_justifie' | 'en_attente',
  motif?: string
}) {
  try {
    const prisma = await getPrisma()
    const absence = await prisma.absence.create({
      data: {
        id_eleve: data.id_eleve,
        date_absence: new Date(data.date_absence),
        statut: data.statut || 'non_justifie',
        motif: data.motif
      }
    })
    revalidatePath("/dashboard/absences")
    return { success: true, absence }
  } catch (error) {
    console.error("Error creating absence:", error)
    return { success: false, error: "Erreur lors du marquage de l'absence" }
  }
}

export async function updateAbsenceStatusAction(id: number, statut: 'justifie' | 'non_justifie' | 'en_attente', motif?: string) {
  try {
    const prisma = await getPrisma()
    const absence = await prisma.absence.update({
      where: { id },
      data: { 
        statut,
        ...(motif && { motif })
      }
    })
    revalidatePath("/dashboard/absences")
    return { success: true, absence }
  } catch (error) {
    console.error("Error updating absence status:", error)
    return { success: false, error: "Erreur lors de la mise à jour du statut" }
  }
}

export async function deleteAbsenceAction(id: number) {
  try {
    const prisma = await getPrisma()
    await prisma.absence.delete({
      where: { id }
    })
    revalidatePath("/dashboard/absences")
    return { success: true }
  } catch (error) {
    console.error("Error deleting absence:", error)
    return { success: false, error: "Erreur lors de la suppression de l'absence" }
  }
}

export async function getAbsenceStats() {
  try {
    const prisma = await getPrisma()
    const total = await prisma.absence.count()
    const byStatus = await prisma.absence.groupBy({
      by: ['statut'],
      _count: true
    })
    
    // Get daily trends for the last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const dailyAbsences = await prisma.absence.findMany({
      where: {
        date_absence: {
          gte: sevenDaysAgo
        }
      },
      select: {
        date_absence: true
      }
    })

    return {
      success: true,
      stats: {
        total,
        byStatus,
        dailyAbsences
      }
    }
  } catch (error) {
    console.error("Error getting absence stats:", error)
    return { success: false, error: "Erreur lors de la récupération des statistiques" }
  }
}
