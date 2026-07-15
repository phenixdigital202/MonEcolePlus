const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanup() {
  console.log("Starting cleanup...");
  
  // 1. Delete from Master
  try {
    const deleted = await prisma.ecoles.deleteMany({
      where: {
        subdomain: {
          in: ['lycée-moderne-abou', 'lycée-moderne-judith']
        }
      }
    });
    console.log(`Deleted ${deleted.count} schools from Master DB.`);
  } catch (e) {
    console.error("Master cleanup error:", e.message);
  }

  // 2. Drop Databases
  const tempPrisma = new PrismaClient({
    datasources: { db: { url: "mysql://root:@127.0.0.1:3306/mysql" } }
  });

  const dbsToDrop = [
    'monecole_lycée_moderne_abou',
    'monecole_lycée_moderne_judith',
    'monecole_lycée_moderne_judith_2567'
  ];

  for (const db of dbsToDrop) {
    try {
      await tempPrisma.$executeRawUnsafe(`DROP DATABASE IF EXISTS \`${db}\``);
      console.log(`Dropped database: ${db}`);
    } catch (e) {
      console.error(`Error dropping ${db}:`, e.message);
    }
  }

  await prisma.$disconnect();
  await tempPrisma.$disconnect();
  console.log("Cleanup complete.");
}

cleanup();
