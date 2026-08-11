import { headers } from "next/headers"
import masterPrisma from "./prisma"
import { getTenantClient } from "./prisma-tenant"
import { logError } from "./logger"

/**
 * Identifies the current tenant (school) based on stored session context or domain.
 */
export async function getCurrentTenant() {
  try {
    let cookieStore;
    try {
      cookieStore = await import("next/headers").then(m => m.cookies())
    } catch (e) {
      console.log("[getCurrentTenant] No cookie store context available.")
      return null
    }
    
    // Isolation absolue : Aucun traitement de tenant pour le Super Admin
    const userRole = cookieStore.get("user_role")?.value
    const schoolId = cookieStore.get("school_id")?.value
    console.log(`[getCurrentTenant] Session context -> userRole: ${userRole}, schoolId: ${schoolId}`)

    if (userRole === "super_admin") {
      console.log("[getCurrentTenant] Super Admin user -> returning null tenant.")
      return null
    }

    if (schoolId) {
      const parsedId = parseInt(schoolId)
      if (!isNaN(parsedId)) {
        const school = await masterPrisma.ecole.findUnique({
          where: { id: parsedId }
        })
        console.log(`[getCurrentTenant] Resolved school by school_id cookie: ID=${school?.id}, Name=${school?.nom}, hasDbUrl=${!!school?.database_url}`)
        if (school && school.database_url) {
          return school
        }
      }
    }

    const reqHeaders = await headers()
    const referer = reqHeaders.get("referer") || ""
    
    let subdomain = null
    try {
      if (referer) {
        const url = new URL(referer)
        subdomain = url.searchParams.get("subdomain")
      }
    } catch (e) {}
    console.log(`[getCurrentTenant] Referer subdomain lookup -> referer: ${referer}, subdomain parameter: ${subdomain}`)

    if (subdomain) {
      const school = await masterPrisma.ecole.findUnique({
        where: { subdomain }
      })
      console.log(`[getCurrentTenant] Resolved school by subdomain: ID=${school?.id}, Name=${school?.nom}, hasDbUrl=${!!school?.database_url}`)
      if (school && school.database_url) {
        return school
      }
    }
  } catch (error: any) {
    if (error?.digest !== 'DYNAMIC_SERVER_USAGE' && !error?.message?.includes('Dynamic server usage')) {
      logError(error, { action: "getCurrentTenant" })
    }
  }

  console.log("[getCurrentTenant] Resolving returned null.")
  return null
}

export function getMasterPrisma() {
  return masterPrisma
}

export async function getPrisma() {
  // If in CLI/script context, we can override targeting using DATABASE_URL env
  if (process.env.DATABASE_URL && (process.env.DATABASE_URL.includes("tenant_") || process.env.DATABASE_URL.includes("monecole_abou") || process.env.DATABASE_URL.includes("monecole_lyc") || process.env.DATABASE_URL.includes("monecole_bamba") || process.env.DATABASE_URL.includes("monecole_lycee"))) {
    console.log(`[getPrisma] CLI/Script Context override URL matched -> routing to tenant client.`)
    return getTenantClient(process.env.DATABASE_URL)
  }

  let cookieStore;
  let userRole: string | undefined;
  let userId: string | undefined;

  try {
    cookieStore = await import("next/headers").then(m => m.cookies())
    userRole = cookieStore.get("user_role")?.value
    userId = cookieStore.get("user_id")?.value
  } catch (e) {
    console.log("[getPrisma] CLI Context fallback detected -> returning masterPrisma")
    return masterPrisma
  }

  console.log(`[getPrisma] Request context -> userId: ${userId}, userRole: ${userRole}`)

  // Les requêtes Super Admin ne doivent JAMAIS basculer sur une base locataire
  if (userRole === "super_admin") {
    console.log("[getPrisma] Super Admin role -> returning masterPrisma")
    return masterPrisma
  }

  const tenant = await getCurrentTenant()
  if (tenant && tenant.database_url) {
    // Extract logical DB name from URL for logging
    let dbName = "Unknown"
    try {
      const match = tenant.database_url.match(/\/([a-zA-Z0-9_-]+)(?:\?|$)/)
      if (match) dbName = match[1]
    } catch (e) {}
    console.log(`[getPrisma] Successfully resolved tenant client. School: ID=${tenant.id}, Nom=${tenant.nom}, Target DB=${dbName}`)
    return getTenantClient(tenant.database_url)
  }

  console.error(`[getPrisma] CRITICAL resolution failure -> No active tenant found for user ${userId} (Role: ${userRole}). Fallback blocked!`)
  // Interdiction absolue du fallback silencieux vers la Master DB pour un utilisateur d'établissement
  throw new Error("Impossible de déterminer l'établissement de l'utilisateur.")
}
