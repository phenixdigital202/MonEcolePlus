import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  let url = 
    process.env.DATABASE_URL || 
    process.env.POSTGRES_PRISMA_URL || 
    process.env.POSTGRES_URL || 
    process.env.SUPABASE_DATABASE_URL || 
    process.env.DIRECT_URL || 
    ''

  if (!url) {
    console.error("[Prisma] ATTENTION: Aucune variable d'environnement de base de données (DATABASE_URL / POSTGRES_PRISMA_URL / POSTGRES_URL) n'est définie !")
  }

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
    log: ['error']
  })
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

// Re-use global instance in both production and development to prevent connection leaks
const prisma = globalThis.prisma ?? prismaClientSingleton()
globalThis.prisma = prisma

export default prisma
