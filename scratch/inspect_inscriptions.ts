const { getTenantClient } = require("../lib/prisma-tenant")
const masterPrisma = require("../lib/prisma").default

async function main() {
  const masterSchool = await masterPrisma.ecole.findFirst({ where: { subdomain: 'abou' } })
  const tenantPrisma = getTenantClient(masterSchool.database_url)

  console.log("=== ALL INSCRIPTIONS IN TENANT DB (ABOU) ===")
  const inscriptions = await tenantPrisma.inscription.findMany({
    include: { classe: true, user: true }
  })
  for (const ins of inscriptions) {
    console.log(`Inscription ID ${ins.id}: User=${ins.user?.nom} (ID ${ins.id_eleve}), Classe=${ins.classe?.nom}, Annee=${ins.annee_scolaire}, Statut=${ins.statut}, Start=${ins.startDate}, End=${ins.endDate}`)
  }

  console.log("\n=== ALL SCHOOL YEARS IN TENANT DB (ABOU) ===")
  const schoolYears = await tenantPrisma.schoolYear.findMany()
  console.log(JSON.stringify(schoolYears, null, 2))
}

main().catch(console.error)
