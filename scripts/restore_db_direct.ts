import * as fs from "fs"
import * as path from "path"
import * as zlib from "zlib"
import { PrismaClient } from "@prisma/client"

async function main() {
  const dbUrl = "postgresql://postgres.nfrripylvuzxpuipdrpy:MonEcolePlus@aws-0-eu-west-3.pooler.supabase.com:5432/tenant_cocody_1785950690672"
  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } })

  const backupFile = path.join(__dirname, "../backups/db_backup_1786059048508.sql.gz")
  console.log(`=== RESTAURATION SANS TRANSACTION DE ${backupFile} ===\n`)

  if (!fs.existsSync(backupFile)) {
    console.log("❌ Fichier introuvable")
    return
  }

  const compressedData = fs.readFileSync(backupFile)
  const decompressed = zlib.gunzipSync(compressedData)
  const sqlContent = decompressed.toString()

  // Split sql statements
  const statements = sqlContent
    .split(";\n")
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith("--"))

  console.log(`Nombre total d'instructions SQL à exécuter : ${statements.length}`)

  let successCount = 0
  let failCount = 0

  for (const stmt of statements) {
    try {
      // Exécuter chaque instruction individuellement hors d'une transaction globale
      await prisma.$executeRawUnsafe(stmt)
      successCount++
    } catch (err: any) {
      // Ignorer les erreurs courantes comme les doublons
      if (err.message.includes("already exists") || err.message.includes("duplicate key")) {
        // C'est normal si certaines données de configuration existent déjà
        successCount++
      } else {
        console.warn(`⚠️ Échec instruction: ${stmt.substring(0, 100)}... \n   Erreur: ${err.message}`)
        failCount++
      }
    }
  }

  console.log(`\n=== BILAN RESTAURATION ===`)
  console.log(`✅ Succès/Ignorés : ${successCount}`)
  console.log(`❌ Échecs réels    : ${failCount}`)

  const total = await prisma.user.count({ where: { role: "student" } })
  console.log(`Total élèves restaurés en base : ${total}`)

  await prisma.$disconnect()
}

main().catch(console.error)
