import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function testDatabase() {
  console.log("==========================================")
  console.log("🧪 VALIDATION DES OPÉRATIONS DE LA BASE 🧪")
  console.log("==========================================")

  // 1. Test CRUD Ecole
  console.log("\n1. Test CRUD Écoles...")
  try {
    const testNom = `Lycée Test ${Date.now()}`
    const testSubdomain = `test_${Date.now()}`
    
    // Create
    const ecole = await prisma.ecole.create({
      data: {
        nom: testNom,
        subdomain: testSubdomain,
        plan: "gratuit",
        db_status: "ready"
      }
    })
    console.log(`✅ Création Ecole: OK (ID: ${ecole.id})`)

    // Read
    const found = await prisma.ecole.findUnique({
      where: { id: ecole.id }
    })
    console.log(`✅ Lecture Ecole: ${found ? "OK" : "ÉCHEC"}`)

    // Update
    const updated = await prisma.ecole.update({
      where: { id: ecole.id },
      data: { plan: "standard" }
    })
    console.log(`✅ Mise à jour Ecole (Plan = ${updated.plan}): OK`)

    // Delete
    await prisma.ecole.delete({
      where: { id: ecole.id }
    })
    console.log("✅ Suppression Ecole: OK")
  } catch (err: any) {
    console.error("❌ ÉCHEC Écoles:", err.message)
  }

  // 2. Test BackupLog
  console.log("\n2. Test Sauvegardes...")
  try {
    const filename = `backup_test_${Date.now()}.sql`
    const log = await prisma.backupLog.create({
      data: {
        filename,
        backupType: "database",
        size: "12.5 MB",
        status: "success"
      }
    })
    console.log(`✅ Création BackupLog: OK (ID: ${log.id})`)

    await prisma.backupLog.delete({
      where: { id: log.id }
    })
    console.log("✅ Nettoyage BackupLog: OK")
  } catch (err: any) {
    console.error("❌ ÉCHEC Sauvegardes:", err.message)
  }

  // 3. Test Notification Logs
  console.log("\n3. Test Notification Logs...")
  try {
    const emailLog = await prisma.notificationEmail.create({
      data: {
        to: "test@phenixdigital.ci",
        subject: "Audit Test",
        body: "Corps de test",
        templateName: "test_template",
        status: "pending"
      }
    })
    console.log(`✅ Création NotificationEmail Log: OK (ID: ${emailLog.id})`)

    await prisma.notificationEmail.delete({
      where: { id: emailLog.id }
    })
    console.log("✅ Nettoyage NotificationEmail Log: OK")
  } catch (err: any) {
    console.error("❌ ÉCHEC NotificationEmail:", err.message)
  }

  await prisma.$disconnect()
}

testDatabase().catch(console.error)
