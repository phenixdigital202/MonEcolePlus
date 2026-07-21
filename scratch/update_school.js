const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function update() {
  await prisma.ecole.update({
    where: { id: 1 },
    data: { subdomain: 'lycee-judith-toure' }
  });
  console.log('Updated subdomain to lycee-judith-toure');
}

update().catch(console.error).finally(() => prisma.$disconnect());
