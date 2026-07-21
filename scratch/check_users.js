const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const schools = await prisma.ecole.findMany();
  console.log('Schools:', schools);
  if (schools.length > 0) {
    console.log('String hex:', Buffer.from(schools[0].subdomain).toString('hex'));
    console.log('Is it lycée?', schools[0].subdomain === 'lycée-judith-toure');
    console.log('Is it lycã©e?', schools[0].subdomain === 'lycã©e-judith-toure');
  }
}

check().catch(console.error).finally(() => prisma.$disconnect());
