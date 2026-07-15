
const { provisionTenantDatabase } = require('../lib/db-provisioner');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function setupTestSchool() {
  const masterPrisma = new PrismaClient();
  const schoolName = "École Excellence";
  const slug = "excellence";
  const dbName = `monecole_excellence`;

  try {
    console.log(`Setting up school: ${schoolName}...`);

    // 1. Provision the database
    const provision = await provisionTenantDatabase(dbName);
    if (!provision.success) {
      throw new Error(`Failed to provision: ${provision.error}`);
    }

    console.log(`DB Provisioned at: ${provision.url}`);

    // 2. Register school in Master DB
    const school = await masterPrisma.ecoles.upsert({
      where: { subdomain: slug },
      update: { database_url: provision.url },
      create: {
        nom: schoolName,
        subdomain: slug,
        database_url: provision.url,
        plan: 'premium'
      }
    });

    console.log(`School recorded in Master DB with ID: ${school.id}`);

    // 3. Create an admin user in the Tenant DB
    const tenantPrisma = new PrismaClient({
      datasources: { db: { url: provision.url } }
    });

    const hashedPassword = await bcrypt.hash("admin123", 10);
    const adminEmail = "admin@excellence.com";

    // Create a stub school in the tenant DB first to satisfy FK
    await tenantPrisma.ecoles.upsert({
      where: { id: school.id },
      update: { nom: schoolName },
      create: {
        id: school.id,
        nom: schoolName,
        subdomain: slug
      }
    });

    await tenantPrisma.user.upsert({
      where: { email: adminEmail },
      update: { password: hashedPassword },
      create: {
        nom: "Directeur Excellence",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        id_ecole: school.id
      }
    });

    console.log(`Admin user ${adminEmail} created in Tenant DB.`);
    console.log("Setup complete! You can now access excellence.localhost:3000/login");

  } catch (error) {
    console.error("Setup failed:", error);
  } finally {
    await masterPrisma.$disconnect();
  }
}

setupTestSchool();
