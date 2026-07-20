import prisma from '../lib/prisma';

async function check() {
  const schools = await prisma.ecole.findMany();
  console.log('--- Schools in Master DB ---');
  schools.forEach(s => {
    console.log(`ID: ${s.id} | Nom: ${s.nom} | Subdomain: ${s.subdomain} | DB: ${s.database_url}`);
  });
}

check();
