const { PrismaClient } = require('@prisma/client');

async function main() {
  const tenantUrl = 'mysql://root@127.0.0.1:3306/monecole_lycee_abou';
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: tenantUrl,
      },
    },
  });

  const users = await prisma.user.findMany();
  console.log('Users in Lycée Abou:', JSON.stringify(users, null, 2));
  
  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.update({
    where: { email: 'admin@abou.com' },
    data: { password: hashedPassword }
  });
  console.log('Password updated for admin@abou.com');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
