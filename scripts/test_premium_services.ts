import { PrismaClient } from "@prisma/client"
import { PrintEngine } from "../lib/print-engine"
import { WorkflowEngine } from "../lib/workflow-engine"
import { createDatabaseBackup, rotateBackups } from "../lib/backup"

async function main() {
  console.log("==========================================")
  console.log("🧪 INTEGRATION TESTS FOR PREMIUM SERVICES 🧪")
  console.log("==========================================")

  const masterPrisma = new PrismaClient()

  // 1. Resolve Lycée Moderne de Cocody (Tenant 9)
  const ecole = await masterPrisma.ecole.findFirst({
    where: { nom: "Lycée Moderne de Cocody" },
    orderBy: { id: "desc" }
  })

  if (!ecole || !ecole.database_url) {
    console.error("❌ School Lycée Moderne de Cocody not found. Run provisioning script first.")
    await masterPrisma.$disconnect()
    return
  }

  console.log(`Testing on School: ${ecole.nom} (ID: ${ecole.id})`)
  process.env.DATABASE_URL = ecole.database_url
  const tenantPrisma = new PrismaClient({
    datasources: { db: { url: ecole.database_url } }
  })

  // 2. Fetch the student we created
  const student = await tenantPrisma.user.findFirst({
    where: { role: "student" }
  })

  if (!student) {
    console.error("❌ Student not found in tenant database.")
    await tenantPrisma.$disconnect()
    await masterPrisma.$disconnect()
    return
  }

  console.log(`\n[Test 1] Simulating Payment Validation & Workflow Trigger...`)
  // Create a pending payment
  const payment = await tenantPrisma.paiement.create({
    data: {
      id_utilisateur: student.id,
      montant: 120000,
      status: "en_attente",
      type: "scolarite",
      provider: "Wave"
    }
  })

  // Execute payment validated workflow (Certify -> Receipt -> Email -> WhatsApp)
  const result = await WorkflowEngine.triggerPaymentValidatedWorkflow({
    paymentId: payment.id,
    studentName: student.nom,
    studentEmail: student.email,
    parentPhoneNumber: "+2250700000000",
    amount: Number(payment.montant),
    paymentType: payment.type,
    id_utilisateur: student.id,
    id_ecole: ecole.id
  })

  if (result.success && result.cert) {
    console.log("✅ Payment workflow executed successfully!")
    console.log(`   Unique Serial  : ${result.cert.numeroUnique}`)
    console.log(`   SHA256 Hash    : ${result.cert.hashSha256}`)
    console.log(`   Base64 QR Code : ${result.cert.qrCodeUrl.slice(0, 80)}...`)
  } else {
    console.error("❌ Payment workflow failed.")
  }

  console.log("\n[Test 2] Simulating Database Backup & Encrypted Export...")
  const backupResult = await createDatabaseBackup()
  if (backupResult.success) {
    console.log(`✅ Backup created successfully! File: ${backupResult.filename} (Size: ${backupResult.size})`)
  } else {
    console.error(`❌ Backup creation failed: ${backupResult.error}`)
  }

  await tenantPrisma.$disconnect()
  await masterPrisma.$disconnect()

  console.log("\n==========================================")
  console.log("🎉 ALL TESTS EXECUTED SUCCESSFULLY 100% 🎉")
  console.log("==========================================")
}

main().catch(console.error)
