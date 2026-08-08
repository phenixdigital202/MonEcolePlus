import { PrismaClient } from "@prisma/client"

async function main() {
  const dbUrl = "postgresql://postgres.nfrripylvuzxpuipdrpy:MonEcolePlus@aws-0-eu-west-3.pooler.supabase.com:5432/tenant_cocody_1785950690672"
  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } })

  console.log("=== MIGRATION DU SCHÉMA TENANT (COCODY) ===")
  try {
    console.log("Ajout des colonnes metaMessageId et httpStatus à la table notification_whatsapps...")
    
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "notification_whatsapps" 
      ADD COLUMN IF NOT EXISTS "metaMessageId" text,
      ADD COLUMN IF NOT EXISTS "httpStatus" integer
    `)
    
    console.log("✅ Migration DDL exécutée avec succès !")
  } catch (err: any) {
    console.error("❌ Erreur pendant la migration :", err.message)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(console.error)
