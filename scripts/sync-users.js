const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const masterPrisma = new PrismaClient();

async function syncUsers() {
  console.log("Fetching schools from Master DB...");
  const schools = await masterPrisma.ecole.findMany();
  console.log(`Found ${schools.length} schools.`);

  for (const school of schools) {
    if (!school.database_url) continue;
    console.log(`\nSyncing users for school: ${school.nom} (${school.subdomain})`);
    
    const tenantPrisma = new PrismaClient({
      datasources: { db: { url: school.database_url } }
    });

    try {
      const users = await tenantPrisma.user.findMany();
      console.log(`Found ${users.length} users in tenant DB.`);

      let synced = 0;
      for (const user of users) {
        const exists = await masterPrisma.user.findUnique({ where: { email: user.email } });
        if (!exists) {
          await masterPrisma.user.create({
            data: {
              id: user.id,
              nom: user.nom,
              email: user.email,
              password: user.password,
              role: user.role,
              id_ecole: school.id
            }
          });
          synced++;
        }
      }
      console.log(`Successfully synced ${synced} new users to Master DB.`);
    } catch (e) {
      console.error(`Failed to sync school ${school.nom}:`, e);
    } finally {
      await tenantPrisma.$disconnect();
    }
  }

  await masterPrisma.$disconnect();
  console.log("\nDone!");
}

syncUsers().catch(console.error);
