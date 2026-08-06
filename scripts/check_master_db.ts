import { PrismaClient } from "@prisma/client"

async function main() {
  const masterPrisma = new PrismaClient()
  console.log("=== CHECKING MASTER DB ===")
  const ecoles = await masterPrisma.ecole.findMany()
  console.log(`Schools count: ${ecoles.length}`)
  ecoles.forEach(e => console.log(`- School: ${e.id}, Name: ${e.nom}, DB URL: ${e.database_url}`))

  const classes = await masterPrisma.class.findMany()
  console.log(`Classes count in Master: ${classes.length}`)

  const students = await masterPrisma.user.findMany({ where: { role: "student" } })
  console.log(`Students count in Master: ${students.length}`)
  
  const teachers = await masterPrisma.user.findMany({ where: { role: "teacher" } })
  console.log(`Teachers in Master: ${teachers.length}`)

  await masterPrisma.$disconnect()
}

main().catch(console.error)
