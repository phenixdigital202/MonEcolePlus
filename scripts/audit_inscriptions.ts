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

async function auditInscriptions() {
  let masterDbUrl = process.env.DATABASE_URL;
  if (masterDbUrl && masterDbUrl.includes(':5432/')) masterDbUrl = masterDbUrl.replace(':5432/', ':6543/');
  if (masterDbUrl && !masterDbUrl.includes('pgbouncer=true')) masterDbUrl += (masterDbUrl.includes('?') ? '&' : '?') + 'pgbouncer=true';
  
  const masterPrisma = new PrismaClient({ datasources: { db: { url: masterDbUrl } } });
  const schools = await masterPrisma.ecole.findMany();

  for (const s of schools) {
    if (!s.database_url) continue;
    let dbUrl = s.database_url;
    if (dbUrl.includes(':5432/')) dbUrl = dbUrl.replace(':5432/', ':6543/');
    if (!dbUrl.includes('pgbouncer=true')) dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'pgbouncer=true';

    const tenantPrisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });
    try {
      const classes = await tenantPrisma.class.findMany();
      const inscriptions = await tenantPrisma.inscription.findMany({ include: { user: true } });
      const users = await tenantPrisma.user.findMany();
      const schoolYears = await tenantPrisma.schoolYear.findMany();

      console.log(`\n--- School ID ${s.id}: ${s.nom} ---`);
      console.log(`Classes: ${classes.map(c => `${c.id}:${c.nom}`).join(', ')}`);
      console.log(`Active School Year:`, schoolYears.find(sy => sy.status === 'ACTIVE'));
      console.log(`Users total: ${users.length} (Roles: ${Array.from(new Set(users.map(u => u.role))).join(', ')})`);
      console.log(`Inscriptions count: ${inscriptions.length}`);
      
      inscriptions.forEach(i => {
        console.log(`  Class ${i.id_classe} -> Student ${i.id_eleve} (${i.user?.nom}, role: ${i.user?.role}), Statut: ${i.statut}, Year: ${i.annee_scolaire} (id_annee: ${i.id_annee_scolaire})`);
      });

    } catch (e: any) {
      console.error(`Error for school ${s.id}:`, e.message);
    } finally {
      await tenantPrisma.$disconnect();
    }
  }

  await masterPrisma.$disconnect();
}

auditInscriptions().catch(console.error);
