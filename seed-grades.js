const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const studentId = 3; // Abou Traore
  
  // 1. Get first class
  const classe = await prisma.class.findFirst();
  if (!classe) {
    console.error("No class found!");
    return;
  }

  // 2. Create inscription if not exists
  await prisma.inscription.upsert({
    where: { id: studentId }, // This is a dummy check
    create: {
      id_eleve: studentId,
      id_classe: classe.id,
      annee_scolaire: "2025-2026"
    },
    update: {
      id_classe: classe.id
    }
  });

  // 3. Create evaluations for predefined subjects
  const subjects = ["Mathématiques", "Français", "Anglais"];
  for (const subject of subjects) {
    const eval = await prisma.evaluations.create({
      data: {
        id_classe: classe.id,
        matiere: subject,
        date_eval: new Date(),
        type_eval: 'devoir',
        bareme: 20
      }
    });

    // 4. Create sample notes
    await prisma.notes.create({
      data: {
        id_evaluation: eval.id,
        id_eleve: studentId,
        valeur: 12 + Math.random() * 5,
        commentaire: "Bon travail"
      }
    });
  }

  console.log("Seeding finished!");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
