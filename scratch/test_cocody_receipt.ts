const { getTenantClient } = require("../lib/prisma-tenant")
const masterPrisma = require("../lib/prisma").default

async function main() {
  const masterSchool = await masterPrisma.ecole.findFirst({ where: { subdomain: 'cocody_1785950690672' } })
  const tenantPrisma = getTenantClient(masterSchool.database_url)

  console.log("=== TESTING RECEIPT DETAILS FOR COCODY TENANT ===")
  const school = await tenantPrisma.ecole.findFirst()
  console.log("School in Tenant DB:")
  console.log("  Nom:", school?.nom)
  console.log("  Adresse:", school?.adresse)
  console.log("  Téléphone:", school?.telephone)
  console.log("  Email:", school?.email)

  const payment = await tenantPrisma.paiement.findFirst({
    include: {
      user: {
        include: {
          inscriptions: {
            include: { classe: true }
          }
        }
      }
    }
  })

  console.log(`Payment #${payment?.id} user:`, payment?.user?.nom)
  for (const ins of payment?.user?.inscriptions || []) {
    console.log(`  Inscription classe=${ins.classe?.nom} annee_scolaire=${ins.annee_scolaire} start=${ins.startDate}`)
  }
}

main().catch(console.error)
