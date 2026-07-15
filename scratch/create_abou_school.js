const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { execSync } = require('child_process');
const mysql = require('mysql2/promise');

async function createSchool() {
  const schoolName = "Lycée Moderne d'Abou";
  const slug = "lycee-abou";
  const dbName = "monecole_lycee_abou";
  const adminEmail = "admin@abou.com";
  const adminPassword = "admin123";

  console.log(`[Script] Starting creation for: ${schoolName}`);

  // 1. Create the MySQL Database
  const host = '127.0.0.1';
  const port = 3306;
  const user = 'root';
  const password = '';

  console.log(`[Script] Connecting to MySQL server to create database: ${dbName}`);
  const connection = await mysql.createConnection({ host, port, user, password });
  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`[Script] Database \`${dbName}\` created/verified.`);
  } catch (error) {
    console.error(`[Script] Failed to create database:`, error);
    process.exit(1);
  } finally {
    await connection.end();
  }

  // 2. Initialize schema via Prisma db push
  const tenantUrl = `mysql://${user}:${password}@${host}:${port}/${dbName}`;
  console.log(`[Script] Running prisma db push to initialize schema for ${dbName}...`);
  try {
    execSync(`npx prisma db push --skip-generate --accept-data-loss`, {
      env: {
        ...process.env,
        DATABASE_URL: tenantUrl,
      },
      stdio: 'inherit',
    });
    console.log(`[Script] Schema initialized successfully.`);
  } catch (error) {
    console.error(`[Script] Prisma push failed:`, error);
    process.exit(1);
  }

  // 3. Setup Master database entry
  const masterPrisma = new PrismaClient({
    datasources: {
      db: {
        url: `mysql://${user}:${password}@${host}:${port}/monecole`
      }
    }
  });

  let school;
  try {
    console.log(`[Script] Creating master entry for school in 'monecole'...`);
    school = await masterPrisma.ecoles.upsert({
      where: { subdomain: slug },
      update: { database_url: tenantUrl, db_status: 'ready' },
      create: {
        nom: schoolName,
        subdomain: slug,
        database_url: tenantUrl,
        plan: 'premium',
        db_status: 'ready'
      }
    });
    console.log(`[Script] Master entry created/updated with ID: ${school.id}`);
  } catch (error) {
    console.error(`[Script] Failed to create master school entry:`, error);
    await masterPrisma.$disconnect();
    process.exit(1);
  }

  // 4. Connect to Tenant DB and insert stub, admin, and classes
  const tenantPrisma = new PrismaClient({
    datasources: {
      db: {
        url: tenantUrl
      }
    }
  });

  try {
    console.log(`[Script] Setting up tenant database records...`);

    // Stub school entry in tenant DB (needed to satisfy foreign keys)
    await tenantPrisma.ecoles.upsert({
      where: { id: school.id },
      update: { nom: schoolName, subdomain: slug },
      create: {
        id: school.id,
        nom: schoolName,
        subdomain: slug,
        database_url: tenantUrl,
        db_status: 'ready'
      }
    });
    console.log(`[Script] Tenant school stub created.`);

    // Admin user
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const adminUser = await tenantPrisma.user.upsert({
      where: { email: adminEmail },
      update: {
        nom: "Admin Abou",
        password: hashedPassword,
        role: "admin",
        id_ecole: school.id
      },
      create: {
        nom: "Admin Abou",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        id_ecole: school.id
      }
    });
    console.log(`[Script] Admin user '${adminEmail}' created/updated with ID: ${adminUser.id}`);

    // Classes structure
    const classesToSeed = [
      // Primaire
      { nom: "CP1", niveau: "CP1" },
      { nom: "CP2", niveau: "CP2" },
      { nom: "CE1", niveau: "CE1" },
      { nom: "CE2", niveau: "CE2" },
      { nom: "CM1", niveau: "CM1" },
      { nom: "CM2", niveau: "CM2" },
      // Collège
      { nom: "6ème", niveau: "6ème" },
      { nom: "5ème", niveau: "5ème" },
      { nom: "4ème", niveau: "4ème" },
      { nom: "3ème", niveau: "3ème" },
      // Lycée
      { nom: "2nde", niveau: "Seconde" },
      { nom: "1ère", niveau: "Première" },
      { nom: "Terminale", niveau: "Terminale" }
    ];

    console.log(`[Script] Seeding ${classesToSeed.length} classes...`);
    for (const classData of classesToSeed) {
      // Find if class already exists by name in this tenant DB
      const existingClass = await tenantPrisma.class.findFirst({
        where: { nom: classData.nom, id_ecole: school.id }
      });

      if (!existingClass) {
        await tenantPrisma.class.create({
          data: {
            nom: classData.nom,
            niveau: classData.niveau,
            id_ecole: school.id
          }
        });
      } else {
        await tenantPrisma.class.update({
          where: { id: existingClass.id },
          data: {
            niveau: classData.niveau
          }
        });
      }
    }
    console.log(`[Script] Classes seeded successfully.`);
    console.log(`\n=== SUCCESS ===`);
    console.log(`School: ${schoolName}`);
    console.log(`Subdomain: ${slug}`);
    console.log(`Tenant Database: ${dbName}`);
    console.log(`Admin User: ${adminEmail}`);
    console.log(`Admin Password: ${adminPassword}`);

  } catch (error) {
    console.error(`[Script] Failed during tenant DB setup:`, error);
  } finally {
    await masterPrisma.$disconnect();
    await tenantPrisma.$disconnect();
  }
}

createSchool();
