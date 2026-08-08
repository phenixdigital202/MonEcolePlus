import { PrismaClient } from "@prisma/client"

async function main() {
  // Use the master DATABASE_URL from .env
  const prisma = new PrismaClient()

  console.log("=== MIGRATION DU SCHÉMA MASTER ===")
  try {
    console.log("Ajout des colonnes metaMessageId et httpStatus à la table notification_whatsapps...")
    
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "notification_whatsapps" 
      ADD COLUMN IF NOT EXISTS "metaMessageId" text,
      ADD COLUMN IF NOT EXISTS "httpStatus" integer
    `)
    
    console.log("✅ Migration DDL Master exécutée avec succès !")
  } catch (err: any) {
    console.error("❌ Erreur pendant la migration Master :", err.message)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(console.error)
