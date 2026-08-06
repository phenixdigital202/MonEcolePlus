import { PrismaClient } from "@prisma/client"

async function main() {
  const dbUrl = "postgresql://postgres.nfrripylvuzxpuipdrpy:MonEcolePlus@aws-0-eu-west-3.pooler.supabase.com:5432/tenant_cocody_1785950690672"
  const prisma = new PrismaClient({
    datasources: { db: { url: dbUrl } }
  })

  console.log("=== DIAGNOSTIC WhatsApp & SMTP ===")
  
  const ecole = await prisma.ecole.findFirst()
  if (!ecole) {
    console.log("❌ Aucune école trouvée dans la base tenant Cocody.")
    await prisma.$disconnect()
    return
  }

  console.log("\n📌 École:", ecole.nom)
  console.log("   ID:", ecole.id)
  
  console.log("\n--- WhatsApp Config ---")
  console.log("  whatsapp_access_token:", ecole.whatsapp_access_token ? `✅ SET (${ecole.whatsapp_access_token.substring(0, 20)}...)` : "❌ VIDE")
  console.log("  whatsapp_phone_number_id:", ecole.whatsapp_phone_number_id ? `✅ SET (${ecole.whatsapp_phone_number_id})` : "❌ VIDE")
  
  console.log("\n--- SMTP Config ---")
  console.log("  smtp_host:", (ecole as any).smtp_host || "❌ VIDE")
  console.log("  smtp_port:", (ecole as any).smtp_port || "❌ VIDE")
  console.log("  smtp_user:", (ecole as any).smtp_user || "❌ VIDE")
  console.log("  smtp_pass:", (ecole as any).smtp_pass ? "✅ SET" : "❌ VIDE")

  console.log("\n--- Compteurs ---")
  const classCount = await prisma.class.count()
  const studentCount = await prisma.eleve.count()
  console.log("  Classes:", classCount)
  console.log("  Élèves:", studentCount)

  await prisma.$disconnect()
}

main().catch(console.error)
