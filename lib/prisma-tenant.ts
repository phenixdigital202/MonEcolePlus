import { PrismaClient } from '@prisma/client'

declare global {
  var tenantClients: Record<string, PrismaClient> | undefined
}

// ALWAYS use globalThis cache to prevent connection leaks across serverless lambdas in production
const clients: Record<string, PrismaClient> = globalThis.tenantClients || {}
globalThis.tenantClients = clients

/**
 * Gets a Prisma client for a specific tenant based on their database URL.
 * Reuses cached client instance across serverless invocations.
 */
export function getTenantClient(dbUrl: string): PrismaClient {
  if (!dbUrl) {
    throw new Error("No database URL provided for tenant")
  }

  // Ensure connection string uses Transaction Pooler (port 6543) if pointing to Supabase pooler host
  let formattedUrl = dbUrl
  if (formattedUrl.includes(".pooler.supabase.com:5432")) {
    formattedUrl = formattedUrl.replace(":5432", ":6543")
    if (!formattedUrl.includes("pgbouncer=true")) {
      const sep = formattedUrl.includes("?") ? "&" : "?"
      formattedUrl = `${formattedUrl}${sep}pgbouncer=true`
    }
  }

  if (!formattedUrl.includes("connection_limit=")) {
    const separator = formattedUrl.includes("?") ? "&" : "?"
    formattedUrl = `${formattedUrl}${separator}connection_limit=10&pool_timeout=20`
  }

  // Return cached client if available (check both key variations)
  if (clients[formattedUrl]) {
    return clients[formattedUrl]
  }
  if (clients[dbUrl]) {
    return clients[dbUrl]
  }

  // Create new client with override datasource
  const client = new PrismaClient({
    datasources: {
      db: {
        url: formattedUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
  })

  // Store in global cache
  clients[formattedUrl] = client
  clients[dbUrl] = client
  
  return client
}

/**
 * Cleanup function for serverless environments
 */
export async function cleanupTenantClients() {
  for (const url in clients) {
    try {
      await clients[url].$disconnect()
    } catch (e) {
      console.error("[cleanupTenantClients] Disconnect error:", e)
    }
    delete clients[url]
  }
}
