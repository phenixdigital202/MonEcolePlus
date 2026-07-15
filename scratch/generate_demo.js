
const { provisionTenantDatabase } = require('../lib/db-provisioner');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function generateDemoSchool() {
  const masterPrisma = new PrismaClient();
  const schoolName = "École Internationale";
  const slug = "inter";
  const dbName = `monecole_inter`;

  try {
    console.log(`[Demo] Generating demo school: ${schoolName}...`);

    // 1. Provision
    const provision = await provisionTenantDatabase(dbName);
    if (!provision.success) throw new Error(provision.error);

    // 2. Master Entry
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

    // 3. Tenant Data
    const prisma = new PrismaClient({
      datasources: { db: { url: provision.url } }
    });

    const hashedPassword = await bcrypt.hash("demo123", 10);

    // Stub school in tenant
    await prisma.ecoles.create({
      data: { id: school.id, nom: schoolName, subdomain: slug }
    });

    // Admin
    await prisma.user.create({
      data: {
        nom: "Directeur Inter",
        email: "dir@inter.com",
        password: hashedPassword,
        role: "admin",
        id_ecole: school.id
      }
    });

    // Classes
    const c1 = await prisma.class.create({ data: { nom: "6ème A", niveau: "Collège", id_ecole: school.id } });
    const c2 = await prisma.class.create({ data: { nom: "3ème B", niveau: "Collège", id_ecole: school.id } });

    // Teacher
    const teacher = await prisma.user.create({
      data: {
        nom: "Prof. Martin",
        email: "martin@inter.com",
        password: hashedPassword,
        role: "teacher",
        id_ecole: school.id
      }
    });

    // Students
    const students = ["Jean Dupont", "Marie Curie", "Paul Valery"];
    for (const name of students) {
        const s = await prisma.user.create({
            data: {
                nom: name,
                email: `${name.toLowerCase().replace(' ', '.')}@inter.com`,
                password: hashedPassword,
                role: "student",
                id_ecole: school.id
            }
        });
        // Enroll in 6ème A
        await prisma.inscription.create({
            data: { id_eleve: s.id, id_classe: c1.id, annee_scolaire: "2023-2024" }
        });
    }

    console.log("[Demo] Success! Access it at: http://inter.localhost:3000/login");
    console.log("[Demo] Admin: dir@inter.com / demo123");

  } catch (error) {
    console.error("[Demo] Generation failed:", error);
  } finally {
    await masterPrisma.$disconnect();
  }
}

generateDemoSchool();
