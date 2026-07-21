const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function createSchool() {
  const prisma = new PrismaClient();

  try {
    console.log("[Script] Starting creation for Lycée Moderne d'Abou...");

    // 1. Create Ecole
    const ecole = await prisma.ecole.create({
      data: {
        nom: "Lycée Moderne d'Abou",
        subdomain: "abou",
        plan: "premium",
      }
    });
    console.log(`[Script] Created Ecole with ID: ${ecole.id}`);

    // 2. Create Admin User
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const adminUser = await prisma.user.create({
      data: {
        nom: "Admin Abou",
        email: "admin@abou.com",
        password: hashedPassword,
        role: "admin",
        id_ecole: ecole.id
      }
    });
    console.log(`[Script] Created Admin user: ${adminUser.email}`);

    // 3. Create Classes
    const classes = [
      { nom: "CP1", niveau: "Primaire" },
      { nom: "CP2", niveau: "Primaire" },
      { nom: "CE1", niveau: "Primaire" },
      { nom: "CE2", niveau: "Primaire" },
      { nom: "CM1", niveau: "Primaire" },
      { nom: "CM2", niveau: "Primaire" },
      { nom: "6ème", niveau: "Collège" },
      { nom: "5ème", niveau: "Collège" },
      { nom: "4ème", niveau: "Collège" },
      { nom: "3ème", niveau: "Collège" },
      { nom: "2nde", niveau: "Lycée" },
      { nom: "1ère", niveau: "Lycée" },
      { nom: "Terminale", niveau: "Lycée" }
    ];

    console.log(`[Script] Creating ${classes.length} classes...`);
    for (const c of classes) {
      await prisma.class.create({
        data: {
          nom: c.nom,
          niveau: c.niveau,
          id_ecole: ecole.id
        }
      });
    }
    console.log(`[Script] Classes created successfully.`);

    console.log("\n=== SUCCESS ===");
    console.log(`School: Lycée Moderne d'Abou`);
    console.log(`Admin Email: admin@abou.com`);
    console.log(`Password: admin123`);

  } catch (error) {
    console.error("[Script] Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createSchool();
