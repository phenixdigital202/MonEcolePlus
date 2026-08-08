import { PrismaClient } from "@prisma/client"

async function main() {
  const dbUrl = "postgresql://postgres.nfrripylvuzxpuipdrpy:MonEcolePlus@aws-0-eu-west-3.pooler.supabase.com:5432/tenant_cocody_1785950690672"
  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } })

  console.log("=== COMPARAISON STATISTIQUES COCODY (BASE DE DONNÉES) ===\n")

  // Fetch real school record
  const school = await prisma.ecole.findFirst()
  console.log(`Données de l'école connectée :`)
  console.log(`- Nom :       ${school?.nom}`)
  console.log(`- Directeur : ${school?.directeur}`)
  console.log(`- Adresse :   ${school?.adresse}`)
  console.log(`- Téléphone : ${school?.telephone}`)
  console.log(`- Email :     ${school?.email}`)
  console.log(`- Site web :  ${school?.website}`)
  console.log(`- Token WA :  ${school?.whatsapp_access_token ? 'Définie (masquée)' : 'Non configurée'}`)
  console.log(`- Phone ID :  ${school?.whatsapp_phone_number_id || 'Non configuré'}`)

  // Fetch real counts
  const studentsCount = await prisma.user.count({ where: { role: "student" } })
  const teachersCount = await prisma.user.count({ where: { role: "teacher" } })
  const parentsCount = await prisma.user.count({ where: { role: "parent" } })
  const classesCount = await prisma.class.count()

  console.log(`\nEffectifs réels du tenant :`)
  console.log(`- Élèves :      ${studentsCount}`)
  console.log(`- Enseignants : ${teachersCount}`)
  console.log(`- Parents :     ${parentsCount}`)
  console.log(`- Classes :     ${classesCount}`)

  console.log("\n✅ Test de conformité : Toutes les requêtes sont opérationnelles.")

  await prisma.$disconnect()
}

main().catch(console.error)
