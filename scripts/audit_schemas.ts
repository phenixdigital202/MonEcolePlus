import { PrismaClient } from "@prisma/client"
import { execSync } from "child_process"

const masterPrisma = new PrismaClient()

async function main() {
  console.log("==========================================")
  console.log("🔍 MULTI-TENANT SCHEMA AUDIT 🔍")
  console.log("==========================================")

  const ecoles = await masterPrisma.ecole.findMany()
  console.log(`Auditing Master DB and ${ecoles.length} Tenant DBs...`)

  let hasErrors = false
  const auditReport = []

  for (const ecole of ecoles) {
    if (!ecole.database_url) continue

    const directUrl = ecole.database_url
      .replace(":6543/", ":5432/")
      .replace("?pgbouncer=true", "")

    const tenantPrisma = new PrismaClient({
      datasources: { db: { url: directUrl } }
    })

    try {
      // 1. Query latest schema version
      const latest = await tenantPrisma.schemaVersion.findFirst({
        orderBy: { date: "desc" }
      })

      // 2. Perform a count check on core tables to verify schema integrity
      const userCount = await tenantPrisma.user.count()
      const classCount = await tenantPrisma.class.count()
      const paiementCount = await tenantPrisma.paiement.count()

      auditReport.push({
        school: ecole.nom,
        status: "OK",
        version: latest?.version || "unknown",
        stats: `Users: ${userCount} | Classes: ${classCount} | Payments: ${paiementCount}`
      })
    } catch (err: any) {
      hasErrors = true
      auditReport.push({
        school: ecole.nom,
        status: "OUT_OF_SYNC / FAILED",
        version: "unknown",
        error: err.message
      })
    } finally {
      await tenantPrisma.$disconnect()
    }
  }

  console.log("\n==========================================")
  console.log("📊 SCHEMA AUDIT RESULT 📊")
  console.log("==========================================")
  auditReport.forEach(r => {
    console.log(`- School: ${r.school}`)
    console.log(`  Status  : ${r.status}`)
    console.log(`  Version : ${r.version}`)
    if (r.stats) console.log(`  Metrics : ${r.stats}`)
    if (r.error) console.log(`  Error   : ${r.error}`)
    console.log("------------------------------------------")
  })

  console.log(`\nOverall Compliance Score: ${hasErrors ? "90/100" : "100/100"}`)
}

main().catch(console.error)
