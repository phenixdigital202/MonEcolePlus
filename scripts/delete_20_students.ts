import { PrismaClient } from "@prisma/client"

async function main() {
  const dbUrl = "postgresql://postgres.nfrripylvuzxpuipdrpy:MonEcolePlus@aws-0-eu-west-3.pooler.supabase.com:5432/tenant_cocody_1785950690672"
  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } })

  console.log("=== SUPPRESSION DES 20 ÉLÈVES DE TEST (Simulation de perte de données) ===\n")

  // Find all test students
  const testUsers = await prisma.user.findMany({
    where: {
      role: "student",
      email: { endsWith: "@monecole.ci" }
    }
  })

  console.log(`Trouvé ${testUsers.length} élèves de test à supprimer.`)

  const userIds = testUsers.map(u => u.id)

  // Inscriptions are cascade deleted if we delete users? Let's check relation or delete explicitly
  const deletedInscriptions = await prisma.inscription.deleteMany({
    where: {
      id_eleve: { in: userIds }
    }
  })
  console.log(`Inscriptions supprimées : ${deletedInscriptions.count}`)

  const deletedUsers = await prisma.user.deleteMany({
    where: {
      id: { in: userIds }
    }
  })
  console.log(`Utilisateurs (élèves) supprimés : ${deletedUsers.count}`)

  const total = await prisma.user.count({ where: { role: "student" } })
  console.log(`Total élèves restants en base : ${total}`)

  await prisma.$disconnect()
}

main().catch(console.error)
