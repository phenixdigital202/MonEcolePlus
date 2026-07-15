const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'mysql://root@127.0.0.1:3306/monecole',
    },
  },
});

async function main() {
  const result = await prisma.$queryRawUnsafe('DESCRIBE users');
  console.log(result);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
