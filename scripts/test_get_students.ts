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

async function testGetStudents() {
  let masterDbUrl = process.env.DATABASE_URL;
  if (masterDbUrl && masterDbUrl.includes(':5432/')) {
    masterDbUrl = masterDbUrl.replace(':5432/', ':6543/');
  }
  if (masterDbUrl && !masterDbUrl.includes('pgbouncer=true')) {
    masterDbUrl += (masterDbUrl.includes('?') ? '&' : '?') + 'pgbouncer=true';
  }
  const masterPrisma = new PrismaClient({ datasources: { db: { url: masterDbUrl } } });

  const school = await masterPrisma.ecole.findFirst({ where: { id: 3 } });
  let dbUrl = school!.database_url!;
  if (dbUrl.includes(':5432/')) dbUrl = dbUrl.replace(':5432/', ':6543/');
  if (!dbUrl.includes('pgbouncer=true')) dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'pgbouncer=true';

  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

  const classId = 13;

  // Test current getStudentsByClass logic
  const activeSchoolYear = await prisma.schoolYear.findFirst({
    where: { status: "ACTIVE" }
  });
  console.log('Active school year:', activeSchoolYear);

  const whereClause: any = {
    id_classe: classId,
    statut: 'active',
    user: { role: 'student' }
  };

  if (activeSchoolYear) {
    whereClause.OR = [
      { id_annee_scolaire: activeSchoolYear.id },
      { annee_scolaire: activeSchoolYear.label }
    ];
  }

  console.log('whereClause:', JSON.stringify(whereClause, null, 2));

  const inscriptions = await prisma.inscription.findMany({
    where: whereClause,
    include: { user: true }
  });

  console.log('Inscriptions found:', inscriptions.length);

  await prisma.$disconnect();
  await masterPrisma.$disconnect();
}

testGetStudents().catch(console.error);
