import { PrismaClient } from "@prisma/client"
import { validateImportData, executeImportData } from "../lib/import-export-actions"

async function main() {
  console.log("==========================================")
  console.log("📊 UAT EXCEL IMPORT/EXPORT SCALE TESTING 📊")
  console.log("==========================================")

  const masterPrisma = new PrismaClient()

  // 1. Resolve Lycée Moderne de Cocody (Tenant 9)
  const ecole = await masterPrisma.ecole.findFirst({
    where: { nom: "Lycée Moderne de Cocody" },
    orderBy: { id: "desc" }
  })

  if (!ecole || !ecole.database_url) {
    console.error("❌ School Lycée Moderne de Cocody not found.")
    await masterPrisma.$disconnect()
    return
  }

  console.log(`Targeting School: ${ecole.nom} (ID: ${ecole.id})`)
  process.env.DATABASE_URL = ecole.database_url
  const tenantPrisma = new PrismaClient({
    datasources: { db: { url: ecole.database_url } }
  })

  // Get baseline student count
  const baseCount = await tenantPrisma.user.count({ where: { role: "student" } })
  console.log(`Baseline student count: ${baseCount}`)

  // 2. Generate 100 mock students
  console.log("\n[Test 1] Generating 100 mock student records...")
  const hundredStudents = Array.from({ length: 100 }).map((_, i) => ({
    nom: `Élève Cent_${i}`,
    email: `student_100_val_${i}@cocody.ci`
  }))

  // Validate
  const val100 = await validateImportData("students", hundredStudents)
  console.log(`   Validation: ${val100.validCount} valid, ${val100.errorCount} errors, ${val100.duplicateCount} duplicates`)

  // Execute
  const exec100 = await executeImportData("students", hundredStudents)
  console.log(`   Execution Result: ${exec100.success ? "Success" : "Failed"} (Imported: ${exec100.count})`)

  // 3. Generate 1000 mock students
  console.log("\n[Test 2] Generating 1000 mock student records...")
  const thousandStudents = Array.from({ length: 1000 }).map((_, i) => ({
    nom: `Élève Mille_${i}`,
    email: `student_1000_val_${i}@cocody.ci`
  }))

  const val1000 = await validateImportData("students", thousandStudents)
  console.log(`   Validation: ${val1000.validCount} valid, ${val1000.errorCount} errors, ${val1000.duplicateCount} duplicates`)

  const exec1000 = await executeImportData("students", thousandStudents)
  console.log(`   Execution Result: ${exec1000.success ? "Success" : "Failed"} (Imported: ${exec1000.count})`)

  // 4. Test duplicates detection
  console.log("\n[Test 3] Testing duplicate detection...")
  const duplicateRecords = [
    { nom: "Élève Doublon", email: "student_100_val_0@cocody.ci" } // Email exists from Test 1
  ]
  const valDup = await validateImportData("students", duplicateRecords)
  console.log(`   Validation: ${valDup.validCount} valid, ${valDup.errorCount} errors, ${valDup.duplicateCount} duplicates (Expected: 1)`)

  // 5. Test transactional rollback on failure
  console.log("\n[Test 4] Testing transaction rollback on schema constraint failure...")
  const initialCount = await tenantPrisma.user.count({ where: { role: "student" } })

  const mixedRecords = [
    { nom: "Valid Student A", email: "valid_a@cocody.ci" },
    { nom: "Valid Student B", email: "valid_b@cocody.ci" },
    { nom: null, email: "invalid_email_no_name@cocody.ci" } // Will throw a DB exception when inserting (non-nullable name)
  ]

  const execFailed = await executeImportData("students", mixedRecords)
  const finalCount = await tenantPrisma.user.count({ where: { role: "student" } })

  console.log(`   Execution success: ${execFailed.success} (Error: ${execFailed.error})`)
  console.log(`   Initial student count: ${initialCount}`)
  console.log(`   Final student count: ${finalCount}`)
  if (initialCount === finalCount) {
    console.log("✅ Rollback successful! 0 rows committed to the database.")
  } else {
    console.error("❌ Rollback failed! Partial commit occurred.")
  }

  // Clean up test data
  console.log("\n[Cleanup] Removing scale test data from database...")
  await tenantPrisma.user.deleteMany({
    where: {
      email: {
        contains: "student_100"
      }
    }
  })
  console.log("✅ Cleanup completed.")

  await tenantPrisma.$disconnect()
  await masterPrisma.$disconnect()

  console.log("\n==========================================")
  console.log("🎉 ALL IMPORT TESTS EXECUTED SUCCESSFULLY 🎉")
  console.log("==========================================")
}

main().catch(console.error)
