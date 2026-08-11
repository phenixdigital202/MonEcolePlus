import { PrismaClient } from "@prisma/client"
import { execSync } from "child_process"

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
  status: "SYNC" | "FAILED"
  reason?: string
}

async function main() {
  console.log("========================================")
  console.log("MONÉCOLE+ — TENANT SCHEMA SYNC")
  console.log("========================================\n")

  const masterPrisma = new PrismaClient()
  const reports: TenantReport[] = []
  
  try {
    const ecoles = await masterPrisma.ecole.findMany({
      orderBy: { id: "asc" }
    })

    console.log(`Trouvé ${ecoles.length} écoles enregistrées.\n`)

    for (const ecole of ecoles) {
      if (!ecole.database_url) {
        console.log(`⚠️  Ignoré : ${ecole.nom} (pas de database_url)\n`)
        reports.push({
          schoolName: ecole.nom,
          subdomain: ecole.subdomain,
          status: "FAILED",
          reason: "Aucune database_url définie"
        })
        continue
      }

      console.log(`⚙️  Synchronisation de : ${ecole.nom} (${ecole.subdomain})`)

      // Tester et transformer l'URL pour bypass pgbouncer (port direct 5432 au lieu de 6543)
      let directUrl = ecole.database_url
        .replace(":6543/", ":5432/")
        .replace("?pgbouncer=true", "")

      // Ne jamais synchroniser sur la base Master DB
      const masterDbName = process.env.DATABASE_URL?.split("/").pop()?.split("?")[0]
      const tenantDbName = directUrl.split("/").pop()?.split("?")[0]
      
      if (masterDbName && tenantDbName === masterDbName) {
        console.error(`❌ ERREUR : La base tenant cible est identique à la Master DB (${tenantDbName}). Synchronisation bloquée.`);
        reports.push({
          schoolName: ecole.nom,
          subdomain: ecole.subdomain,
          status: "FAILED",
          reason: "L'URL pointe vers la base Master"
        })
        continue
      }

      let success = true
      let failureReason = ""

      // 1. Tester la connexion PostgreSQL et la structure de base
      try {
        const tenantPrisma = new PrismaClient({
          datasources: { db: { url: directUrl } }
        })
        // Timeout simple de connexion via query brute
        await Promise.race([
          tenantPrisma.$queryRaw`SELECT 1`,
          new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout de connexion (5s)")), 5000))
        ])
        await tenantPrisma.$disconnect()
      } catch (connErr: any) {
        success = false
        failureReason = `Connexion échouée: ${connErr.message}`
        console.error(`  ❌ ${failureReason}`)
      }

      // 2. Si connexion OK, appliquer prisma db push
      if (success) {
        try {
          console.log(`  🔄 Alignement du schéma avec prisma db push...`)
          execSync("node node_modules/prisma/build/index.js db push --accept-data-loss --skip-generate", {
            env: {
              ...process.env,
              DATABASE_URL: directUrl,
              PRISMA_SKIP_ENV_VAR_LOAD: "1"
            },
            stdio: "pipe"
          })
        } catch (pushErr: any) {
          success = false
          const stderr = pushErr.stderr?.toString() || ""
          failureReason = `Prisma Push Failed: ${stderr || pushErr.message}`
          console.error(`  ❌ ${failureReason}`)
        }
      }

      // 3. Valider l'intégrité et la présence de chaque table/modèle critique
      if (success) {
        try {
          console.log(`  🔍 Vérification des tables critiques...`)
          const tenantPrisma = new PrismaClient({
            datasources: { db: { url: directUrl } }
          })
          
          for (const model of CRITICAL_MODELS) {
            // Requête dynamique sur le modèle
            await (tenantPrisma as any)[model].findFirst().catch((err: any) => {
              throw new Error(`Modèle critique [${model}] inaccessible: ${err.message}`)
            })
          }
          await tenantPrisma.$disconnect()
          console.log(`  ✅ Toutes les tables critiques sont validées.`)
        } catch (tableErr: any) {
          success = false
          failureReason = tableErr.message
          console.error(`  ❌ Validation échouée : ${failureReason}`)
        }
      }

      if (success) {
        console.log(`  🎉 Synchronisé avec succès.\n`)
        reports.push({
          schoolName: ecole.nom,
          subdomain: ecole.subdomain,
          status: "SYNC"
        })
      } else {
        console.log(`\n`)
        reports.push({
          schoolName: ecole.nom,
          subdomain: ecole.subdomain,
          status: "FAILED",
          reason: failureReason
        })
      }
    }
  } catch (globalErr: any) {
    console.error(`❌ Erreur globale : ${globalErr.message}`)
    process.exit(1)
  } finally {
    await masterPrisma.$disconnect()
  }

  // Affichage du rapport final
  console.log("========================================")
  console.log("MONÉCOLE+ — SCHEMA SYNC REPORT")
  console.log("========================================")

  let successCount = 0
  let failedCount = 0

  for (let i = 0; i < reports.length; i++) {
    const r = reports[i]
    if (r.status === "SYNC") {
      successCount++
      console.log(`✅ Tenant ${i + 1} — ${r.schoolName} (${r.subdomain}) — SYNC`)
    } else {
      failedCount++
      console.log(`⚠️  Tenant ${i + 1} — ${r.schoolName} (${r.subdomain}) — FAILED`)
      console.log(`   Reason: ${r.reason}`)
    }
  }

  console.log("\n========================================")
  console.log("RESULT")
  console.log("========================================")
  console.log(`SUCCESS: ${successCount}`)
  console.log(`FAILED: ${failedCount}`)
  console.log(`TOTAL: ${reports.length}`)
  console.log("========================================\n")

  if (failedCount > 0) {
    process.exit(1)
  } else {
    process.exit(0)
  }
}

main().catch((err) => {
  console.error("Fatal schema sync error:", err)
  process.exit(1)
})
