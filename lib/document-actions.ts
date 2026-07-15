"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getSchoolBranding() {
  // For now, getting the first school in the DB
  const school = await prisma.ecoles.findFirst()
  return school
}

export async function updateSchoolBranding(id: number, data: any) {
  try {
    await prisma.ecoles.update({
      where: { id },
      data: {
        nom: data.nom,
        logo_url: data.logo_url,
        // We simulate these metadata fields as we haven't modified the schema yet
        // In a real app, these would be columns in the ecoles table.
      }
    })
    revalidatePath("/dashboard/settings/school")
    return { success: true }
  } catch (error) {
    console.error("Error updating branding:", error)
    return { success: false, error: "Erreur lors de la mise à jour" }
  }
}

export async function generateDocumentMetadata(type: string, studentId: number) {
  const uniqueId = `DOC-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
  return {
    uniqueId,
    qrCodeUrl: `https://mon-ecole-plus.com/verify/${uniqueId}`,
    generatedAt: new Date()
  }
}
