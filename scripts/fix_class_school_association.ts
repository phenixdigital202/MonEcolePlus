import { PrismaClient } from "@prisma/client"

async function main() {
  const dbUrl = "postgresql://postgres.nfrripylvuzxpuipdrpy:MonEcolePlus@aws-0-eu-west-3.pooler.supabase.com:5432/tenant_cocody_1785950690672"
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: dbUrl
      }
    }
  })

  console.log("=== FIXING CLASS SCHOOL ASSOCIATION ===")
  const res = await prisma.class.updateMany({
    where: { id_ecole: null },
    data: { id_ecole: 9 }
  })
  console.log(`Updated classes count: ${res.count}`)

  const updatedClasses = await prisma.class.findMany()
  updatedClasses.forEach(c => console.log(`- Class: ${c.nom}, School ID: ${c.id_ecole}`))

  await prisma.$disconnect()
}

main().catch(console.error)
