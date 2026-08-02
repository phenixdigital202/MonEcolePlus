import { PrismaClient } from "@prisma/client"
import { getPrisma } from "../lib/tenant-context"

const prismaMaster = new PrismaClient()

async function main() {
  console.log("=== SEARCHING MASTER DB ===")
  const masterUsers = await prismaMaster.user.findMany({
    where: { email: "admin@phenixdigital.ci" }
  })
  console.log("Master Users:", masterUsers)

  console.log("=== SEARCHING TENANT DB ===")
  try {
    const tenantPrisma = await getPrisma()
    const tenantUsers = await tenantPrisma.user.findMany({
      where: { email: "admin@phenixdigital.ci" }
    })
    console.log("Tenant Users:", tenantUsers)
  } catch (err: any) {
    console.log("Error querying tenant DB:", err.message)
  }

  await prismaMaster.$disconnect()
}

main().catch(console.error)
