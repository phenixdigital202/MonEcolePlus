import { PrismaClient } from "@prisma/client"

async function auditSchoolSync() {
  const masterPrisma = new PrismaClient()
  const masterSchools = await masterPrisma.ecole.findMany({
    orderBy: { id: 'asc' }
  })

  console.log(`=== MASTER DB SCHOOLS (${masterSchools.length}) ===\n`)
  for (const ms of masterSchools) {
    console.log(`--------------------------------------------------`)
    console.log(`[Master School ID: ${ms.id}] Subdomain: "${ms.subdomain}"`)
    console.log(`  Nom:        "${ms.nom}"`)
    console.log(`  Adresse:    "${ms.adresse}"`)
    console.log(`  Téléphone:  "${ms.telephone}"`)
    console.log(`  Email:      "${ms.email}"`)
    console.log(`  Directeur:  "${ms.directeur}"`)
    console.log(`  Logo:       "${ms.logo_url ? ms.logo_url.slice(0, 30) + '...' : 'null'}"`)
    console.log(`  Cachet:     "${ms.cachet_url ? ms.cachet_url.slice(0, 30) + '...' : 'null'}"`)
    console.log(`  DB URL:     "${ms.database_url ? 'EXISTS' : 'NONE'}"`)

    if (ms.database_url) {
      try {
        let tenantUrl = ms.database_url
        if (process.env.SUPABASE_DIRECT_URL && tenantUrl.includes("pooler.supabase.com")) {
          const dbName = tenantUrl.split("/").pop()?.split("?")[0]
          tenantUrl = `${process.env.SUPABASE_DIRECT_URL}/${dbName}`
        }
        const tenantPrisma = new PrismaClient({
          datasources: { db: { url: tenantUrl } }
        })
        const tenantSchools = await tenantPrisma.ecole.findMany()
        console.log(`  ---> TENANT DB (${tenantSchools.length} record(s)):`)
        for (const ts of tenantSchools) {
          console.log(`       [Tenant record ID: ${ts.id}]`)
          console.log(`         Nom:       "${ts.nom}"`)
          console.log(`         Adresse:   "${ts.adresse}"`)
          console.log(`         Téléphone: "${ts.telephone}"`)
          console.log(`         Email:     "${ts.email}"`)
          console.log(`         Directeur: "${ts.directeur}"`)
          console.log(`         Logo:      "${ts.logo_url ? ts.logo_url.slice(0, 30) + '...' : 'null'}"`)
          console.log(`         Cachet:    "${ts.cachet_url ? ts.cachet_url.slice(0, 30) + '...' : 'null'}"`)
        }
        await tenantPrisma.$disconnect()
      } catch (err: any) {
        console.log(`  ---> TENANT DB ERROR: ${err.message}`)
      }
    }
  }

  await masterPrisma.$disconnect()
  process.exit(0)
}

auditSchoolSync()
