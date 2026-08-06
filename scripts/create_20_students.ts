import { PrismaClient } from "@prisma/client"

const STUDENTS = [
  { nom: "Kouamé Aya", email: "aya.kouame@monecole.ci" },
  { nom: "Traoré Mamadou", email: "mamadou.traore@monecole.ci" },
  { nom: "Koné Fatou", email: "fatou.kone@monecole.ci" },
  { nom: "Bamba Ibrahim", email: "ibrahim.bamba@monecole.ci" },
  { nom: "Coulibaly Aminata", email: "aminata.coulibaly@monecole.ci" },
  { nom: "Diallo Moussa", email: "moussa.diallo@monecole.ci" },
  { nom: "Ouattara Mariam", email: "mariam.ouattara@monecole.ci" },
  { nom: "Touré Seydou", email: "seydou.toure@monecole.ci" },
  { nom: "Yao Adjoua", email: "adjoua.yao@monecole.ci" },
  { nom: "Koffi Kouadio", email: "kouadio.koffi@monecole.ci" },
  { nom: "Aka Marie-Claire", email: "marie.aka@monecole.ci" },
  { nom: "N'Guessan Yves", email: "yves.nguessan@monecole.ci" },
  { nom: "Aké Sandrine", email: "sandrine.ake@monecole.ci" },
  { nom: "Dosso Abdoulaye", email: "abdoulaye.dosso@monecole.ci" },
  { nom: "Gbagbo Christelle", email: "christelle.gbagbo@monecole.ci" },
  { nom: "Soro Lacina", email: "lacina.soro@monecole.ci" },
  { nom: "Diarrassouba Aïcha", email: "aicha.diarrassouba@monecole.ci" },
  { nom: "Konan Jean-Baptiste", email: "jb.konan@monecole.ci" },
  { nom: "Diabaté Rokia", email: "rokia.diabate@monecole.ci" },
  { nom: "Fofana Issouf", email: "issouf.fofana@monecole.ci" },
]

async function main() {
  const dbUrl = "postgresql://postgres.nfrripylvuzxpuipdrpy:MonEcolePlus@aws-0-eu-west-3.pooler.supabase.com:5432/tenant_cocody_1785950690672"
  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } })

  console.log("=== CRÉATION DE 20 ÉLÈVES (User + Inscription) ===\n")

  const classes = await prisma.class.findMany()
  if (classes.length === 0) {
    console.log("❌ Aucune classe trouvée.")
    await prisma.$disconnect()
    return
  }
  console.log(`Classes: ${classes.map(c => `${c.nom} (ID: ${c.id})`).join(", ")}\n`)

  let created = 0
  for (let i = 0; i < STUDENTS.length; i++) {
    const s = STUDENTS[i]
    const classId = classes[i % classes.length].id

    try {
      // 1. Create User with role "student"
      const user = await prisma.user.create({
        data: {
          nom: s.nom,
          email: s.email,
          password: "$2b$10$placeholder_hash_for_test_students",
          role: "student",
          id_ecole: 9,
        }
      })

      // 2. Create Inscription linking user to class
      await prisma.inscription.create({
        data: {
          id_eleve: user.id,
          id_classe: classId,
          annee_scolaire: "2023-2024"
        }
      })

      created++
      console.log(`  ✅ [${String(created).padStart(2, "0")}] ${s.nom} → ${classes[i % classes.length].nom} (User ID: ${user.id})`)
    } catch (err: any) {
      console.log(`  ⚠️ ${s.nom}: ${err.message?.substring(0, 100)}`)
    }
  }

  console.log(`\n=== RÉSULTAT: ${created} / 20 élèves créés ===`)

  const totalUsers = await prisma.user.count({ where: { role: "student" } })
  const totalInscriptions = await prisma.inscription.count()
  console.log(`Total users (role=student): ${totalUsers}`)
  console.log(`Total inscriptions: ${totalInscriptions}`)

  await prisma.$disconnect()
}

main().catch(console.error)
