const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function run() {
  const password = "demo123";
  const hashedPassword = await bcrypt.hash(password, 10);

  // 1. Find the parent user in the default DB
  const user = await prisma.user.findFirst({
    where: {
      email: {
        equals: "Admin@bambaissa.com",
        mode: "insensitive"
      }
    }
  });

  if (user) {
    console.log("Found user:", user.nom, "with email:", user.email);
    
    // Update email to lowercase 'admin@bambaissa.com' and set password to 'demo123'
    await prisma.user.update({
      where: { id: user.id },
      data: {
        email: "admin@bambaissa.com",
        password: hashedPassword
      }
    });
    console.log("Updated user in default/master DB successfully!");
  } else {
    console.log("Parent user not found in default DB.");
  }

  // 2. Also check if the school has a custom tenant database and update there
  const ecole = await prisma.ecole.findUnique({
    where: { id: 1 } // school ID for parent's school
  });

  if (ecole && ecole.database_url) {
    console.log("School database URL:", ecole.database_url);
    const tenantPrisma = new PrismaClient({
      datasources: {
        db: {
          url: ecole.database_url,
        },
      },
    });
    
    const tenantUser = await tenantPrisma.user.findFirst({
      where: {
        email: {
          equals: "Admin@bambaissa.com",
          mode: "insensitive"
        }
      }
    });

    if (tenantUser) {
      console.log("Found tenant user:", tenantUser.nom);
      await tenantPrisma.user.update({
        where: { id: tenantUser.id },
        data: {
          email: "admin@bambaissa.com",
          password: hashedPassword
        }
      });
      console.log("Updated user in tenant DB successfully!");
    }
    await tenantPrisma.$disconnect();
  }
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
