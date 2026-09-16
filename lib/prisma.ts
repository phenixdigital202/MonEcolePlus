import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  let url = process.env.DATABASE_URL || ''
  if (url.includes('.pooler.supabase.com:5432')) {
    url = url.replace(':5432', ':6543')
    if (!url.includes('pgbouncer=true')) {
      const sep = url.includes('?') ? '&' : '?'
      url = `${url}${sep}pgbouncer=true`
    }
  }
  if (url && !url.includes('connection_limit=')) {
    const sep = url.includes('?') ? '&' : '?'
    url = `${url}${sep}connection_limit=10&pool_timeout=20`
  }

  return new PrismaClient({
    datasources: {
      db: {
        url
      }
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
  })
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

// Re-use global instance in both production and development to prevent connection leaks
const prisma = globalThis.prisma ?? prismaClientSingleton()
globalThis.prisma = prisma

export default prisma
