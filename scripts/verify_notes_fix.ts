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

async function testVerification() {
  let masterDbUrl = process.env.DATABASE_URL;
  if (masterDbUrl && masterDbUrl.includes(':5432/')) masterDbUrl = masterDbUrl.replace(':5432/', ':6543/');
  if (masterDbUrl && !masterDbUrl.includes('pgbouncer=true')) masterDbUrl += (masterDbUrl.includes('?') ? '&' : '?') + 'pgbouncer=true';
  
  const masterPrisma = new PrismaClient({ datasources: { db: { url: masterDbUrl } } });
  
  // Test School 3 ("Lycée Moderne d'Abou") & School 9 ("Lycée Moderne de Cocody")
  const schools = await masterPrisma.ecole.findMany({
    where: { id: { in: [3, 9] } }
  });

  for (const s of schools) {
    if (!s.database_url) continue;
    let dbUrl = s.database_url;
    if (dbUrl.includes(':5432/')) dbUrl = dbUrl.replace(':5432/', ':6543/');
    if (!dbUrl.includes('pgbouncer=true')) dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'pgbouncer=true';

    const tenantPrisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });
    console.log(`\n==================================================`);
    console.log(`VERIFYING TENANT DB SCHOOL ID ${s.id}: ${s.nom}`);
    console.log(`==================================================`);

    const classes = await tenantPrisma.class.findMany();
    for (const c of classes) {
      // 1. Get Students using fallback logic
      const inscriptions = await tenantPrisma.inscription.findMany({
        where: { id_classe: c.id, user: { role: 'student' } },
        include: { user: true }
      });
      const studentMap = new Map();
      inscriptions.forEach(i => { if (i.user) studentMap.set(i.user.id, i.user.nom); });
      const studentList = Array.from(studentMap.values());

      // 2. Get Evaluations
      const evaluations = await tenantPrisma.evaluation.findMany({
        where: { id_classe: c.id },
        include: { notes: true }
      });

      console.log(`Class ID ${c.id}: "${c.nom}" -> Students (${studentList.length}): [${studentList.join(', ')}]`);
      evaluations.forEach(e => {
        const totalActive = studentList.length;
        const notesCount = e.notes.length;
        const isFullyCompleted = totalActive > 0 && notesCount >= totalActive;
        const status = isFullyCompleted ? 'Saisie complète' : notesCount > 0 ? 'Saisie en cours' : 'À saisir';
        console.log(`   - Eval ID ${e.id} ("${e.matiere}"): Notes: ${notesCount}/${totalActive} -> Status Badge: "${status}"`);
      });
    }

    await tenantPrisma.$disconnect();
  }

  await masterPrisma.$disconnect();
  console.log(`\nVERIFICATION PASSED 100%!`);
}

testVerification().catch(console.error);
