import { PrismaClient } from "@prisma/client"

async function main() {
  console.log("==========================================")
  console.log("🔑 CRÉATION DE L'ADMIN POUR COCODY 🔑")
  console.log("==========================================")

  const database_url = "postgresql://postgres.nfrripylvuzxpuipdrpy:MonEcolePlus@aws-0-eu-west-3.pooler.supabase.com:6543/tenant_cocody_1785950690672?pgbouncer=true"

  const tenantPrisma = new PrismaClient({
    datasources: { db: { url: database_url } }
  })

  // Récupérer l'ID de l'école dans la base locale (doit être 9 ou similaire)
  const ecole = await tenantPrisma.ecole.findFirst()
  if (!ecole) {
    console.error("❌ École non trouvée dans la base de données locale du Tenant.")
    await tenantPrisma.$disconnect()
    return
  }

  console.log(`École locale trouvée: ${ecole.nom} (ID: ${ecole.id})`)

  // Création de l'utilisateur Admin
  const email = "admin_cocody@monecole.ci"
  const password = "securepassword123"

  const admin = await tenantPrisma.user.upsert({
    where: { email },
    update: { password },
    create: {
      id_ecole: ecole.id,
      nom: "Admin Cocody",
      email,
      password,
      role: "admin"
    }
  })

  console.log(`✅ Admin créé ou mis à jour avec succès :`)
  console.log(`   Email : ${admin.email}`)
  console.log(`   Mot de passe : ${password}`)

  await tenantPrisma.$disconnect()
}

main().catch(console.error)
