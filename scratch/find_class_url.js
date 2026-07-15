const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const schools = await prisma.ecoles.findMany()
  for (const school of schools) {
    const tenantPrisma = new PrismaClient({
      datasources: {
        db: {
          url: `mysql://root:root@localhost:3306/${school.db_name}`
        }
      }
    })
    try {
      const classes = await tenantPrisma.class.findMany({ take: 1 })
      if (classes.length > 0) {
        console.log(`URL: http://${school.subdomain}.localhost:3000/dashboard/classes/${classes[0].id}`)
      }
    } catch (e) {}
    await tenantPrisma.$disconnect()
  }
}

main().finally(() => prisma.$disconnect())
