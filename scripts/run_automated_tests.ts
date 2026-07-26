import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("==================================================")
  console.log("🧪 DÉMARRAGE DE LA SUITE DE TESTS AUTOMATISÉS 🧪")
  console.log("==================================================")
  
  let passedTests = 0
  let failedTests = 0

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ [PASS] : ${testName}`)
      passedTests++
    } else {
      console.error(`❌ [FAIL] : ${testName}`)
      failedTests++
    }
  }

  // --- Test 1 : Connectivité de la Base de Données ---
  try {
    const rawResult = await prisma.$queryRaw`SELECT 1 as test`
    assert(Array.isArray(rawResult) && rawResult.length > 0, "Test 1 : Connexion brute à la base de données Supabase")
  } catch (error: any) {
    assert(false, `Test 1 : Connexion brute échouée : ${error.message}`)
  }

  // --- Test 2 : Modèle User (Sélection) ---
  try {
    const usersCount = await prisma.user.count()
    assert(usersCount >= 0, `Test 2 : Lecture de la table Users (Count = ${usersCount})`)
  } catch (error: any) {
    assert(false, `Test 2 : Échec de la lecture de la table Users : ${error.message}`)
  }

  // --- Test 3 : Modèle EmploiDuTemps & Conflits ---
  try {
    const scheduleCount = await prisma.emploiDuTemps.count()
    assert(scheduleCount >= 0, `Test 3 : Lecture de la table EmploiDuTemps (Count = ${scheduleCount})`)
  } catch (error: any) {
    assert(false, `Test 3 : Échec de la lecture de la table EmploiDuTemps : ${error.message}`)
  }

  // --- Test 4 : Modèle Outbox Emails ---
  try {
    const emailCount = await prisma.notificationEmail.count()
    assert(emailCount >= 0, `Test 4 : Lecture de l'historique des emails (Count = ${emailCount})`)
  } catch (error: any) {
    assert(false, `Test 4 : Échec de la lecture de la table NotificationEmail : ${error.message}`)
  }

  // --- Test 5 : Modèle Outbox WhatsApp ---
  try {
    const waCount = await prisma.notificationWhatsapp.count()
    assert(waCount >= 0, `Test 5 : Lecture de l'historique WhatsApp (Count = ${waCount})`)
  } catch (error: any) {
    assert(false, `Test 5 : Échec de la lecture de la table NotificationWhatsapp : ${error.message}`)
  }

  // --- Test 6 : Modèle Sauvegardes DB ---
  try {
    const backupCount = await prisma.backupLog.count()
    assert(backupCount >= 0, `Test 6 : Lecture de l'historique des sauvegardes (Count = ${backupCount})`)
  } catch (error: any) {
    assert(false, `Test 6 : Échec de la lecture de la table BackupLog : ${error.message}`)
  }

  // --- Rapport final ---
  console.log("\n==================================================")
  console.log("📊 BILAN DE L'EXÉCUTION DES TESTS AUTOMATISÉS 📊")
  console.log(`Réussis : ${passedTests} / Échoués : ${failedTests}`)
  console.log("==================================================")

  await prisma.$disconnect()
  
  if (failedTests > 0) {
    process.exit(1)
  } else {
    process.exit(0)
  }
}

main().catch(async (e) => {
  console.error("Test execution aborted with fatal error:", e)
  await prisma.$disconnect()
  process.exit(1)
})
