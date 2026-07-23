import { headers } from "next/headers"
import masterPrisma from "./prisma"
import { getTenantClient } from "./prisma-tenant"
import fs from "fs"
import path from "path"
import { domainToUnicode } from "url"

/**
 * Identifies the current tenant (school) based on the request host (subdomain)
 * or a stored session context.
 */
export async function getCurrentTenant() {
  try {
    const reqHeaders = await headers()
    const cookieStore = await import("next/headers").then(m => m.cookies())
    
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

    // Fallback for signup/onboarding when school is in URL (e.g., success page)
    const host = reqHeaders.get("host") || ""
    const referer = reqHeaders.get("referer") || ""
    
    // Try to find if referer has a subdomain just as a fallback (optional)
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
  } catch (error) {
    console.error("[getCurrentTenant] Error retrieving tenant:", error)
  }

  return null
}

/**
 * Returns the Prisma client for the current tenant.
 * Defaults to the Master client if no tenant is found (e.g. for landing/signup).
 */
export async function getPrisma() {
  try {
    const tenant = await getCurrentTenant()
    
    if (tenant && tenant.database_url) {
      return getTenantClient(tenant.database_url)
    }
  } catch (e) {
    console.error("[getPrisma] Error resolving tenant client, fallback to master:", e)
  }

  return masterPrisma
}
