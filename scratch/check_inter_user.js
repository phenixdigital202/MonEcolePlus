const { getTenantClient } = require('../lib/prisma-tenant');
const bcrypt = require('bcryptjs');

async function checkUser() {
  const dbUrl = "mysql://root@127.0.0.1:3306/monecole_inter";
  const prisma = getTenantClient(dbUrl);
  
  const user = await prisma.user.findUnique({
    where: { email: 'dir@inter.com' }
  });
  
  if (user) {
    console.log('User found in monecole_inter:');
    console.log(`ID: ${user.id}, Nom: ${user.nom}, Role: ${user.role}`);
    
    // Check password for 'demo123'
    const match = await bcrypt.compare('demo123', user.password);
    console.log(`Password 'demo123' matches: ${match}`);
  } else {
    console.log('User dir@inter.com NOT FOUND in monecole_inter');
  }
}

checkUser();
