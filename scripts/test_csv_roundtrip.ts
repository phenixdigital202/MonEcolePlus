import { getExportData, validateImportData, executeImportData } from "../lib/import-export-actions"
import { PrismaClient } from "@prisma/client"

async function main() {
  const dbUrl = "postgresql://postgres.nfrripylvuzxpuipdrpy:MonEcolePlus@aws-0-eu-west-3.pooler.supabase.com:5432/tenant_cocody_1785950690672"
  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } })

  console.log("=== TEST DE RECETTE : ROUND-TRIP CSV CLASSES ===\n")

  // Step 1: Export classes data
  console.log("1. Récupération des classes existantes (simulation d'export)...")
  const exportRes = await getExportData("classes")
  if (!exportRes.success || !exportRes.data) {
    console.error("❌ Échec de l'export :", exportRes.error)
    await prisma.$disconnect()
    return
  }
  
  const originalClasses = exportRes.data
  console.log(`   Nombre de classes exportées : ${originalClasses.length}`)
  originalClasses.forEach((c: any) => console.log(`   - ${c.nom} (${c.niveau})`))

  // Step 2: Validate the exported data for re-import compatibility
  console.log("\n2. Validation de la compatibilité des données d'export pour ré-importation...")
  const validationRes = await validateImportData("classes", originalClasses)
  if (!validationRes.success) {
    console.error("❌ Échec de la validation :", validationRes.error)
    await prisma.$disconnect()
    return
  }

  console.log("   Résultat de validation :")
  console.log(`   - Lignes totales     : ${validationRes.results?.length}`)
  console.log(`   - Lignes valides     : ${validationRes.validCount}`)
  console.log(`   - Lignes en doublon  : ${validationRes.duplicateCount}`)
  console.log(`   - Lignes en erreur   : ${validationRes.errorCount}`)

  if (validationRes.errorCount > 0) {
    console.error("❌ Des erreurs de format ont été détectées dans les données exportées.")
    await prisma.$disconnect()
    return
  }
  console.log("   ✅ Les données exportées sont 100% compatibles pour la ré-importation.")

  // Step 3: Insert a temporary class to verify actual import execution
  console.log("\n3. Simulation d'ajout d'une nouvelle classe via le flux d'importation...")
  const tempClass = { nom: "6ème B_TEST", niveau: "Collège" }
  
  const importExecutionRes = await executeImportData("classes", [tempClass])
  if (!importExecutionRes.success) {
    console.error("❌ Échec de l'exécution de l'import :", importExecutionRes.error)
    await prisma.$disconnect()
    return
  }
  console.log(`   ✅ Import exécuté avec succès. Classes créées : ${importExecutionRes.count}`)

  // Verify DB record existence
  const checkDb = await prisma.class.findFirst({ where: { nom: "6ème B_TEST" } })
  if (checkDb) {
    console.log(`   ✅ Nouvelle classe '${checkDb.nom}' bien présente en base (ID: ${checkDb.id}).`)
    
    // Clean up
    await prisma.class.delete({ where: { id: checkDb.id } })
    console.log("   🧹 Nettoyage de la classe de test effectué.")
  } else {
    console.error("❌ La classe importée n'a pas été trouvée en base de données.")
  }

  await prisma.$disconnect()
}

main().catch(console.error)
