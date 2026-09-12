import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    for (const line of envConfig.split('\n')) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*"(.*)"\s*$/) || line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
      if (match) process.env[match[1]] = match[2].trim();
    }
  }
}
loadEnv();

async function generateTable() {
  let masterDbUrl = process.env.DATABASE_URL;
  if (masterDbUrl && masterDbUrl.includes(':5432/')) masterDbUrl = masterDbUrl.replace(':5432/', ':6543/');
  if (masterDbUrl && !masterDbUrl.includes('pgbouncer=true')) masterDbUrl += (masterDbUrl.includes('?') ? '&' : '?') + 'pgbouncer=true';

  const masterPrisma = new PrismaClient({ datasources: { db: { url: masterDbUrl } } });

  const schools = await masterPrisma.ecole.findMany({
    orderBy: { id: 'asc' }
  });

  console.log('=== SCHOOLS AND USERS OVERVIEW ===\n');

  for (const s of schools) {
    console.log(`\n🏫 ${s.nom} (Subdomain/Tenant: ${s.subdomain}, ID: ${s.id})`);
    console.log(`--------------------------------------------------`);

    // Fetch users from master that belong to this school
    const masterUsers = await masterPrisma.user.findMany({
      where: { id_ecole: s.id },
      select: { id: true, nom: true, email: true, role: true }
    });

    console.log(`Master DB Users for School ${s.id}:`);
    masterUsers.forEach(u => console.log(`  [Master] ${u.role.toUpperCase()} | Nom: ${u.nom} | Email: ${u.email}`));

    if (s.database_url) {
      let dbUrl = s.database_url;
      if (dbUrl.includes(':5432/')) dbUrl = dbUrl.replace(':5432/', ':6543/');
      if (!dbUrl.includes('pgbouncer=true')) dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'pgbouncer=true';

      const tenantPrisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });
      try {
        const tenantUsers = await tenantPrisma.user.findMany({
          select: { id: true, nom: true, email: true, role: true }
        });
        console.log(`Tenant DB Users for School ${s.id}:`);
        tenantUsers.forEach(u => console.log(`  [Tenant] ${u.role.toUpperCase()} | Nom: ${u.nom} | Email: ${u.email}`));
      } catch (e: any) {
        console.log(`  [Tenant DB Error]: ${e.message}`);
      } finally {
        await tenantPrisma.$disconnect();
      }
    }
  }

  await masterPrisma.$disconnect();
}

generateTable().catch(console.error);
