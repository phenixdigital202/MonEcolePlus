const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('users', 'id'), coalesce(max(id)+1, 1), false) FROM users;`);
  console.log('Sequence reset');
}
run().catch(console.error).finally(() => prisma.$disconnect());
