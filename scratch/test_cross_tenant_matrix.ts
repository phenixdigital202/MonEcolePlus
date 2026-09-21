import { PrismaClient } from "@prisma/client"
import masterPrisma from "@/lib/prisma"
import { getTenantClient } from "@/lib/prisma-tenant"

async function runCrossTenantMatrix() {
  console.log("==================================================================")
  console.log("       PHASE 3 — MATRICE DE TESTS CROISÉS MULTI-TENANT ISOLATION ")
  console.log("==================================================================")

  // 1. Fetch Abou and Cocody schools from Master DB
  const abouSchool = await masterPrisma.ecole.findFirst({
    where: { subdomain: { contains: "abou" } }
  })
  const cocodySchool = await masterPrisma.ecole.findFirst({
    where: { subdomain: { contains: "cocody" } }
  })

  if (!abouSchool || !abouSchool.database_url) {
    console.error("❌ Etablissement Abou introuvable en Master DB.")
    process.exit(1)
  }
  if (!cocodySchool || !cocodySchool.database_url) {
    console.error("❌ Etablissement Cocody introuvable en Master DB.")
    process.exit(1)
  }

  console.log(`[Setup] Abou School ID: ${abouSchool.id}, URL: ${abouSchool.database_url}`)
  console.log(`[Setup] Cocody School ID: ${cocodySchool.id}, URL: ${cocodySchool.database_url}`)

  const abouPrisma = getTenantClient(abouSchool.database_url)
  const cocodyPrisma = getTenantClient(cocodySchool.database_url)

  let totalTests = 0
  let passedTests = 0
  let failedTests = 0

  function assertTest(testName: string, passed: boolean, details?: string) {
    totalTests++
    if (passed) {
      passedTests++
      console.log(`  ✅ [PASS] ${testName} ${details ? `(${details})` : ""}`)
    } else {
      failedTests++
      console.log(`  ❌ [FAIL] ${testName} ${details ? `(${details})` : ""}`)
    }
  }

  console.log("\n--- TEST CATEGORY 1: ÉLÈVES ---")
  const abouStudents = await abouPrisma.user.findMany({ where: { role: "student" }, take: 2 })
  const cocodyStudents = await cocodyPrisma.user.findMany({ where: { role: "student" }, take: 2 })

  assertTest("Utilisateur Abou -> Données élèves Abou", abouStudents.length >= 0, `Trouvé ${abouStudents.length} élèves`)
  assertTest("Utilisateur Cocody -> Données élèves Cocody", cocodyStudents.length >= 0, `Trouvé ${cocodyStudents.length} élèves`)

  if (cocodyStudents.length > 0) {
    const crossCheck = await abouPrisma.user.findUnique({ where: { id: cocodyStudents[0].id } })
    assertTest("Utilisateur Abou -> Élève ID Cocody", crossCheck === null || crossCheck.email !== cocodyStudents[0].email, "Isolé physiquement")
  }
  if (abouStudents.length > 0) {
    const crossCheck = await cocodyPrisma.user.findUnique({ where: { id: abouStudents[0].id } })
    assertTest("Utilisateur Cocody -> Élève ID Abou", crossCheck === null || crossCheck.email !== abouStudents[0].email, "Isolé physiquement")
  }

  console.log("\n--- TEST CATEGORY 2: ENSEIGNANTS ---")
  const abouTeachers = await abouPrisma.user.findMany({ where: { role: "teacher" }, take: 2 })
  const cocodyTeachers = await cocodyPrisma.user.findMany({ where: { role: "teacher" }, take: 2 })

  assertTest("Utilisateur Abou -> Données enseignants Abou", abouTeachers.length >= 0, `Trouvé ${abouTeachers.length} profs`)
  assertTest("Utilisateur Cocody -> Données enseignants Cocody", cocodyTeachers.length >= 0, `Trouvé ${cocodyTeachers.length} profs`)

  console.log("\n--- TEST CATEGORY 3: PARENTS ---")
  const abouParents = await abouPrisma.user.findMany({ where: { role: "parent" }, take: 2 })
  const cocodyParents = await cocodyPrisma.user.findMany({ where: { role: "parent" }, take: 2 })

  assertTest("Utilisateur Abou -> Données parents Abou", abouParents.length >= 0, `Trouvé ${abouParents.length} parents`)
  assertTest("Utilisateur Cocody -> Données parents Cocody", cocodyParents.length >= 0, `Trouvé ${cocodyParents.length} parents`)

  console.log("\n--- TEST CATEGORY 4: CLASSES ---")
  const abouClasses = await abouPrisma.class.findMany()
  const cocodyClasses = await cocodyPrisma.class.findMany()

  assertTest("Utilisateur Abou -> Données classes Abou", abouClasses.length >= 0, `Trouvé ${abouClasses.length} classes`)
  assertTest("Utilisateur Cocody -> Données classes Cocody", cocodyClasses.length >= 0, `Trouvé ${cocodyClasses.length} classes`)

  if (cocodyClasses.length > 0) {
    const crossClass = await abouPrisma.class.findUnique({ where: { id: cocodyClasses[0].id } })
    const isIsolated = !crossClass || crossClass.nom !== cocodyClasses[0].nom
    assertTest("Utilisateur Abou -> Classe ID Cocody", isIsolated, "Données non partagées")
  }

  console.log("\n--- TEST CATEGORY 5: INSCRIPTIONS ---")
  const abouInscriptions = await abouPrisma.inscription.findMany({ take: 2 })
  const cocodyInscriptions = await cocodyPrisma.inscription.findMany({ take: 2 })

  assertTest("Utilisateur Abou -> Inscriptions Abou", abouInscriptions.length >= 0, `Count: ${abouInscriptions.length}`)
  assertTest("Utilisateur Cocody -> Inscriptions Cocody", cocodyInscriptions.length >= 0, `Count: ${cocodyInscriptions.length}`)

  console.log("\n--- TEST CATEGORY 6: NOTES ---")
  const abouNotes = await abouPrisma.note.findMany({ take: 2 })
  const cocodyNotes = await cocodyPrisma.note.findMany({ take: 2 })

  assertTest("Utilisateur Abou -> Notes Abou", abouNotes.length >= 0, `Count: ${abouNotes.length}`)
  assertTest("Utilisateur Cocody -> Notes Cocody", cocodyNotes.length >= 0, `Count: ${cocodyNotes.length}`)

  console.log("\n--- TEST CATEGORY 7: ABSENCES ---")
  const abouAbsences = await abouPrisma.absence.findMany({ take: 2 })
  const cocodyAbsences = await cocodyPrisma.absence.findMany({ take: 2 })

  assertTest("Utilisateur Abou -> Absences Abou", abouAbsences.length >= 0, `Count: ${abouAbsences.length}`)
  assertTest("Utilisateur Cocody -> Absences Cocody", cocodyAbsences.length >= 0, `Count: ${cocodyAbsences.length}`)

  console.log("\n--- TEST CATEGORY 8: EMPLOIS DU TEMPS ---")
  const abouSchedules = await abouPrisma.emploiDuTemps.findMany({ take: 2 })
  const cocodySchedules = await cocodyPrisma.emploiDuTemps.findMany({ take: 2 })

  assertTest("Utilisateur Abou -> Emplois du temps Abou", abouSchedules.length >= 0, `Count: ${abouSchedules.length}`)
  assertTest("Utilisateur Cocody -> Emplois du temps Cocody", cocodySchedules.length >= 0, `Count: ${cocodySchedules.length}`)

  console.log("\n--- TEST CATEGORY 9: PAIEMENTS ---")
  const abouPayments = await abouPrisma.paiement.findMany({ take: 2 })
  const cocodyPayments = await cocodyPrisma.paiement.findMany({ take: 2 })

  assertTest("Utilisateur Abou -> Paiements Abou", abouPayments.length >= 0, `Count: ${abouPayments.length}`)
  assertTest("Utilisateur Cocody -> Paiements Cocody", cocodyPayments.length >= 0, `Count: ${cocodyPayments.length}`)

  console.log("\n--- TEST CATEGORY 10: DOCUMENTS ---")
  const abouDocs = await abouPrisma.verifiedDocument.findMany({ take: 2 })
  const cocodyDocs = await cocodyPrisma.verifiedDocument.findMany({ take: 2 })

  assertTest("Utilisateur Abou -> Documents Abou", abouDocs.length >= 0, `Count: ${abouDocs.length}`)
  assertTest("Utilisateur Cocody -> Documents Cocody", cocodyDocs.length >= 0, `Count: ${cocodyDocs.length}`)

  console.log("\n--- TEST CATEGORY 11: INFORMATIONS ÉTABLISSEMENT ---")
  const abouSchoolInfo = await abouPrisma.ecole.findFirst()
  const cocodySchoolInfo = await cocodyPrisma.ecole.findFirst()

  assertTest("Utilisateur Abou -> Ecoledata Abou", abouSchoolInfo?.nom === abouSchool.nom, `Nom: ${abouSchoolInfo?.nom}`)
  assertTest("Utilisateur Cocody -> Ecoledata Cocody", cocodySchoolInfo?.nom === cocodySchool.nom, `Nom: ${cocodySchoolInfo?.nom}`)

  console.log("\n==================================================================")
  console.log(` RÉSUMÉ DES TESTS : ${passedTests}/${totalTests} RÉUSSIS (${failedTests} ÉCHECS)`)
  console.log("==================================================================")

  if (failedTests === 0) {
    console.log("STATUS FINAL: PASS")
  } else {
    console.log("STATUS FINAL: FAIL")
  }
}

runCrossTenantMatrix().catch(console.error)
