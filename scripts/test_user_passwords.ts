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

async function testUserPasswords() {
  let masterDbUrl = process.env.DATABASE_URL;
  if (masterDbUrl && masterDbUrl.includes(':5432/')) masterDbUrl = masterDbUrl.replace(':5432/', ':6543/');
  if (masterDbUrl && !masterDbUrl.includes('pgbouncer=true')) masterDbUrl += (masterDbUrl.includes('?') ? '&' : '?') + 'pgbouncer=true';

  const masterPrisma = new PrismaClient({ datasources: { db: { url: masterDbUrl } } });

  console.log('=== TESTING PASSWORDS IN MASTER DB ===\n');

  const masterUsers = await masterPrisma.user.findMany({
    include: { ecole: { select: { id: true, nom: true, subdomain: true } } }
  });

  for (const u of masterUsers) {
    const match = await bcrypt.compare('password123', u.password);
    console.log(`[Master DB] User ID ${u.id} | Email: ${u.email} | Role: ${u.role} | School: "${u.ecole?.nom}" | password123 Match: ${match ? '✅ MATCH' : '❌ FAIL'}`);
  }

  await masterPrisma.$disconnect();
}

testUserPasswords().catch(console.error);
