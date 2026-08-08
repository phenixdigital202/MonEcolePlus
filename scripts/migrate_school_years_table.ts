import { PrismaClient } from "@prisma/client"

async function migrateDb(dbUrl: string, name: string) {
  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } })
  console.log(`=== MIGRATION DE LA BASE : ${name} ===`)
  
  try {
    // 1. Create table school_years if not exists
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "school_years" (
        "id" SERIAL PRIMARY KEY,
        "id_ecole" INTEGER NOT NULL,
        "label" TEXT NOT NULL,
        "startDate" TIMESTAMP WITH TIME ZONE NOT NULL,
        "endDate" TIMESTAMP WITH TIME ZONE NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'DRAFT',
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "school_years_id_ecole_label_key" UNIQUE ("id_ecole", "label")
      );
    `)

    // 2. Create indexes
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "school_years_id_ecole_idx" ON "school_years" ("id_ecole");
    `)
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "school_years_status_idx" ON "school_years" ("status");
    `)

    console.log(`✅ Table school_years migrée avec succès pour ${name} !`)
  } catch (err: any) {
    console.error(`❌ Échec de la migration pour ${name} :`, err.message)
  } finally {
    await prisma.$disconnect()
  }
}

async function main() {
  const masterUrl = "postgresql://postgres.nfrripylvuzxpuipdrpy:MonEcolePlus@aws-0-eu-west-3.pooler.supabase.com:5432/postgres"
  const cocodyUrl = "postgresql://postgres.nfrripylvuzxpuipdrpy:MonEcolePlus@aws-0-eu-west-3.pooler.supabase.com:5432/tenant_cocody_1785950690672"

  await migrateDb(masterUrl, "MASTER DB")
  await migrateDb(cocodyUrl, "COCODY TENANT DB")
}

main().catch(console.error)
