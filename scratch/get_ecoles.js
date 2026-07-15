const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'mysql://root@127.0.0.1:3306/monecole',
    },
  },
});

async function main() {
  const ecoles = await prisma.ecoles.findMany();
  console.log(ecoles);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
