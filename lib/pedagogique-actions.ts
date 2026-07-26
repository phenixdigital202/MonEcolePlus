"use server"

import { getPrisma } from "@/lib/tenant-context"
import { revalidatePath } from "next/cache"

export async function getLivresPedagogiques() {
  try {
    const prisma = await getPrisma()
    const livres = await prisma.livrePedagogique.findMany({
      orderBy: { dateAjout: "desc" }
    })
    return { success: true, data: JSON.parse(JSON.stringify(livres)) }
  } catch (error: any) {
    console.error("Error fetching books:", error)
    return { success: false, error: error.message }
  }
}

export async function createLivrePedagogique(data: {
  titre: string
  auteur: string
  type: string
  matiere: string
  niveau: string
  url?: string
}) {
  try {
    const prisma = await getPrisma()
    const livre = await prisma.livrePedagogique.create({
      data: {
        titre: data.titre,
        auteur: data.auteur,
        type: data.type,
        matiere: data.matiere,
        niveau: data.niveau,
        url: data.url || "/books/placeholder.pdf"
      }
    })
    revalidatePath("/dashboard/bibliotheque")
    return { success: true, data: JSON.parse(JSON.stringify(livre)) }
  } catch (error: any) {
    console.error("Error creating book:", error)
    return { success: false, error: error.message }
  }
}

export async function deleteLivrePedagogique(id: number) {
  try {
    const prisma = await getPrisma()
    await prisma.livrePedagogique.delete({
      where: { id }
    })
    revalidatePath("/dashboard/bibliotheque")
    return { success: true }
  } catch (error: any) {
    console.error("Error deleting book:", error)
    return { success: false, error: error.message }
  }
}
