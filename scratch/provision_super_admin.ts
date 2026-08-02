import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prismaMaster = new PrismaClient()

async function main() {
  console.log("==================================================")
  console.log("🛠️ PROVISIONING COMPTE SUPER ADMIN MONÉCOLE+ 🛠️")
  console.log("==================================================")

  const email = "admin@phenixdigital.ci"
  const plainPassword = "supersecuresaas123"

  // 1. Check if super_admin already exists
  const existingSuperAdmin = await prismaMaster.user.findFirst({
    where: { role: "super_admin" }
  })

  if (existingSuperAdmin) {
    console.log(`✅ Un compte Super Admin existe déjà :`)
    console.log(`- Nom : ${existingSuperAdmin.nom}`)
    console.log(`- Email : ${existingSuperAdmin.email}`)
    console.log(`- Rôle : ${existingSuperAdmin.role}`)
    await prismaMaster.$disconnect()
    return
  }

  console.log(` Aucun compte Super Admin détecté. Création en cours...`)

  // 2. Hash password
  const hashedPassword = await bcrypt.hash(plainPassword, 10)

  // 3. Create Super Admin user
  const newSuperAdmin = await prismaMaster.user.create({
    data: {
      nom: "Phénix Digital CI",
      email: email,
      password: hashedPassword,
      role: "super_admin",
      id_ecole: null // Super Admin is not attached to any single school
    }
  })

  console.log(`✅ Compte Super Admin créé avec succès !`)
  console.log(`- Nom : ${newSuperAdmin.nom}`)
  console.log(`- Email : ${newSuperAdmin.email}`)
  console.log(`- Rôle : ${newSuperAdmin.role}`)
  console.log(`- Mot de passe : ${plainPassword}`)

  await prismaMaster.$disconnect()
}

main().catch(async (e) => {
  console.error("Erreur lors de la création du compte Super Admin :", e)
  await prismaMaster.$disconnect()
  process.exit(1)
})
