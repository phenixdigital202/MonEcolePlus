"use server"

import prisma from "@/lib/prisma"

export async function getAvailableSchools() {
  try {
    const schools = await prisma.ecoles.findMany({
      select: {
        id: true,
        nom: true,
        subdomain: true,
      },
      orderBy: {
        nom: 'asc'
      }
    })
    return { success: true, schools }
  } catch (error) {
    console.error("Error fetching schools:", error)
    return { success: false, error: "Impossible de récupérer la liste des établissements." }
  }
}
