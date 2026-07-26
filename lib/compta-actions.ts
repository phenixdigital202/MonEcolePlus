"use server"

import { getPrisma } from "@/lib/tenant-context"
import { revalidatePath } from "next/cache"

export async function getTransactionsComptables() {
  try {
    const prisma = await getPrisma()
    const transactions = await prisma.transactionComptable.findMany({
      orderBy: { date: "desc" }
    })
    return {
      success: true,
      data: JSON.parse(JSON.stringify(transactions))
    }
  } catch (error: any) {
    console.error("Error fetching transactions:", error)
    return { success: false, error: error.message }
  }
}

export async function createTransactionComptable(data: {
  type: "recette" | "depense"
  categorie: string
  montant: number
  mode_paiement: "especes" | "mobile_money" | "banque"
  description?: string
  reference?: string
  compte_caisse?: string
  compte_banque?: string
}) {
  try {
    const prisma = await getPrisma()
    const transaction = await prisma.transactionComptable.create({
      data: {
        id_ecole: 1, // Default sandbox school ID
        type: data.type,
        categorie: data.categorie,
        montant: data.montant,
        mode_paiement: data.mode_paiement,
        description: data.description || "",
        reference: data.reference || "",
        compte_caisse: data.compte_caisse || null,
        compte_banque: data.compte_banque || null,
        date: new Date()
      }
    })

    revalidatePath("/dashboard/admin/compta")
    return { success: true, data: JSON.parse(JSON.stringify(transaction)) }
  } catch (error: any) {
    console.error("Error creating transaction:", error)
    return { success: false, error: error.message }
  }
}

export async function getComptaStats() {
  try {
    const prisma = await getPrisma()
    const transactions = await prisma.transactionComptable.findMany()

    let totalRecettes = 0
    let totalDepenses = 0
    let caisseSolde = 0
    let banqueSolde = 0

    transactions.forEach(t => {
      const amt = Number(t.montant)
      if (t.type === "recette") {
        totalRecettes += amt
        if (t.mode_paiement === "especes") caisseSolde += amt
        if (t.mode_paiement === "banque" || t.mode_paiement === "mobile_money") banqueSolde += amt
      } else {
        totalDepenses += amt
        if (t.mode_paiement === "especes") caisseSolde -= amt
        if (t.mode_paiement === "banque" || t.mode_paiement === "mobile_money") banqueSolde -= amt
      }
    })

    return {
      success: true,
      data: {
        totalRecettes,
        totalDepenses,
        soldeGlobal: totalRecettes - totalDepenses,
        caisseSolde,
        banqueSolde
      }
    }
  } catch (error: any) {
    console.error("Error calculating stats:", error)
    return { success: false, error: error.message }
  }
}

export async function getComptaReports() {
  try {
    const prisma = await getPrisma()
    const transactions = await prisma.transactionComptable.findMany({
      orderBy: { date: "asc" }
    })

    // Grouping for Grand Livre
    const grandLivre: Record<string, any[]> = {}
    // Grouping for Balance
    const balance: Record<string, { debit: number; credit: number }> = {}

    transactions.forEach(t => {
      const amt = Number(t.montant)
      
      // Grand Livre
      if (!grandLivre[t.categorie]) {
        grandLivre[t.categorie] = []
      }
      grandLivre[t.categorie].push(t)

      // Balance sheet calculation
      if (!balance[t.categorie]) {
        balance[t.categorie] = { debit: 0, credit: 0 }
      }
      if (t.type === "depense") {
        balance[t.categorie].debit += amt
      } else {
        balance[t.categorie].credit += amt
      }
    })

    return {
      success: true,
      data: {
        grandLivre: JSON.parse(JSON.stringify(grandLivre)),
        balance: JSON.parse(JSON.stringify(balance))
      }
    }
  } catch (error: any) {
    console.error("Error generating reports:", error)
    return { success: false, error: error.message }
  }
}
