import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    for (const line of envConfig.split('\n')) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*"(.*)"\s*$/) || line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
      if (match) {
        process.env[match[1]] = match[2].trim();
      }
    }
  }
}
loadEnv();

async function diagnoseAbou() {
  let masterDbUrl = process.env.DATABASE_URL;
  if (masterDbUrl && masterDbUrl.includes(':5432/')) {
    masterDbUrl = masterDbUrl.replace(':5432/', ':6543/');
  }
  if (masterDbUrl && !masterDbUrl.includes('pgbouncer=true')) {
    masterDbUrl += (masterDbUrl.includes('?') ? '&' : '?') + 'pgbouncer=true';
  }
  const masterPrisma = new PrismaClient({
    datasources: { db: { url: masterDbUrl } }
  });

  const abouSchool = await masterPrisma.ecole.findFirst({
    where: { id: 3 }
  });

  console.log('School 3:', abouSchool?.nom, abouSchool?.database_url);

  if (!abouSchool || !abouSchool.database_url) return;

  let dbUrl = abouSchool.database_url;
  if (dbUrl.includes(':5432/')) {
    dbUrl = dbUrl.replace(':5432/', ':6543/');
  }
  if (!dbUrl.includes('pgbouncer=true')) {
    dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'pgbouncer=true';
  }

  const tenantPrisma = new PrismaClient({
    datasources: { db: { url: dbUrl } }
  });

  console.log('\n=== CLASSES ===');
  const classes = await tenantPrisma.class.findMany();
  console.log(classes);

  console.log('\n=== USERS ===');
  const users = await tenantPrisma.user.findMany();
  console.log(users);

  console.log('\n=== INSCRIPTIONS ===');
  const inscriptions = await tenantPrisma.inscription.findMany({
    include: { user: true, classe: true }
  });
  console.log(inscriptions);

  console.log('\n=== SCHOOL YEARS ===');
  const schoolYears = await tenantPrisma.schoolYear.findMany();
  console.log(schoolYears);

  console.log('\n=== EVALUATIONS ===');
  const evaluations = await tenantPrisma.evaluation.findMany({
    include: { notes: true, classe: true }
  });
  console.log(evaluations);

  console.log('\n=== NOTES ===');
  const notes = await tenantPrisma.note.findMany();
  console.log(notes);

  await tenantPrisma.$disconnect();
  await masterPrisma.$disconnect();
}

diagnoseAbou().catch(console.error);
