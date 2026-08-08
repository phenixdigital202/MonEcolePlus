"use server"

import { getPrisma } from "@/lib/tenant-context"
import { revalidatePath } from "next/cache"

/**
 * Validate imported data and check for duplicates/errors.
 */
export async function validateImportData(type: string, rows: any[]) {
  const prisma = await getPrisma()
  const results: any[] = []
  let errorCount = 0
  let duplicateCount = 0

  // Load existing records to detect duplicates
  let existingEmails: Set<string> = new Set()
  
  if (["students", "teachers", "parents"].includes(type)) {
    const users = await prisma.user.findMany({ select: { email: true } })
    users.forEach(u => u.email && existingEmails.add(u.email.toLowerCase()))
  }

  for (let idx = 0; idx < rows.length; idx++) {
    const row = rows[idx]
    const errors: string[] = []
    let isDuplicate = false

    // Perform validation depending on entity type
    if (type === "students" || type === "teachers" || type === "parents") {
      if (!row.nom) errors.push("Nom manquant")
      if (!row.email) {
        errors.push("Email manquant")
      } else {
        const emailLower = String(row.email).toLowerCase()
        if (!emailLower.includes("@")) {
          errors.push("Format email invalide")
        } else if (existingEmails.has(emailLower)) {
          isDuplicate = true
          duplicateCount++
        }
      }
    } else if (type === "classes") {
      if (!row.nom) errors.push("Nom de classe manquant")
      if (!row.niveau) errors.push("Niveau manquant")
    } else if (type === "subjects") {
      if (!row.nom) errors.push("Nom de matière manquant")
      if (!row.coefficient) errors.push("Coefficient manquant")
    }

    if (errors.length > 0) errorCount++

    results.push({
      index: idx + 1,
      data: row,
      errors,
      isDuplicate,
      status: errors.length > 0 ? "error" : (isDuplicate ? "duplicate" : "valid")
    })
  }

  return {
    success: true,
    results,
    errorCount,
    duplicateCount,
    validCount: rows.length - errorCount - duplicateCount
  }
}

/**
 * Execute actual data writing into database.
 */
export async function executeImportData(type: string, validRows: any[]) {
  const prisma = await getPrisma()
  try {
    const bcrypt = require("bcryptjs")
    const defaultPasswordHash = await bcrypt.hash("demo123", 10)

    let createdCount = 0
    // Set a larger timeout for bulk import transaction (e.g. 30 seconds)
    await prisma.$transaction(async (tx) => {
      if (type === "students" || type === "teachers" || type === "parents") {
        const roleMap = { students: "student", teachers: "teacher", parents: "parent" }
        const role = roleMap[type as "students" | "teachers" | "parents"]
        
        const dataToInsert = validRows.map(row => ({
          nom: row.nom,
          email: row.email,
          password: defaultPasswordHash,
          role: role as any,
        }))

        // PostgreSQL supports createMany, running in a single query
        const result = await tx.user.createMany({
          data: dataToInsert,
          skipDuplicates: true
        })
        createdCount = result.count
      } else if (type === "classes") {
        const dataToInsert = validRows.map(row => ({
          nom: row.nom,
          niveau: row.niveau,
        }))
        const result = await tx.class.createMany({
          data: dataToInsert,
          skipDuplicates: true
        })
        createdCount = result.count
      } else if (type === "subjects") {
        const dataToInsert = validRows.map(row => ({
          nom: row.nom,
          code: row.code || row.nom.substring(0, 3).toUpperCase(),
          coefficient: parseInt(row.coefficient || "2")
        }))
        const result = await tx.matiere.createMany({
          data: dataToInsert,
          skipDuplicates: true
        })
        createdCount = result.count
      }
    }, {
      timeout: 30000 // 30 seconds
    })

    try {
      revalidatePath("/dashboard/admin/import-export")
    } catch (e) {}
    return { success: true, count: createdCount }
  } catch (error: any) {
    console.error("Import execution error:", error)
    return { success: false, error: error.message || String(error) }
  }
}

/**
 * Export data from DB for specified entity type
 */
export async function getExportData(type: string) {
  const prisma = await getPrisma()
  try {
    let data: any[] = []

    if (type === "students") {
      data = await prisma.user.findMany({ where: { role: "student" } })
    } else if (type === "teachers") {
      data = await prisma.user.findMany({ where: { role: "teacher" } })
    } else if (type === "parents") {
      data = await prisma.user.findMany({ where: { role: "parent" } })
    } else if (type === "classes") {
      data = await prisma.class.findMany()
    } else if (type === "subjects") {
      data = await prisma.matiere.findMany()
    } else if (type === "emails") {
      data = await prisma.notificationEmail.findMany()
    } else if (type === "whatsapps") {
      data = await prisma.notificationWhatsapp.findMany()
    }

    return { success: true, data: JSON.parse(JSON.stringify(data)) }
  } catch (error: any) {
    console.error("Export fetching error:", error)
    return { success: false, error: error.message || String(error) }
  }
}
