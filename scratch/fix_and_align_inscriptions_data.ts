const { getTenantClient } = require("../lib/prisma-tenant")
const masterPrisma = require("../lib/prisma").default

async function main() {
  const masterSchools = await masterPrisma.ecole.findMany()
  console.log(`Found ${masterSchools.length} master schools. Inspecting inscriptions in each tenant DB...`)

  for (const ms of masterSchools) {
    try {
      const tenantPrisma = getTenantClient(ms.database_url)
      const inscriptions = await tenantPrisma.inscription.findMany()
      const incorrectInscriptions = inscriptions.filter(ins => {
        if (!ins.startDate) return false
        const yr = new Date(ins.startDate).getFullYear()
        if (yr >= 2026 && ins.annee_scolaire === '2023-2024') return true
        return false
      })

      if (incorrectInscriptions.length > 0) {
        console.log(`School: ${ms.nom} (ID ${ms.id}, Subdomain: ${ms.subdomain}) -> Found ${incorrectInscriptions.length} inscriptions with annee_scolaire='2023-2024' but startDate in 2026!`)
        for (const ins of incorrectInscriptions) {
          const newAnnee = "2026-2027"
          await tenantPrisma.inscription.update({
            where: { id: ins.id },
            data: { annee_scolaire: newAnnee }
          })
          console.log(`  Updated Inscription ID ${ins.id} -> annee_scolaire: '${newAnnee}'`)
        }
      }
    } catch (e: any) {
      console.log(`Skipping school ID ${ms.id} (${ms.subdomain}): ${e.message.substring(0, 60)}`)
    }
  }

  console.log("Inscription alignment complete.")
}

main().catch(console.error)
