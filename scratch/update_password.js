const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'mysql://root:@127.0.0.1:3306/monecole_lycee_judith',
    },
  },
});

async function main() {
  await prisma.user.update({
    where: { email: 'admin@judith.com' },
    data: { password: '$2b$10$Nk6tSvmLatxlnh2zv32ZP.EsfecSaTVN0TJkCLKybVFNLZJWOquWi' },
  });
  console.log('Password updated');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
