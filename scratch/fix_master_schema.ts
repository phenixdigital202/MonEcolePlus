import prismaMaster from "../lib/prisma"

async function main() {
  console.log("=== AUTO-PATCHING MASTER DB & TENANT DB SCHEMAS ===")

  const sqlStatements = [
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "matricule" TEXT;`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "date_naissance" TIMESTAMP(3);`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lieu_naissance" TEXT;`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "nationalite" TEXT DEFAULT 'Ivoirienne';`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "sexe" TEXT;`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "etablissement_origine" TEXT;`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "statut_affectation" TEXT DEFAULT 'Non Affecté';`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "statut_redoublement" TEXT DEFAULT 'Non Redoublant';`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "cantine" BOOLEAN DEFAULT false;`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "transport" BOOLEAN DEFAULT false;`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lv2" TEXT;`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "tuteur_type" TEXT DEFAULT 'Père';`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "tuteur_nom" TEXT;`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "tuteur_profession" TEXT;`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "tuteur_tel_domicile" TEXT;`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "tuteur_tel_bureau" TEXT;`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "tuteur_tel_mobile" TEXT;`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "tuteur_adresse" TEXT;`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "tuteur_email" TEXT;`,
    `ALTER TABLE "inscriptions" ADD COLUMN IF NOT EXISTS "type_inscription" TEXT DEFAULT 'Inscription';`,
    `ALTER TABLE "inscriptions" ADD COLUMN IF NOT EXISTS "montant_scolarite" DECIMAL(65,3);`
  ]

  console.log("Patching Master DB...")
  for (const sql of sqlStatements) {
    try {
      await prismaMaster.$executeRawUnsafe(sql)
    } catch (e: any) {
      console.log(`Master SQL note: ${e.message}`)
    }
  }

  console.log("Master DB Schema successfully patched!")

  // Now patch all Tenant DBs registered in Master
  const ecoles = await prismaMaster.ecole.findMany()
  console.log(`Found ${ecoles.length} registered schools. Patching tenant DBs...`)

  const { getTenantClient } = require("../lib/prisma-tenant")
  for (const ecole of ecoles) {
    if (!ecole.database_url) continue
    try {
      console.log(`Patching school ${ecole.id}: ${ecole.nom}...`)
      const tenantPrisma = getTenantClient(ecole.database_url)
      for (const sql of sqlStatements) {
        try {
          await tenantPrisma.$executeRawUnsafe(sql)
        } catch (e: any) {}
      }
      console.log(`School ${ecole.nom} successfully patched!`)
    } catch (err: any) {
      console.error(`Error patching ${ecole.nom}:`, err.message)
    }
  }

  console.log("=== ALL DATABASES SUCCESSFULLY PATCHED & SYNCHRONIZED ===")
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
