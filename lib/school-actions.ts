"use server"

import prisma from "@/lib/prisma"

export async function getAvailableSchools() {
  try {
    const schools = await prisma.ecole.findMany({
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

export async function updateSchoolSettingsAction(formData: {
  nom: string
  directeur?: string
  adresse?: string
  telephone?: string
  email?: string
  website?: string
  smtp_host?: string
  smtp_port?: number
  smtp_user?: string
  smtp_pass?: string
  whatsapp_access_token?: string
  whatsapp_phone_number_id?: string
}) {
  const { getPrisma } = require("./tenant-context")
  const masterPrisma = require("./prisma").default
  
  try {
    const tenantPrisma = await getPrisma()
    
    // 1. Get current school from Tenant DB
    const ecole = await tenantPrisma.ecole.findFirst()
    if (!ecole) {
      return { success: false, error: "Établissement introuvable dans la base locataire." }
    }

    // 2. Update Tenant DB
    const updateData: any = {
      nom: formData.nom,
      directeur: formData.directeur,
      adresse: formData.adresse,
      telephone: formData.telephone,
      email: formData.email,
      website: formData.website,
      smtp_host: formData.smtp_host || null,
      smtp_port: formData.smtp_port ? Number(formData.smtp_port) : null,
      smtp_user: formData.smtp_user || null,
      whatsapp_phone_number_id: formData.whatsapp_phone_number_id || null,
    }

    // Preserve secrets if not modified
    if (formData.smtp_pass && formData.smtp_pass !== "••••••••••••") {
      updateData.smtp_pass = formData.smtp_pass
    }
    if (formData.whatsapp_access_token && !formData.whatsapp_access_token.includes("***")) {
      updateData.whatsapp_access_token = formData.whatsapp_access_token
    }

    const updated = await tenantPrisma.ecole.update({
      where: { id: ecole.id },
      data: updateData
    })

    // 3. Sync to Master DB for global settings consistency
    try {
      await masterPrisma.ecole.update({
        where: { id: ecole.id },
        data: updateData
      })
    } catch (masterErr: any) {
      console.warn("[updateSchoolSettingsAction] Master DB sync warning:", masterErr.message)
    }

    return { success: true, school: JSON.parse(JSON.stringify(updated)) }
  } catch (error: any) {
    console.error("Failed to update school settings:", error)
    return { success: false, error: error.message || String(error) }
  }
}
