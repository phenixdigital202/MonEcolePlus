import masterPrisma from "../lib/prisma"
import { getTenantClient } from "../lib/prisma-tenant"
import { numberToFrenchWords } from "../lib/utils"

async function runReceiptValidation() {
  console.log("=== VÉRIFICATION FINALE DU REÇU OFFICIEL DE PAIEMENT ===")

  // 1. Test French numbers to words conversion
  const testAmounts = [100000, 65656, 150000, 250000, 50000, 0]
  console.log("\n--- 1. TEST CONVERSION MONTANTS EN LETTRES ---")
  for (const amt of testAmounts) {
    console.log(`${amt.toLocaleString('fr-FR')} FCFA => "${numberToFrenchWords(amt)}"`)
  }

  // 2. Fetch Abou DB payments & school info
  console.log("\n--- 2. TEST TRACAGE ANNÉE SCOLAIRE & NUMÉRO DE REÇU (TENANT 1: ABOU) ---")
  const abouSchool = await masterPrisma.ecole.findUnique({ where: { id: 1 } })
  if (!abouSchool || !abouSchool.database_url) {
    console.error("École Abou non trouvée en Master DB")
    return
  }
  const abouPrisma = getTenantClient(abouSchool.database_url)

  const abouPayments = await abouPrisma.paiement.findMany({
    take: 5,
    include: {
      user: {
        include: {
          inscriptions: { include: { classe: true }, orderBy: { startDate: 'desc' } },
          parentEleveAsEleve: { include: { parent: true } }
        }
      }
    }
  })

  console.log(`Établissement: ${abouSchool.nom}`)
  console.log(`Paiements analysés: ${abouPayments.length}`)

  for (const sample of abouPayments) {
    const pDate = new Date(sample.date_paiement)
    const pYear = pDate.getFullYear()
    const pMonth = pDate.getMonth() + 1
    const inferredYear = pMonth >= 9 ? `${pYear}-${pYear + 1}` : `${pYear - 1}-${pYear}`

    const inscriptions = sample.user?.inscriptions || []
    const matched = inscriptions.find((i: any) => i.annee_scolaire === inferredYear) || inscriptions[0]
    const receiptNum = `REC-${String(sample.id).padStart(6, '0')}-${pYear}`

    console.log(`\nPaiement ID #${sample.id}:`)
    console.log(`  - Numéro de reçu formatté: ${receiptNum}`)
    console.log(`  - Date du paiement: ${pDate.toLocaleDateString('fr-FR')}`)
    console.log(`  - Élève: ${sample.user?.nom}`)
    console.log(`  - Année Scolaire détectée: ${matched?.annee_scolaire || inferredYear} (Inferred: ${inferredYear})`)
    console.log(`  - Classe associée: ${matched?.classe?.nom || "Non assignée"}`)
    console.log(`  - Montant: ${Number(sample.montant).toLocaleString('fr-FR')} FCFA (${numberToFrenchWords(Number(sample.montant))})`)
  }

  // 3. Multi-tenant isolation test with Cocody DB (School 2)
  console.log("\n--- 3. TEST MULTI-TENANT ISOLATION (COCODY vs ABOU) ---")
  const cocodySchool = await masterPrisma.ecole.findUnique({ where: { id: 2 } })
  if (cocodySchool && cocodySchool.database_url) {
    const cocodyPrisma = getTenantClient(cocodySchool.database_url)
    console.log(`Tenant 2 Établissement: ${cocodySchool.nom}`)

    if (abouPayments.length > 0) {
      const abouId = abouPayments[0].id
      const crossQuery = await cocodyPrisma.paiement.findUnique({ where: { id: abouId } })
      if (!crossQuery) {
        console.log(`✔ ISOLATION STRICTE CONFIRMÉE: Le paiement #${abouId} d'Abou est STRICTEMENT INACCESSIBLE depuis Cocody.`)
      } else {
        console.error(`❌ ÉCHEC ISOLATION: Le paiement #${abouId} d'Abou a été trouvé dans la base de Cocody!`)
      }
    }
  }

  console.log("\n=== VALIDATION COMPLÈTE TERMINÉE ===")
}

runReceiptValidation().catch(console.error).finally(() => process.exit(0))
