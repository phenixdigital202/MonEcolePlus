import prismaMaster from '../lib/prisma';
import { PrismaClient } from '@prisma/client';

async function migrateCachetColumn() {
  console.log('=== STARTING CACHET_URL MIGRATION ACROSS ALL DATABASES ===');

  // 1. Migrate Master DB
  try {
    await prismaMaster.$executeRawUnsafe(`
      ALTER TABLE ecoles ADD COLUMN IF NOT EXISTS cachet_url TEXT;
    `);
    console.log('[Master DB] Successfully added cachet_url column to ecoles.');
  } catch (err: any) {
    console.error('[Master DB] Migration error:', err.message);
  }

  // 2. Fetch all Tenant DBs
  const schools = await prismaMaster.ecole.findMany({
    where: { database_url: { not: null } },
    select: { id: true, nom: true, subdomain: true, database_url: true }
  });

  console.log(`Found ${schools.length} Tenant DBs to migrate.`);

  for (const s of schools) {
    if (!s.database_url) continue;
    const tenantClient = new PrismaClient({
      datasources: { db: { url: s.database_url } }
    });

    try {
      await tenantClient.$executeRawUnsafe(`
        ALTER TABLE ecoles ADD COLUMN IF NOT EXISTS cachet_url TEXT;
      `);
      console.log(`[Tenant DB ${s.id} - ${s.nom}] Successfully added cachet_url.`);
    } catch (err: any) {
      console.error(`[Tenant DB ${s.id} - ${s.nom}] Migration error:`, err.message);
    } finally {
      await tenantClient.$disconnect();
    }
  }

  console.log('=== COMPLETED CACHET_URL MIGRATION ===');
  process.exit(0);
}

migrateCachetColumn().catch(e => {
  console.error(e);
  process.exit(1);
});
