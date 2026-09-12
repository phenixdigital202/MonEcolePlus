import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
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

async function syncAllUsersAndPasswords() {
  let masterDbUrl = process.env.DATABASE_URL;
  if (masterDbUrl && masterDbUrl.includes(':5432/')) masterDbUrl = masterDbUrl.replace(':5432/', ':6543/');
  if (masterDbUrl && !masterDbUrl.includes('pgbouncer=true')) masterDbUrl += (masterDbUrl.includes('?') ? '&' : '?') + 'pgbouncer=true';

  const masterPrisma = new PrismaClient({ datasources: { db: { url: masterDbUrl } } });
  const hashedPassword = await bcrypt.hash('password123', 10);

  console.log('=== LOWER-CASING EMAILS & SYNCING PASSWORDS IN MASTER DB ===');

  const masterUsers = await masterPrisma.user.findMany();
  for (const u of masterUsers) {
    const lowerEmail = u.email.toLowerCase().trim();
    await masterPrisma.user.update({
      where: { id: u.id },
      data: {
        email: lowerEmail,
        password: hashedPassword
      }
    });
    console.log(`[Master DB] User ID ${u.id}: Email set to "${lowerEmail}", password synced to password123.`);
  }

  // Also sync in all Tenant DBs
  const schools = await masterPrisma.ecole.findMany();
  for (const s of schools) {
    if (!s.database_url) continue;
    let dbUrl = s.database_url;
    if (dbUrl.includes(':5432/')) dbUrl = dbUrl.replace(':5432/', ':6543/');
    if (!dbUrl.includes('pgbouncer=true')) dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'pgbouncer=true';

    const tenantPrisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });
    try {
      const tenantUsers = await tenantPrisma.user.findMany();
      for (const tu of tenantUsers) {
        const lowerEmail = tu.email.toLowerCase().trim();
        await tenantPrisma.user.update({
          where: { id: tu.id },
          data: {
            email: lowerEmail,
            password: hashedPassword
          }
        });
      }
      console.log(`[Tenant DB ${s.id} - ${s.nom}] ${tenantUsers.length} users updated and synchronized.`);
    } catch (e: any) {
      console.error(`[Tenant DB ${s.id} - ${s.nom}] Error:`, e.message);
    } finally {
      await tenantPrisma.$disconnect();
    }
  }

  await masterPrisma.$disconnect();
  console.log('\n=== ALL USERS IN MASTER & TENANTS ARE NOW LOWERCASED & HAVE password123 ===');
}

syncAllUsersAndPasswords().catch(console.error);
