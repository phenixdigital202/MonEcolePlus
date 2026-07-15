const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "mysql://root:@127.0.0.1:3306/monecole_lycee_abou"
    }
  }
});

async function main() {
  const classes = await prisma.class.findMany();
  let teachers = await prisma.user.findMany({ where: { role: 'teacher' } });
  
  if (teachers.length === 0) {
    console.log("No teachers found. Creating a default teacher...");
    const hashedPassword = await bcrypt.hash('password123', 10);
    const teacher = await prisma.user.create({
        data: {
            nom: "Prof. Jean Martin",
            email: "jean.martin@ecole.fr",
            password: hashedPassword,
            role: "teacher"
        }
    });
    teachers = [teacher];
  }

  if (classes.length === 0) {
    console.log("No classes found.");
    return;
  }

  const subjects = ["Mathématiques", "Français", "Anglais", "SVT", "Physique-Chimie", "Histoire-Géo", "EPS"];
  const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  const slots = ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];
  
  const newEntries = [];

  for (const classe of classes) {
    for (const day of days) {
      const daySlots = [...slots].sort(() => Math.random() - 0.5).slice(0, 4);
      for (const slot of daySlots) {
        const subject = subjects[Math.floor(Math.random() * subjects.length)];
        const teacher = teachers[Math.floor(Math.random() * teachers.length)];
        
        const h = parseInt(slot.split(":")[0]);
        const heure_debut = new Date(`1970-01-01T${slot}:00Z`);
        const heure_fin = new Date(`1970-01-01T${(h+1).toString().padStart(2, '0')}:00:00Z`);

        newEntries.push({
          id_classe: classe.id,
          id_enseignant: teacher.id,
          matiere: subject,
          jour: day,
          heure_debut,
          heure_fin,
          salle: `Salle ${Math.floor(Math.random() * 20) + 100}`
        });
      }
    }
  }

  await prisma.emplois_du_temps.deleteMany();
  await prisma.emplois_du_temps.createMany({ data: newEntries });
  console.log(`Generated ${newEntries.length} schedule entries for all classes.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
