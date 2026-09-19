const { getTenantClient } = require("../lib/prisma-tenant")
const masterPrisma = require("../lib/prisma").default

async function main() {
  console.log("=== CHECKING MASTER DB SCHOOLS AND THEIR TENANT DBS ===")
  const masterSchools = await masterPrisma.ecole.findMany()
  
  for (const ms of masterSchools) {
    if (ms.subdomain === 'abou' || ms.subdomain === 'cocody_1785950690672') {
      console.log(`\n=======================================`)
      console.log(`SCHOOL: ${ms.nom} (ID Master: ${ms.id}, Subdomain: ${ms.subdomain})`)
      console.log(`Master DB values:`)
      console.log(`  Nom: "${ms.nom}"`)
      console.log(`  Adresse: "${ms.adresse}"`)
      console.log(`  Téléphone: "${ms.telephone}"`)
      console.log(`  Email: "${ms.email}"`)
      console.log(`  Website: "${ms.website}"`)
      console.log(`  Directeur: "${ms.directeur}"`)
      console.log(`  Logo: ${ms.logo_url ? ms.logo_url.substring(0, 30) + '...' : null}`)
      console.log(`  Cachet: ${ms.cachet_url ? ms.cachet_url.substring(0, 30) + '...' : null}`)
      console.log(`  Database URL: ${ms.database_url}`)

      try {
        const tenantPrisma = getTenantClient(ms.database_url)
        const tenantEcole = await tenantPrisma.ecole.findFirst()
        console.log(`Tenant DB ecole table values:`)
        if (tenantEcole) {
          console.log(`  Nom: "${tenantEcole.nom}"`)
          console.log(`  Adresse: "${tenantEcole.adresse}"`)
          console.log(`  Téléphone: "${tenantEcole.telephone}"`)
          console.log(`  Email: "${tenantEcole.email}"`)
          console.log(`  Website: "${tenantEcole.website}"`)
          console.log(`  Directeur: "${tenantEcole.directeur}"`)
          console.log(`  Logo: ${tenantEcole.logo_url ? tenantEcole.logo_url.substring(0, 30) + '...' : null}`)
          console.log(`  Cachet: ${tenantEcole.cachet_url ? tenantEcole.cachet_url.substring(0, 30) + '...' : null}`)
        } else {
          console.log(`  (NO ECOLE ROW IN TENANT DB!)`)
        }

        const activeYear = await tenantPrisma.schoolYear.findFirst({ where: { status: 'ACTIVE' } })
        console.log(`  Active SchoolYear in Tenant DB: ${activeYear?.label || 'NONE'}`)

        const payments = await tenantPrisma.paiement.findMany({
          take: 3,
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
        console.log(`  Payments in Tenant DB (${payments.length} found):`)
        for (const p of payments) {
          console.log(`    Paiement #${p.id} date=${p.date_paiement} montant=${p.montant} user=${p.user?.nom}`)
          for (const ins of p.user?.inscriptions || []) {
            console.log(`      Inscription #${ins.id} classe=${ins.classe?.nom} annee=${ins.annee_scolaire} start=${ins.startDate} end=${ins.endDate} status=${ins.statut}`)
          }
        }

      } catch (err: any) {
        console.error(`  Error connecting to tenant DB: ${err.message}`)
      }
    }
  }
}

main().catch(console.error)
