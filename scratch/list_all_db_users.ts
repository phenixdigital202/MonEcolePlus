import { PrismaClient } from "@prisma/client"

const prismaMaster = new PrismaClient()

async function main() {
  const allUsers = await prismaMaster.user.findMany()
  console.log("=== ALL USERS IN MASTER DB ===")
  for (const u of allUsers) {
    console.log({
      id: u.id,
      nom: u.nom,
      email: u.email,
      role: u.role,
      id_ecole: u.id_ecole
    })
  }
  await prismaMaster.$disconnect()
}

main().catch(console.error)
