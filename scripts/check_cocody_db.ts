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

  console.log("=== CHECKING COCODY DB ===")
  const classes = await prisma.class.findMany()
  console.log(`Classes count: ${classes.length}`)
  classes.forEach(c => console.log(`- Class ID: ${c.id}, Name: ${c.nom}, School ID: ${c.id_ecole}`))

  const students = await prisma.user.findMany({ where: { role: "student" } })
  console.log(`Students count: ${students.length}`)
  
  const teachers = await prisma.user.findMany({ where: { role: "teacher" } })
  console.log(`Teachers count: ${teachers.length}`)

  await prisma.$disconnect()
}

main().catch(console.error)
