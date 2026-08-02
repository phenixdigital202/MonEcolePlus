import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("=== INSPECTING MASTER DB FOR SUPER ADMIN ===")
  const users = await prisma.user.findMany({
    where: { email: "admin@phenixdigital.ci" }
  })
  
  if (users.length === 0) {
    console.log("❌ Aucun utilisateur trouvé avec cet e-mail.")
  } else {
    for (const u of users) {
      console.log({
        id: u.id,
        nom: u.nom,
        email: u.email,
        role: u.role,
        id_ecole: u.id_ecole,
        active: (u as any).active ?? "Champ inexistant"
      })
    }
  }
  
  await prisma.$disconnect()
}

main().catch(console.error)
