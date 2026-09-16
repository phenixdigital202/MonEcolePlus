import masterPrisma from '../lib/prisma'

async function inspectDbUrls() {
  console.log('🔍 INSPECTING MASTER DATABASE ECOLE DATABASE_URLS...\n')
  
  const ecoles = await masterPrisma.ecole.findMany({
    select: {
      id: true,
      nom: true,
      subdomain: true,
      database_url: true
    }
  })

  console.log(`Found ${ecoles.length} schools in Master DB:\n`)
  for (const ecole of ecoles) {
    const rawUrl = ecole.database_url || 'NONE'
    // Redact password for security
    const sanitizedUrl = rawUrl.replace(/:([^:@]+)@/, ':****@')
    console.log(`School ID ${ecole.id} | Nom: "${ecole.nom}" | Subdomain: ${ecole.subdomain} | DB URL: ${sanitizedUrl}`)
  }
}

inspectDbUrls().catch(console.error)
