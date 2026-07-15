const { getTenantClient } = require('../lib/prisma-tenant');

async function verifyInterDB() {
  const dbUrl = "mysql://root@127.0.0.1:3306/monecole_inter";
  const prisma = getTenantClient(dbUrl);
  
  try {
    const userCount = await prisma.user.count();
    const users = await prisma.user.findMany();
    console.log(`--- monecole_inter.users content (Total: ${userCount}) ---`);
    users.forEach(u => console.log(`- ${u.email} (${u.role})` || 'No Email'));
    
    // Check school stub
    const schools = await prisma.ecoles.findMany();
    console.log(`--- monecole_inter.ecoles content ---`);
    schools.forEach(s => console.log(`- ${s.nom} (Sub: ${s.subdomain})`));
  } catch (e) {
    console.error("Error checking monecole_inter:", e.message);
  }
}

verifyInterDB();
