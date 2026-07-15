const { PrismaClient } = require('@prisma/client');

async function addMatiereColumn(dbName) {
  const url = `mysql://root:@127.0.0.1:3306/${dbName}`;
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url,
      },
    },
  });

  try {
    console.log(`Adding matiere column to ${dbName}...`);
    await prisma.$executeRawUnsafe(`ALTER TABLE users ADD COLUMN matiere VARCHAR(100) NULL AFTER role`);
    console.log(`Column added to ${dbName}`);
  } catch (e) {
    if (e.message.includes('Duplicate column name')) {
      console.log(`Column already exists in ${dbName}`);
    } else {
      console.error(`Error adding column to ${dbName}:`, e.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  await addMatiereColumn('monecole_lycee_judith');
}

main();
