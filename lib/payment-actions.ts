"use server"

import { getPrisma } from "@/lib/tenant-context"
import { revalidatePath } from "next/cache"

export async function getPaymentsAction() {
  try {
    const prisma = await getPrisma()
    const paiements = await prisma.paiement.findMany({
      include: {
        user: {
          select: {
            id: true,
            nom: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: { date_paiement: 'desc' }
    })

    return {
      success: true,
      data: JSON.parse(JSON.stringify(paiements))
    }
  } catch (error: any) {
    console.error("Error fetching payments:", error)
    return { success: false, error: error?.message || "Erreur de chargement des paiements" }
  }
}

export async function createPaymentAction(data: {
  id_utilisateur: number
  montant: number
  type: "scolarite" | "inscription" | "examen"
  status: "paye" | "en_attente" | "annule"
}) {
  try {
    const prisma = await getPrisma()

    if (!data.id_utilisateur || !data.montant || data.montant <= 0) {
      return { success: false, error: "Veuillez spécifier un utilisateur et un montant valide." }
    }

    const newPayment = await prisma.paiement.create({
      data: {
        id_utilisateur: data.id_utilisateur,
        montant: data.montant,
        type: data.type,
        status: data.status,
        date_paiement: new Date()
      }
    })

    revalidatePath("/dashboard/admin/payments")
    revalidatePath("/dashboard")
    return { success: true, data: JSON.parse(JSON.stringify(newPayment)) }
  } catch (error: any) {
    console.error("Error creating payment:", error)
    return { success: false, error: error?.message || "Erreur lors de la création du paiement" }
  }
}

export async function updatePaymentAction(id: number, data: {
  montant?: number
  type?: "scolarite" | "inscription" | "examen"
  status?: "paye" | "en_attente" | "annule"
}) {
  try {
    const prisma = await getPrisma()

    const updated = await prisma.paiement.update({
      where: { id },
      data: {
        ...(data.montant ? { montant: data.montant } : {}),
        ...(data.type ? { type: data.type } : {}),
        ...(data.status ? { status: data.status } : {})
      }
    })

    revalidatePath("/dashboard/admin/payments")
    revalidatePath("/dashboard")
    return { success: true, data: JSON.parse(JSON.stringify(updated)) }
  } catch (error: any) {
    console.error("Error updating payment:", error)
    return { success: false, error: error?.message || "Erreur lors de la mise à jour du paiement" }
  }
}

export async function deletePaymentAction(id: number) {
  try {
    const prisma = await getPrisma()

    await prisma.paiement.delete({
      where: { id }
    })

    revalidatePath("/dashboard/admin/payments")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error: any) {
    console.error("Error deleting payment:", error)
    return { success: false, error: error?.message || "Erreur lors de la suppression" }
  }
}

export async function getStudentPaymentSummaryAction(studentId: number) {
  try {
    const prisma = await getPrisma()
    
    const paiements = await prisma.paiement.findMany({
      where: { id_utilisateur: studentId },
      orderBy: { date_paiement: 'desc' }
    })

    const totalPaye = paiements
      .filter(p => p.status === 'paye')
      .reduce((sum, p) => sum + Number(p.montant), 0)

    const totalEnAttente = paiements
      .filter(p => p.status === 'en_attente')
      .reduce((sum, p) => sum + Number(p.montant), 0)

    return {
      success: true,
      data: {
        paiements: JSON.parse(JSON.stringify(paiements)),
        totalPaye,
        totalEnAttente
      }
    }
  } catch (error: any) {
    console.error("Error fetching student payment summary:", error)
    return { success: false, error: error?.message || "Erreur de chargement" }
  }
}
