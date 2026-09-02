"use server"

import { cookies } from "next/headers"
import { getPrisma } from "@/lib/tenant-context"
import { revalidatePath } from "next/cache"

/**
 * Fetch all school years for the current tenant
 */
export async function getSchoolYearsAction() {
  try {
    const prisma = await getPrisma()
    const years = await prisma.schoolYear.findMany({
      orderBy: { startDate: "desc" }
    })
    return { success: true, data: JSON.parse(JSON.stringify(years)) }
  } catch (error: any) {
    console.error("[SchoolYear Action] Error fetching years:", error)
    return { success: false, error: error.message || "Failed to load school years" }
  }
}

/**
 * Create or update a school year for the current tenant
 */
export async function saveSchoolYearAction(formData: {
  id?: number
  label: string
  startDate: string
  endDate: string
  status: string
}) {
  const cookieStore = await cookies()
  const userId = cookieStore.get("user_id")?.value

  if (!userId) {
    return { success: false, error: "Non authentifié" }
  }

  const prisma = await getPrisma()

  const { getCachedUser } = require("@/lib/cached-queries")
  const user = await getCachedUser(parseInt(userId))

  if (!user || user.role !== "admin") {
    return { success: false, error: "Permissions insuffisantes (Admin requis)" }
  }

  const ecole = await prisma.ecole.findFirst()
  if (!ecole) {
    return { success: false, error: "Établissement introuvable" }
  }

  // 2. Validate dates
  const start = new Date(formData.startDate)
  const end = new Date(formData.endDate)

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { success: false, error: "Dates invalides." }
  }

  if (end.getTime() <= start.getTime()) {
    return { success: false, error: "La date de fin doit être strictement supérieure à la date de début." }
  }

  // 3. Prevent overlaps with other years
  const existingYears = await prisma.schoolYear.findMany({
    where: {
      id_ecole: ecole.id,
      id: formData.id ? { not: formData.id } : undefined
    }
  })

  for (const year of existingYears) {
    const yearStart = new Date(year.startDate).getTime()
    const yearEnd = new Date(year.endDate).getTime()

    // Check overlap
    if (
      (start.getTime() >= yearStart && start.getTime() <= yearEnd) ||
      (end.getTime() >= yearStart && end.getTime() <= yearEnd) ||
      (start.getTime() <= yearStart && end.getTime() >= yearEnd)
    ) {
      return { 
        success: false, 
        error: `Cette période chevauche une année existante : ${year.label} (${new Date(year.startDate).toLocaleDateString()} - ${new Date(year.endDate).toLocaleDateString()})` 
      }
    }
  }

  try {
    let result

    // 4. Prisma Transaction to handle single ACTIVE status
    await prisma.$transaction(async (tx) => {
      if (formData.status === "ACTIVE") {
        // Deactivate any currently active school year
        await tx.schoolYear.updateMany({
          where: { id_ecole: ecole.id, status: "ACTIVE" },
          data: { status: "CLOSED" }
        })
      }

      if (formData.id) {
        // Update existing record
        result = await tx.schoolYear.update({
          where: { id: formData.id },
          data: {
            label: formData.label,
            startDate: start,
            endDate: end,
            status: formData.status
          }
        })
      } else {
        // Create new record
        result = await tx.schoolYear.create({
          data: {
            id_ecole: ecole.id,
            label: formData.label,
            startDate: start,
            endDate: end,
            status: formData.status
          }
        })
      }
    }, { timeout: 15000 })

    // Revalidate affected paths
    revalidatePath("/dashboard")
    revalidatePath("/dashboard/admin/school")

    return { success: true, data: JSON.parse(JSON.stringify(result)) }
  } catch (error: any) {
    console.error("[SchoolYear Action] Save error:", error)
    return { success: false, error: error.message || "Failed to save school year" }
  }
}
