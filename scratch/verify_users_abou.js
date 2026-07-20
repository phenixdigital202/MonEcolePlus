const { PrismaClient } = require('@prisma/client');

async function verify() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: "mysql://root:@127.0.0.1:3306/monecole_lycee_abou"
      }
    }
  });

  try {
    console.log("=== VERIFYING CREATED USERS ===");
    const users = await prisma.user.findMany();
    console.log("All Users in Tenant DB:");
    users.forEach(u => {
      console.log(`- ID: ${u.id} | Nom: ${u.nom} | Email: ${u.email} | Role: ${u.role} | Matière: ${u.matiere || 'N/A'}`);
    });

    console.log("\n=== VERIFYING PARENT-CHILD LINKS ===");
    const parentLinks = await prisma.parentEleve.findMany({
      include: {
        parent: true,
        eleve: true
      }
    });
    console.log("Parent-Child Links:");
    parentLinks.forEach(link => {
      console.log(`- Parent: ${link.parent.nom} (${link.parent.email}) -> Child: ${link.eleve.nom} (${link.eleve.email})`);
    });

    console.log("\n=== VERIFYING ENROLLMENTS ===");
    const inscriptions = await prisma.inscription.findMany({
      include: {
        eleve: true,
        classe: true
      }
    });
    console.log("Inscriptions / Enrollments:");
    inscriptions.forEach(ins => {
      console.log(`- Student: ${ins.eleve.nom} enrolled in Class: ${ins.classe.nom} (${ins.classe.niveau}) for Year: ${ins.annee_scolaire}`);
    });

    if (parentLinks.length === 2 && inscriptions.length === 2) {
      console.log("\nVERIFICATION SUCCESS: All relations are correctly established!");
    } else {
      console.error("\nVERIFICATION WARNING: Relations count does not match expected numbers.");
    }
  } catch (error) {
    console.error("Verification failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
