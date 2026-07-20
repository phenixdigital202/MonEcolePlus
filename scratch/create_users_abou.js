const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function createUsers() {
  const tenantUrl = "mysql://root:@127.0.0.1:3306/monecole_lycee_abou";
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: tenantUrl
      }
    }
  });

  const schoolId = 1;

  try {
    console.log("[Script] Connecting to tenant database...");

    // Passwords hashing
    const teacherPasswordHash = await bcrypt.hash("teacher123", 10);
    const parentPasswordHash = await bcrypt.hash("parent123", 10);
    const child1PasswordHash = await bcrypt.hash("yao123", 10);
    const child2PasswordHash = await bcrypt.hash("amenan123", 10);

    // 1. Create Teacher
    const teacher = await prisma.user.upsert({
      where: { email: "koffi.teacher@abou.com" },
      update: {
        nom: "Prof. Kouamé Koffi",
        password: teacherPasswordHash,
        role: "teacher",
        matiere: "Mathématiques",
        id_ecole: schoolId
      },
      create: {
        nom: "Prof. Kouamé Koffi",
        email: "koffi.teacher@abou.com",
        password: teacherPasswordHash,
        role: "teacher",
        matiere: "Mathématiques",
        id_ecole: schoolId
      }
    });
    console.log(`[Script] Teacher created: ${teacher.nom} (${teacher.email})`);

    // 2. Create Parent
    const parent = await prisma.user.upsert({
      where: { email: "konan.parent@abou.com" },
      update: {
        nom: "M. Konan Kouassi",
        password: parentPasswordHash,
        role: "parent",
        id_ecole: schoolId
      },
      create: {
        nom: "M. Konan Kouassi",
        email: "konan.parent@abou.com",
        password: parentPasswordHash,
        role: "parent",
        id_ecole: schoolId
      }
    });
    console.log(`[Script] Parent created: ${parent.nom} (${parent.email})`);

    // 3. Create Child 1 (Yao - 6ème)
    const child1 = await prisma.user.upsert({
      where: { email: "yao.student@abou.com" },
      update: {
        nom: "Kouassi Yao",
        password: child1PasswordHash,
        role: "student",
        id_ecole: schoolId
      },
      create: {
        nom: "Kouassi Yao",
        email: "yao.student@abou.com",
        password: child1PasswordHash,
        role: "student",
        id_ecole: schoolId
      }
    });
    console.log(`[Script] Child 1 created: ${child1.nom} (${child1.email})`);

    // 4. Create Child 2 (Amenan - CM2)
    const child2 = await prisma.user.upsert({
      where: { email: "amenan.student@abou.com" },
      update: {
        nom: "Kouassi Amenan",
        password: child2PasswordHash,
        role: "student",
        id_ecole: schoolId
      },
      create: {
        nom: "Kouassi Amenan",
        email: "amenan.student@abou.com",
        password: child2PasswordHash,
        role: "student",
        id_ecole: schoolId
      }
    });
    console.log(`[Script] Child 2 created: ${child2.nom} (${child2.email})`);

    // 5. Link parent and students in parent_eleve table
    // Delete existing links first if any to avoid duplicates
    await prisma.parentEleve.deleteMany({
      where: { id_parent: parent.id }
    });

    await prisma.parentEleve.create({
      data: {
        id_parent: parent.id,
        id_eleve: child1.id
      }
    });
    await prisma.parentEleve.create({
      data: {
        id_parent: parent.id,
        id_eleve: child2.id
      }
    });
    console.log("[Script] Linked Parent to both children in parent_eleve table.");

    // 6. Enroll students in their respective classes
    // Get classes
    const class6eme = await prisma.class.findFirst({
      where: { nom: "6ème", id_ecole: schoolId }
    });
    const classCM2 = await prisma.class.findFirst({
      where: { nom: "CM2", id_ecole: schoolId }
    });

    if (class6eme) {
      await prisma.inscription.deleteMany({ where: { id_eleve: child1.id } });
      await prisma.inscription.create({
        data: {
          id_eleve: child1.id,
          id_classe: class6eme.id,
          annee_scolaire: "2025-2026"
        }
      });
      console.log(`[Script] Enrolled ${child1.nom} in class ${class6eme.nom}`);
    } else {
      console.error("[Script] Error: Class '6ème' not found!");
    }

    if (classCM2) {
      await prisma.inscription.deleteMany({ where: { id_eleve: child2.id } });
      await prisma.inscription.create({
        data: {
          id_eleve: child2.id,
          id_classe: classCM2.id,
          annee_scolaire: "2025-2026"
        }
      });
      console.log(`[Script] Enrolled ${child2.nom} in class ${classCM2.nom}`);
    } else {
      console.error("[Script] Error: Class 'CM2' not found!");
    }

    console.log("\n=== SUCCESS ===");
    console.log("All accounts created and configured successfully!");

  } catch (error) {
    console.error("[Script] Failed to create users:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createUsers();
