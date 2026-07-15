const { PrismaClient } = require('@prisma/client');

async function verify() {
  const masterPrisma = new PrismaClient({
    datasources: {
      db: {
        url: "mysql://root:@127.0.0.1:3306/monecole"
      }
    }
  });

  const tenantPrisma = new PrismaClient({
    datasources: {
      db: {
        url: "mysql://root:@127.0.0.1:3306/monecole_lycee_abou"
      }
    }
  });

  try {
    console.log("=== VERIFYING MASTER DB ===");
    const schools = await masterPrisma.ecoles.findMany({
      where: { subdomain: "lycee-abou" }
    });
    console.log("Schools found:", schools);
    if (schools.length === 0) {
      console.error("FAIL: School not found in master database!");
      return;
    }
    const school = schools[0];

    console.log("\n=== VERIFYING TENANT DB (monecole_lycee_abou) ===");
    
    // Check school stub
    const tenantSchools = await tenantPrisma.ecoles.findMany();
    console.log("Tenant school stub:", tenantSchools);
    if (tenantSchools.length === 0) {
      console.error("FAIL: School stub not found in tenant database!");
    }

    // Check admin
    const admins = await tenantPrisma.user.findMany({
      where: { email: "admin@abou.com" }
    });
    console.log("Admin users found:", admins.map(a => ({ id: a.id, nom: a.nom, email: a.email, role: a.role, id_ecole: a.id_ecole })));
    if (admins.length === 0) {
      console.error("FAIL: Admin user not found in tenant database!");
    }

    // Check classes
    const classes = await tenantPrisma.class.findMany({
      where: { id_ecole: school.id }
    });
    console.log(`Classes found (Total: ${classes.length}):`);
    classes.forEach(c => {
      console.log(`- ID: ${c.id} | Name: ${c.nom} | Level: ${c.niveau}`);
    });

    if (classes.length === 13) {
      console.log("\nSUCCESS: All 13 classes are successfully registered!");
    } else {
      console.error(`FAIL: Expected 13 classes, but found ${classes.length}`);
    }

  } catch (error) {
    console.error("Verification failed with error:", error);
  } finally {
    await masterPrisma.$disconnect();
    await tenantPrisma.$disconnect();
  }
}

verify();
