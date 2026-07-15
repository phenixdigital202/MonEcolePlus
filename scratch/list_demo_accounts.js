const { getTenantClient } = require('../lib/prisma-tenant');

async function listDemoUsers() {
  const dbUrl = "mysql://root@127.0.0.1:3306/monecole_inter";
  const prisma = getTenantClient(dbUrl);
  
  try {
    const users = await prisma.user.findMany({
      select: { email: true, role: true, nom: true }
    });
    console.log('--- Account Demo for SCHOOL INTER ---');
    users.forEach(u => {
      console.log(`Role: ${u.role.padEnd(8)} | Email: ${u.email.padEnd(25)} | Nom: ${u.nom}`);
    });
    console.log('Password for all: demo123');
  } catch (e) {
    console.error("Error:", e.message);
  }
}

listDemoUsers();
