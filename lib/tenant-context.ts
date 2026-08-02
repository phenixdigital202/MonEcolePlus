import { headers } from "next/headers"
import masterPrisma from "./prisma"
import { getTenantClient } from "./prisma-tenant"
import { logError } from "./logger"

/**
 * Identifies the current tenant (school) based on stored session context or domain.
 */
export async function getCurrentTenant() {
  try {
    const cookieStore = await import("next/headers").then(m => m.cookies())
    
    // Isolation absolue : Aucun traitement de tenant pour le Super Admin
    const userRole = cookieStore.get("user_role")?.value
    if (userRole === "super_admin") {
      return null
    }

    const schoolId = cookieStore.get("school_id")?.value

    if (schoolId) {
      const parsedId = parseInt(schoolId)
      if (!isNaN(parsedId)) {
        const school = await masterPrisma.ecole.findUnique({
          where: { id: parsedId }
        })
        
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

    if (subdomain) {
      const school = await masterPrisma.ecole.findUnique({
        where: { subdomain }
      })
      if (school && school.database_url) {
        return school
      }
    }
  } catch (error: any) {
    if (error?.digest !== 'DYNAMIC_SERVER_USAGE' && !error?.message?.includes('Dynamic server usage')) {
      logError(error, { action: "getCurrentTenant" })
    }
  }

  return null
}

/**
 * Returns the Prisma client for the current tenant.
 * Defaults to the Master client if no tenant is found or on connection error.
 */
export async function getPrisma() {
  try {
    const cookieStore = await import("next/headers").then(m => m.cookies())
    const userRole = cookieStore.get("user_role")?.value
    
    // Les requêtes Super Admin ne doivent JAMAIS basculer sur une base locataire
    if (userRole === "super_admin") {
      return masterPrisma
    }

    const tenant = await getCurrentTenant()
    
    if (tenant && tenant.database_url) {
      return getTenantClient(tenant.database_url)
    }
  } catch (e: any) {
    if (e?.digest !== 'DYNAMIC_SERVER_USAGE' && !e?.message?.includes('Dynamic server usage')) {
      logError(e, { action: "getPrisma_fallback_to_master" })
    }
  }

  return masterPrisma
}
