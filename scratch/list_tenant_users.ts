import { PrismaClient } from "@prisma/client"
import { getTenantClient } from "../lib/prisma-tenant"

const prismaMaster = new PrismaClient()

async function main() {
  const ecoles = await prismaMaster.ecole.findMany()
  console.log("=== ECOLES ===")
  console.log(ecoles)

  for (const ecole of ecoles) {
    if (ecole.database_url) {
      console.log(`=== USERS IN TENANT DB FOR SCHOOL ${ecole.nom} (id: ${ecole.id}) ===`)
      try {
        const tenantPrisma = getTenantClient(ecole.database_url)
        const users = await tenantPrisma.user.findMany()
        for (const u of users) {
          console.log({
            id: u.id,
            nom: u.nom,
            email: u.email,
            role: u.role,
            id_ecole: u.id_ecole
          })
        }
      } catch (err: any) {
        console.error(`Error querying tenant ${ecole.id}:`, err.message)
      }
    }
  }

  await prismaMaster.$disconnect()
}

main().catch(console.error)
