const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function seedAbou() {
  const dbUrl = "postgresql://postgres.nfrripylvuzxpuipdrpy:MonEcolePlus@aws-0-eu-west-3.pooler.supabase.com:6543/monecole_abou_4366?pgbouncer=true";
  console.log(`Connecting to tenant DB: ${dbUrl}`);
  
  const tenantPrisma = new PrismaClient({
    datasources: { db: { url: dbUrl } }
  });

  try {
    const ecole = await tenantPrisma.ecole.create({
      data: {
        id: 3,
        nom: "Lycée Moderne d'Abou",
        subdomain: "abou",
      }
    });
    console.log("Created ecole stub.");

    const hashedPassword = await bcrypt.hash("admin123", 10);
    const adminUser = await tenantPrisma.user.create({
      data: {
        nom: "Admin Abou",
        email: "admin@abou.com",
        password: hashedPassword,
        role: "admin",
        id_ecole: 3
      }
    });
    console.log("Created Admin Abou.");

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

    for (const c of classes) {
      await tenantPrisma.class.create({
        data: {
          nom: c.nom,
          niveau: c.niveau,
          id_ecole: 3
        }
      });
    }
    console.log("Created 13 classes.");
    console.log("Done seeding Abou tenant DB.");
  } catch (error) {
    console.error("Error seeding:", error);
  } finally {
    await tenantPrisma.$disconnect();
  }
}

seedAbou();
