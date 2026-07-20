const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "mysql://root:@127.0.0.1:3306/monecole_lycee_abou"
    }
  }
});

async function main() {
  const count = await prisma.badge.count();
  if (count === 0) {
    console.log("Seeding badges...");
    await prisma.badge.createMany({
      data: [
        { nom: "Premier de Classe", description: "Terminer au sommet du classement.", icon_name: "Crown" },
        { nom: "Assidu", description: "Aucune absence enregistrée ce mois.", icon_name: "UserCheck" },
        { nom: "Mathématicien", description: "Moyenne > 15 en Mathématiques.", icon_name: "Calculator" },
        { nom: "Génie", description: "Obtenir un 20/20 lors d'un examen.", icon_name: "Zap" },
        { nom: "Explorateur", description: "Visiter toutes les pages du dashboard.", icon_name: "Rocket" },
        { nom: "Étoile", description: "Participation active en classe.", icon_name: "Star" }
      ]
    });
  }
  
  // Award a badge to student Ab5 Toure (ID 6) for testing
  const studentId = 6;
  const badge = await prisma.badge.findFirst({ where: { nom: "Premier de Classe" } });
  if (badge) {
    const existing = await prisma.eleveBadge.findFirst({
        where: { id_eleve: studentId, id_badge: badge.id }
    });
    if (!existing) {
        await prisma.eleveBadge.create({
            data: {
                id_eleve: studentId,
                id_badge: badge.id,
                date_obtention: new Date()
            }
        });
        console.log("Awarded badge to student ID 6");
    }
  }

  console.log("Badges count:", await prisma.badge.count());
}

main().catch(console.error).finally(() => prisma.$disconnect());
