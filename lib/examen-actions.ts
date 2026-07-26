"use server"

import { getPrisma } from "@/lib/tenant-context"
import { revalidatePath } from "next/cache"

export async function getExamensNationaux() {
  try {
    const prisma = await getPrisma()
    const examens = await prisma.examenNational.findMany({
      orderBy: { dateExamen: "desc" }
    })
    return { success: true, data: JSON.parse(JSON.stringify(examens)) }
  } catch (error: any) {
    console.error("Error fetching exams:", error)
    return { success: false, error: error.message }
  }
}

export async function createExamenNational(data: {
  nom: string
  dateExamen: Date
  type: string
  jurys?: string
  salles?: string
}) {
  try {
    const prisma = await getPrisma()
    const examen = await prisma.examenNational.create({
      data: {
        nom: data.nom,
        dateExamen: data.dateExamen,
        type: data.type,
        jurys: data.jurys || null,
        salles: data.salles || null
      }
    })
    revalidatePath("/dashboard/admin/examens")
    return { success: true, data: JSON.parse(JSON.stringify(examen)) }
  } catch (error: any) {
    console.error("Error creating exam:", error)
    return { success: false, error: error.message }
  }
}

export async function deleteExamenNational(id: number) {
  try {
    const prisma = await getPrisma()
    await prisma.examenNational.delete({
      where: { id }
    })
    revalidatePath("/dashboard/admin/examens")
    return { success: true }
  } catch (error: any) {
    console.error("Error deleting exam:", error)
    return { success: false, error: error.message }
  }
}
