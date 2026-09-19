import { PrismaClient } from "@prisma/client"

async function testMultiTenantSchoolUpdate() {
  const masterPrisma = new PrismaClient()

  console.log("========================================")
  console.log("TEST MULTI-TENANT SYNCHRONISATION ÉTABLISSEMENTS")
  console.log("========================================\n")

  // 1. Fetch Abou (ID 3) and Cocody (ID 9) from Master DB
  const abouMaster = await masterPrisma.ecole.findFirst({ where: { id: 3 } })
  const cocodyMaster = await masterPrisma.ecole.findFirst({ where: { id: 9 } })

  if (!abouMaster || !cocodyMaster) {
    throw new Error("Abou or Cocody school not found in Master DB")
  }

  console.log(`[Initial Master State]`)
  console.log(`  Abou   (ID: ${abouMaster.id}):  Nom="${abouMaster.nom}", Adresse="${abouMaster.adresse}"`)
  console.log(`  Cocody (ID: ${cocodyMaster.id}): Nom="${cocodyMaster.nom}", Adresse="${cocodyMaster.adresse}"`)

  // 2. Perform test update on Abou
  const testAbouAddress = `Rue de la Paix Abou ${Date.now().toString().slice(-4)}`
  console.log(`\n--> Updating Abou address to: "${testAbouAddress}"...`)

  // Update Tenant DB Abou
  const abouTenantPrisma = new PrismaClient({
    datasources: { db: { url: abouMaster.database_url! } }
  })
  await abouTenantPrisma.ecole.updateMany({
    data: { adresse: testAbouAddress }
  })
  // Update Master DB Abou
  await masterPrisma.ecole.update({
    where: { id: abouMaster.id },
    data: { adresse: testAbouAddress }
  })
  await abouTenantPrisma.$disconnect()

  // 3. Perform test update on Cocody
  const testCocodyAddress = `Boulevard Hassan Cocody ${Date.now().toString().slice(-4)}`
  console.log(`--> Updating Cocody address to: "${testCocodyAddress}"...`)

  const cocodyTenantPrisma = new PrismaClient({
    datasources: { db: { url: cocodyMaster.database_url! } }
  })
  await cocodyTenantPrisma.ecole.updateMany({
    data: { adresse: testCocodyAddress }
  })
  // Update Master DB Cocody
  await masterPrisma.ecole.update({
    where: { id: cocodyMaster.id },
    data: { adresse: testCocodyAddress }
  })
  await cocodyTenantPrisma.$disconnect()

  // 4. Verify Master DB & Tenant DB isolation
  const readAbouMaster = await masterPrisma.ecole.findUnique({ where: { id: 3 } })
  const readCocodyMaster = await masterPrisma.ecole.findUnique({ where: { id: 9 } })

  const readAbouTenantPrisma = new PrismaClient({ datasources: { db: { url: abouMaster.database_url! } } })
  const readCocodyTenantPrisma = new PrismaClient({ datasources: { db: { url: cocodyMaster.database_url! } } })

  const readAbouTenant = await readAbouTenantPrisma.ecole.findFirst()
  const readCocodyTenant = await readCocodyTenantPrisma.ecole.findFirst()

  await readAbouTenantPrisma.$disconnect()
  await readCocodyTenantPrisma.$disconnect()
  await masterPrisma.$disconnect()

  console.log("\n========================================")
  console.log("RÉSULTAT DES VÉRIFICATIONS")
  console.log("========================================")
  console.log(`Abou Master DB Adresse:   "${readAbouMaster?.adresse}" ${readAbouMaster?.adresse === testAbouAddress ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`Abou Tenant DB Adresse:   "${readAbouTenant?.adresse}" ${readAbouTenant?.adresse === testAbouAddress ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`Cocody Master DB Adresse: "${readCocodyMaster?.adresse}" ${readCocodyMaster?.adresse === testCocodyAddress ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`Cocody Tenant DB Adresse: "${readCocodyTenant?.adresse}" ${readCocodyTenant?.adresse === testCocodyAddress ? '✅ PASS' : '❌ FAIL'}`)

  const isCrossLeaked = readAbouMaster?.adresse === readCocodyMaster?.adresse || readAbouTenant?.adresse === readCocodyTenant?.adresse
  console.log(`Multi-tenant Isolation:   ${!isCrossLeaked ? '✅ PASS (Aucune fuite entre tenants)' : '❌ FAIL'}`)

  if (readAbouMaster?.adresse === testAbouAddress && readCocodyMaster?.adresse === testCocodyAddress && !isCrossLeaked) {
    console.log("\n🎉 TEST MULTI-TENANT ÉTABLISSEMENT 100% SUCCÈS 🎉")
    process.exit(0)
  } else {
    console.error("\n❌ ÉCHEC DU TEST MULTI-TENANT")
    process.exit(1)
  }
}

testMultiTenantSchoolUpdate()
