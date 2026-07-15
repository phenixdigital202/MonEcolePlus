const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "mysql://root:@127.0.0.1:3306/monecole_lycee_abou"
    }
  }
});

async function main() {
  const i = await prisma.inscription.findMany({ 
    where: { id_eleve: 6 }, 
    include: { classe: true } 
  });
  console.log(JSON.stringify(i, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
