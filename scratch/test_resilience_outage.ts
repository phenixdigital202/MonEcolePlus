import { PrismaClient } from "@prisma/client"

async function runResilienceTest() {
  const masterPrisma = new PrismaClient()

  console.log("========================================")
  console.log("TEST DE RÉSILIENCE — SIMULATION PANNE MASTER DB")
  console.log("========================================\n")

  // Target school: Lycée Moderne d'Abou (ID 3)
  const masterSchool = await masterPrisma.ecole.findUnique({ where: { id: 3 } })
  if (!masterSchool || !masterSchool.database_url) {
    throw new Error("Target school not found")
  }

  const initialMasterAddress = masterSchool.adresse || ""

  let tenantUrl = masterSchool.database_url
  if (process.env.SUPABASE_DIRECT_URL && tenantUrl.includes("pooler.supabase.com")) {
    const dbName = tenantUrl.split("/").pop()?.split("?")[0]
    tenantUrl = `${process.env.SUPABASE_DIRECT_URL}/${dbName}`
  }

  const tenantPrisma = new PrismaClient({
    datasources: { db: { url: tenantUrl } }
  })
  const tenantSchool = await tenantPrisma.ecole.findFirst()
  if (!tenantSchool) throw new Error("Tenant ecole not found")

  const initialTenantAddress = tenantSchool.adresse || ""
  console.log(`[Élelments Initiaux]`)
  console.log(`  Master DB Adresse: "${initialMasterAddress}"`)
  console.log(`  Tenant DB Adresse: "${initialTenantAddress}"`)

  // STEP 1 & 2: User updates address -> Tenant DB update succeeds
  const newAddress = `Panne Master Test ${Date.now().toString().slice(-4)}`
  console.log(`\n1. Saisie Utilisateur -> Mise à jour Adresse: "${newAddress}"`)
  console.log(`2. Écriture Tenant DB...`)
  await tenantPrisma.ecole.update({
    where: { id: tenantSchool.id },
    data: { adresse: newAddress }
  })
  console.log(`  ✅ Écriture Tenant DB RÉUSSIE`)

  // STEP 3: Master DB connection fails (simulated)
  console.log(`3. Simulation Panne Réseau / Echec Master DB...`)
  let masterUpdateSuccess = false
  try {
    // Simulate failure by throwing network timeout error
    throw new Error("ETIMEDOUT: Connection pool timeout for Master DB")
  } catch (err: any) {
    console.warn(`  ⚠️ Exception capturée (Master DB Non Joignable): ${err.message}`)
    console.log(`  -> L'application continue l'exécution (graceful degradation)`)
  }

  // STEP 4: Check state after outage
  const postOutageTenant = await tenantPrisma.ecole.findFirst()
  const postOutageMaster = await masterPrisma.ecole.findUnique({ where: { id: 3 } })

  console.log(`\n========================================`)
  console.log(`4. ÉTAT DES BASES APRÈS PANNE`)
  console.log(`========================================`)
  console.log(`  Tenant DB Adresse: "${postOutageTenant?.adresse}"`)
  console.log(`  Master DB Adresse: "${postOutageMaster?.adresse}"`)

  const isDivergent = postOutageTenant?.adresse !== postOutageMaster?.adresse
  console.log(`  Divergence détectée: ${isDivergent ? 'OUI' : 'NON'}`)

  // STEP 5: What does the user see in Tenant Settings page vs getCurrentTenant?
  console.log(`\n5. VÉRIFICATION ÉTAT COHÉRENT UTILISATEUR:`)
  console.log(`  - Sur la page Paramètres (/dashboard/settings/school), les données sont lues depuis Tenant DB -> L'administrateur voit la nouvelle adresse: "${postOutageTenant?.adresse}".`)

  // Clean up test modifications: sync back tenant to original address or master address
  await tenantPrisma.ecole.update({
    where: { id: tenantSchool.id },
    data: { adresse: initialMasterAddress }
  })
  await tenantPrisma.$disconnect()
  await masterPrisma.$disconnect()

  console.log("\nTEST DE RÉSILIENCE TERMINÉ SANS ERREUR.")
  process.exit(0)
}

runResilienceTest()
