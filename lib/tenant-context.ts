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
  const reqHeaders = await headers()
  const host = reqHeaders.get("host") || ""
  const referer = reqHeaders.get("referer") || ""
  // 1. Identification via subdomain (SaaS Mode)
  const hostname = host.split(':')[0]
  const parts = hostname.split('.')
  
  let subdomain = null
  
  if (parts.length > 1) {
    try {
      subdomain = domainToUnicode(parts[0])
    } catch (e) {
      subdomain = parts[0]
    }
  }

  // Ignore 'www'
  if (subdomain === 'www') {
    subdomain = null
  }

  // Local development hack: if on localhost without subdomain, default to 'lycee-abou'
  if (!subdomain && (hostname === 'localhost' || hostname === '127.0.0.1')) {
    subdomain = 'lycee-abou'
  }

  // 2. Fallback to Referer (Critical for Server Actions on localhost)
  if (!subdomain && referer) {
    try {
      const refUrl = new URL(referer)
      const refHost = refUrl.host.split(':')[0]
      const refParts = refHost.split('.')
      if (refParts.length > 1 && refParts[0] !== 'www' && refParts[0] !== 'localhost') {
        subdomain = refParts[0]
      }
    } catch(e) {}
  }

  console.log('[Tenant Context] Host:', host, 'Hostname:', hostname, 'Parts:', parts, 'Resolved Subdomain:', subdomain);

  if (!subdomain) {
    return null
  }

  // Lookup in Master
  const school = await masterPrisma.ecole.findUnique({
    where: { subdomain }
  })

  if (!school || !school.database_url) {
    return null
  }

  return school
}

/**
 * Returns the Prisma client for the current tenant.
 * Defaults to the Master client if no tenant is found (e.g. for landing/signup).
 */
export async function getPrisma() {
  const tenant = await getCurrentTenant()
  
  if (tenant && tenant.database_url) {
    return getTenantClient(tenant.database_url)
  }

  return masterPrisma
}
