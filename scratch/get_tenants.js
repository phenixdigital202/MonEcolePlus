const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'mysql://root@127.0.0.1:3306/monecole',
    },
  },
});

async function main() {
  const tenants = await prisma.$queryRawUnsafe('SELECT * FROM tenants');
  console.log(tenants);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
