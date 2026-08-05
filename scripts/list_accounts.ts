import { PrismaClient } from "@prisma/client"

async function main() {
  const masterPrisma = new PrismaClient()
  
  console.log("==================================================")
  console.log("🏫 COMPTES D'ÉTABLISSEMENTS (LOGINS & PASSWORDS) 🏫")
  console.log("==================================================")
  
  const ecoles = await masterPrisma.ecole.findMany()
  
  for (const ecole of ecoles) {
    console.log(`Établissement : ${ecole.nom}`)
    console.log(`Subdomain     : ${ecole.subdomain}`)
    console.log(`Plan          : ${ecole.plan}`)
    
    if (ecole.database_url) {
      const tenantPrisma = new PrismaClient({
        datasources: { db: { url: ecole.database_url } }
      })
      try {
        const users = await tenantPrisma.user.findMany({
          select: { nom: true, email: true, password: true, role: true }
        })
        console.log(`Utilisateurs :`)
        users.forEach(u => {
          console.log(`  - [${u.role.toUpperCase()}] Nom: ${u.nom} | Email: ${u.email} | Mot de passe: ${u.password}`)
        })
      } catch (err: any) {
        console.log(`  ⚠️ Impossible de lire les utilisateurs: ${err.message}`)
      } finally {
        await tenantPrisma.$disconnect()
      }
      console.log("--------------------------------------------------")
    }
  }

  await masterPrisma.$disconnect()
}

main().catch(console.error)
