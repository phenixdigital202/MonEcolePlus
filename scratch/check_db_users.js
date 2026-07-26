const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      nom: true,
      email: true,
      role: true,
      id_ecole: true
    }
  });
  console.log("=== USERS IN LOCAL TENANT/DEFAULT DB ===");
  console.log(users);

  // Let's also check parent links
  const parents = users.filter(u => u.role === 'parent');
  console.log("=== PARENT USERS ===");
  console.log(parents);
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
