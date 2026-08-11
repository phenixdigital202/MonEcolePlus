import { PrismaClient } from "@prisma/client"

// Liste des modèles critiques dont on doit valider l'existence
const CRITICAL_MODELS = [
  "ecole",
  "user",
  "class",
  "schoolYear"
]

interface TenantReport {
  schoolName: string
  subdomain: string
  status: "OK" | "DRIFTED"
  reason?: string
}

async function main() {
  console.log("========================================")
  console.log("MONÉCOLE+ — TENANT SCHEMA VERIFY")
  console.log("========================================\n")

  const masterPrisma = new PrismaClient()
  const reports: TenantReport[] = []
  
  try {
    const ecoles = await masterPrisma.ecole.findMany({
      orderBy: { id: "asc" }
    })

    console.log(`Vérification de ${ecoles.length} écoles...\n`)

    for (const ecole of ecoles) {
      if (!ecole.database_url) {
        console.log(`⚠️  Ignoré : ${ecole.nom} (pas de database_url)\n`)
        reports.push({
          schoolName: ecole.nom,
          subdomain: ecole.subdomain,
          status: "DRIFTED",
          reason: "Aucune database_url définie"
        })
        continue
      }

      // Bypass pgbouncer (port direct 5432 au lieu de 6543)
      let directUrl = ecole.database_url
        .replace(":6543/", ":5432/")
        .replace("?pgbouncer=true", "")

      let success = true
      let failureReason = ""

      // 1. Tester la connexion
      try {
        const tenantPrisma = new PrismaClient({
          datasources: { db: { url: directUrl } }
        })
        await Promise.race([
          tenantPrisma.$queryRaw`SELECT 1`,
          new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout de connexion (5s)")), 5000))
        ])
        
        // 2. Vérifier les tables critiques
        for (const model of CRITICAL_MODELS) {
          await (tenantPrisma as any)[model].findFirst().catch((err: any) => {
            throw new Error(`Modèle [${model}] inaccessible: ${err.message}`)
          })
        }
        await tenantPrisma.$disconnect()
      } catch (err: any) {
        success = false
        failureReason = err.message
      }

      if (success) {
        console.log(`✅ ${ecole.nom} (${ecole.subdomain}) — OK`)
        reports.push({
          schoolName: ecole.nom,
          subdomain: ecole.subdomain,
          status: "OK"
        })
      } else {
        console.log(`❌ ${ecole.nom} (${ecole.subdomain}) — DRIFTED : ${failureReason}`)
        reports.push({
          schoolName: ecole.nom,
          subdomain: ecole.subdomain,
          status: "DRIFTED",
          reason: failureReason
        })
      }
    }
  } catch (globalErr: any) {
    console.error(`❌ Erreur globale lors de la vérification : ${globalErr.message}`)
    process.exit(1)
  } finally {
    await masterPrisma.$disconnect()
  }

  console.log("\n========================================")
  console.log("VERIFY REPORT")
  console.log("========================================")
  let drifted = 0
  let ok = 0
  for (const r of reports) {
    if (r.status === "OK") {
      ok++
    } else {
      drifted++
    }
  }
  console.log(`OK: ${ok}`)
  console.log(`DRIFTED: ${drifted}`)
  console.log(`TOTAL: ${reports.length}`)
  console.log("========================================\n")

  if (drifted > 0) {
    process.exit(1)
  } else {
    process.exit(0)
  }
}

main().catch((err) => {
  console.error("Fatal schema verify error:", err)
  process.exit(1)
})
