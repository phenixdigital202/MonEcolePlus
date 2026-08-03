import { MigrationManager } from "../lib/migration-manager"

async function main() {
  console.log("==========================================")
  console.log("🚀 MULTI-TENANT AUTOMATED MIGRATIONS 🚀")
  console.log("==========================================")

  const report = await MigrationManager.migrateAllTenants()

  console.log("\n==========================================")
  console.log("📊 COMPLIANCE & MIGRATION REPORT 📊")
  console.log("==========================================")
  console.log(`Total Tenants Processed : ${report.total}`)
  console.log(`Success Count           : ${report.successCount}`)
  console.log(`Failed Count            : ${report.failedCount}`)
  console.log("Details:")
  report.details.forEach(d => {
    console.log(`- School: ${d.school} | Status: ${d.status} | Duration: ${d.duration}ms ${d.error ? `| Error: ${d.error}` : ""}`)
  })
}

main().catch(console.error)
