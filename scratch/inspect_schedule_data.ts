import { PrismaClient } from "@prisma/client"

async function inspectScheduleData() {
  const masterPrisma = new PrismaClient()
  const masterSchools = await masterPrisma.ecole.findMany()

  console.log("=== INSPECTION EMPLOIS DU TEMPS EN BASE DE DONNÉES ===")

  for (const ms of masterSchools) {
    if (!ms.database_url) continue

    let tenantUrl = ms.database_url
    if (process.env.SUPABASE_DIRECT_URL && tenantUrl.includes("pooler.supabase.com")) {
      const dbName = tenantUrl.split("/").pop()?.split("?")[0]
      tenantUrl = `${process.env.SUPABASE_DIRECT_URL}/${dbName}`
    }

    try {
      const tenantPrisma = new PrismaClient({
        datasources: { db: { url: tenantUrl } }
      })

      const classes = await tenantPrisma.class.findMany({ select: { id: true, nom: true } })
      const courses = await tenantPrisma.emploiDuTemps.findMany({
        include: {
          classe: { select: { id: true, nom: true } },
          user: { select: { id: true, nom: true, role: true } }
        }
      })

      console.log(`\n--------------------------------------------------`)
      console.log(`École: ${ms.nom} (ID: ${ms.id}, Subdomain: ${ms.subdomain})`)
      console.log(`Classes (${classes.length}):`, classes.map(c => `[ID ${c.id}: ${c.nom}]`).join(", "))
      console.log(`Nombre total de cours dans emplois_du_temps: ${courses.length}`)

      if (courses.length > 0) {
        for (const c of courses) {
          console.log(`  - Cours ID ${c.id} | Classe ID ${c.id_classe} ("${c.classe?.nom}") | Enseignant ID ${c.id_enseignant} ("${c.user?.nom}") | Matière: "${c.matiere}" | Jour: ${c.jour} | Début: ${c.heure_debut.toISOString()} | Fin: ${c.heure_fin.toISOString()}`)
        }
      }
      await tenantPrisma.$disconnect()
    } catch (e: any) {
      console.log(`Error inspecting ${ms.nom}: ${e.message}`)
    }
  }

  await masterPrisma.$disconnect()
  process.exit(0)
}

inspectScheduleData()
