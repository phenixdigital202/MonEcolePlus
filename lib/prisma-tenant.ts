import { PrismaClient } from '@prisma/client'

// Cache for Prisma clients to avoid connection leaks
const clients: Record<string, PrismaClient> = {}

/**
 * Gets a Prisma client for a specific tenant based on their database URL.
 * In a real SaaS, this URL would come from the 'Master' database.
 */
export function getTenantClient(dbUrl: string): PrismaClient {
  if (!dbUrl) {
    throw new Error("No database URL provided for tenant")
  }

  // Return cached client if available
  if (clients[dbUrl]) {
    return clients[dbUrl]
  }

  // Create new client with override datasource
  const client = new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
  })

  // Store in cache
  clients[dbUrl] = client
  
  return client
}

/**
 * Cleanup function for serverless environments (if needed)
 */
export async function cleanupTenantClients() {
  for (const url in clients) {
    await clients[url].$disconnect()
    delete clients[url]
  }
}
