const { PrismaClient } = require('@prisma/client')

async function main() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: "mysql://root:password@localhost:3306/monecole_lycee_abou"
      }
    }
  })

  try {
    const evaluations = await prisma.evaluations.findMany()
    console.log("Evaluations count:", evaluations.length)
    console.log("Sample:", evaluations.slice(0, 5))
    
    const classes = await prisma.class.findMany()
    console.log("Classes count:", classes.length)
    
  } catch (e) {
    console.error(e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
