import { PrismaClient } from "@prisma/client"
import { getTenantClient } from "../lib/prisma-tenant"

async function main() {
  const master = new PrismaClient()
  console.log("=== MASTER DB ===")
  const masterUser = await master.user.findUnique({
    where: { email: "admin@abou.com" }
  })
  console.log("Master User:", masterUser)

  if (masterUser && masterUser.id_ecole) {
    const school = await master.ecole.findUnique({
      where: { id: masterUser.id_ecole }
    })
    console.log("Master School details:", school)

    if (school && school.database_url) {
      console.log("=== TENANT DB ===")
      const tenant = getTenantClient(school.database_url)
      const tenantUser = await tenant.user.findUnique({
        where: { email: "admin@abou.com" }
      })
      console.log("Tenant User:", tenantUser)
    }
  }

  await master.$disconnect()
}

main().catch(console.error)
