const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "mysql://root:@127.0.0.1:3306/monecole_lycee_abou"
    }
  }
});

async function main() {
  const students = await prisma.user.findMany({
    where: { role: 'student' },
    select: { id: true, nom: true, email: true }
  });
  console.log(JSON.stringify(students, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
