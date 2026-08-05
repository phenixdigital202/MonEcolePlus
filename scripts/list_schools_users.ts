import { PrismaClient } from "@prisma/client"

async function main() {
  const masterPrisma = new PrismaClient()
  
  console.log("==========================================")
  console.log("🏫 LISTE DES ÉTABLISSEMENTS (COORDONNÉES) 🏫")
  console.log("==========================================")
  
  const ecoles = await masterPrisma.ecole.findMany()
  
  for (const ecole of ecoles) {
    console.log(`ID         : ${ecole.id}`)
    console.log(`Nom        : ${ecole.nom}`)
    console.log(`Subdomain  : ${ecole.subdomain}`)
    console.log(`Plan       : ${ecole.plan}`)
    console.log(`Db Status  : ${ecole.db_status}`)
    console.log(`DB URL     : ${ecole.database_url}`)
    console.log("------------------------------------------")

    if (ecole.database_url) {
      const tenantPrisma = new PrismaClient({
        datasources: { db: { url: ecole.database_url } }
      })
      try {
        const users = await tenantPrisma.user.findMany({
          select: { id: true, nom: true, email: true, role: true }
        })
        console.log(`👥 Utilisateurs dans cette base (${users.length}) :`)
        users.forEach(u => {
          console.log(`  - [${u.role.toUpperCase()}] ${u.nom} (${u.email})`)
        })
      } catch (err: any) {
        console.log(`  ⚠️ Impossible de récupérer les utilisateurs: ${err.message}`)
      } finally {
        await tenantPrisma.$disconnect()
      }
      console.log("==========================================")
    }
  }

  await masterPrisma.$disconnect()
}

main().catch(console.error)
