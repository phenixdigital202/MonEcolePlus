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

  // Return cached client if available
  if (clients[dbUrl]) {
    return clients[dbUrl]
  }

  // Ensure connection string has reasonable connection limit & timeout parameters for serverless
  let formattedUrl = dbUrl
  if (!formattedUrl.includes("connection_limit=")) {
    const separator = formattedUrl.includes("?") ? "&" : "?"
    formattedUrl = `${formattedUrl}${separator}connection_limit=5&pool_timeout=15`
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

  // Store in cache
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
