import { PrismaClient } from "@prisma/client"
import { execSync } from "child_process"

async function main() {
  console.log("==================================================")
  console.log("🔄 SYNCHRONISATION DES SCHÉMAS TENANTS (PRISMA) 🔄")
  console.log("==================================================")

  // 1. Initialiser le client Prisma sur la base Master
  const masterPrisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  })

  try {
    // 2. Récupérer toutes les écoles
    const ecoles = await masterPrisma.ecole.findMany()
    console.log(`Trouvé ${ecoles.length} école(s) à synchroniser.`)

    for (const ecole of ecoles) {
      if (!ecole.database_url) {
        console.log(`⚠️ École ${ecole.nom} (ID: ${ecole.id}) n'a pas de DATABASE_URL. Ignorée.`)
        continue
      }

      console.log(`\n🚀 Synchronisation de l'école : ${ecole.nom}...`)
      console.log(`Database URL: ${ecole.database_url.split("@")[1] || "masquée"}`)

      try {
        // Exécuter 'prisma db push' pour cette base de données spécifique
        execSync("npx prisma db push --skip-generate", {
          env: {
            ...process.env,
            DATABASE_URL: ecole.database_url
          },
          stdio: "inherit"
        })
        console.log(`✅ École ${ecole.nom} synchronisée avec succès.`)
      } catch (err: any) {
        console.error(`❌ Échec de la synchronisation pour ${ecole.nom}:`, err.message)
      }
    }
  } catch (error: any) {
    console.error("❌ Erreur globale lors de la synchronisation :", error.message)
  } finally {
    await masterPrisma.$disconnect()
  }
}

main().catch(console.error)
