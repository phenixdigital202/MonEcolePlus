import { restoreDatabaseBackup } from "../lib/backup"

async function main() {
  const backupFile = "db_backup_1786059048508.sql.gz"
  console.log(`=== RESTAURATION DE LA SAUVEGARDE ${backupFile} ===\n`)
  
  const res = await restoreDatabaseBackup(backupFile)
  if (res.success) {
    console.log("✅ Restauration réussie !")
  } else {
    console.log(`❌ Échec de la restauration : ${res.error}`)
  }
}

main().catch(console.error)
