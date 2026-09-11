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
    let ecole = await tenantPrisma.ecole.findFirst()
    
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

    let updated;
    if (!ecole) {
      // Create ecole stub in Tenant DB if not present
      updated = await tenantPrisma.ecole.create({
        data: updateData
      })
      ecole = updated
    } else {
      updated = await tenantPrisma.ecole.update({
        where: { id: ecole.id },
        data: updateData
      })
    }

    // 3. Sync to Master DB by ID or subdomain
    try {
      const masterSchool = await masterPrisma.ecole.findFirst({
        where: { OR: [{ id: ecole.id }, { subdomain: ecole.subdomain }] }
      })
      if (masterSchool) {
        await masterPrisma.ecole.update({
          where: { id: masterSchool.id },
          data: updateData
        })
      }
    } catch (masterErr: any) {
      console.warn("[updateSchoolSettingsAction] Master DB sync warning:", masterErr.message)
    }

    return { success: true, school: JSON.parse(JSON.stringify(updated)) }
  } catch (error: any) {
    console.error("Failed to update school settings:", error)
    return { success: false, error: error.message || String(error) }
  }
}

export async function updateSchoolLogoAction(logoUrl: string) {
  const { getPrisma } = require("./tenant-context")
  const masterPrisma = require("./prisma").default

  try {
    if (!logoUrl || typeof logoUrl !== "string") {
      return { success: false, error: "URL de logo invalide." }
    }

    const tenantPrisma = await getPrisma()
    const ecole = await tenantPrisma.ecole.findFirst()

    if (!ecole) {
      return { success: false, error: "Établissement introuvable." }
    }

    // 1. Update Tenant DB
    const updated = await tenantPrisma.ecole.update({
      where: { id: ecole.id },
      data: { logo_url: logoUrl }
    })

    // 2. Sync to Master DB
    try {
      await masterPrisma.ecole.update({
        where: { id: ecole.id },
        data: { logo_url: logoUrl }
      })
    } catch (masterErr: any) {
      console.warn("[updateSchoolLogoAction] Master DB sync warning:", masterErr.message)
    }

    console.log(`[updateSchoolLogoAction] Logo updated for school ID=${ecole.id}`)
    return { success: true, logo_url: logoUrl }
  } catch (error: any) {
    console.error("[updateSchoolLogoAction] Error:", error)
    return { success: false, error: error.message || String(error) }
  }
}

export async function updateSchoolCachetAction(cachetUrl: string) {
  const { getPrisma } = require("./tenant-context")
  const masterPrisma = require("./prisma").default

  try {
    if (!cachetUrl || typeof cachetUrl !== "string") {
      return { success: false, error: "URL du cachet invalide." }
    }

    const tenantPrisma = await getPrisma()
    const ecole = await tenantPrisma.ecole.findFirst()

    if (!ecole) {
      return { success: false, error: "Établissement introuvable." }
    }

    // 1. Update Tenant DB
    await tenantPrisma.ecole.update({
      where: { id: ecole.id },
      data: { cachet_url: cachetUrl }
    })

    // 2. Sync to Master DB
    try {
      await masterPrisma.ecole.update({
        where: { id: ecole.id },
        data: { cachet_url: cachetUrl }
      })
    } catch (masterErr: any) {
      console.warn("[updateSchoolCachetAction] Master DB sync warning:", masterErr.message)
    }

    console.log(`[updateSchoolCachetAction] Cachet updated for school ID=${ecole.id}`)
    return { success: true, cachet_url: cachetUrl }
  } catch (error: any) {
    console.error("[updateSchoolCachetAction] Error:", error)
    return { success: false, error: error.message || String(error) }
  }
}

export async function deleteSchoolCachetAction() {
  const { getPrisma } = require("./tenant-context")
  const masterPrisma = require("./prisma").default

  try {
    const tenantPrisma = await getPrisma()
    const ecole = await tenantPrisma.ecole.findFirst()

    if (!ecole) {
      return { success: false, error: "Établissement introuvable." }
    }

    await tenantPrisma.ecole.update({
      where: { id: ecole.id },
      data: { cachet_url: null }
    })

    try {
      await masterPrisma.ecole.update({
        where: { id: ecole.id },
        data: { cachet_url: null }
      })
    } catch (masterErr: any) {
      console.warn("[deleteSchoolCachetAction] Master DB sync warning:", masterErr.message)
    }

    return { success: true }
  } catch (error: any) {
    console.error("[deleteSchoolCachetAction] Error:", error)
    return { success: false, error: error.message || String(error) }
  }
}

