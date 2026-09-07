import masterPrisma from "../lib/prisma"
import { getTenantClient } from "../lib/prisma-tenant"

async function runTenantDiagnostic() {
  console.log("\n============================================================")
  console.log("DIAGNOSTIC EXHAUSTIF DES TENANTS & BASES DE DONNÉES LOCATAIRES")
  console.log("============================================================\n")

  // 1. Fetch all schools from Master DB
  const ecoles = await masterPrisma.ecole.findMany()
  console.log(`Master DB contains ${ecoles.length} schools:`)
  ecoles.forEach(e => console.log(` - School ID: ${e.id}, Nom: "${e.nom}", Subdomain: "${e.subdomain}", DB URL: ${e.database_url ? 'PRESENT' : 'NULL'}`))

  for (const ecole of ecoles) {
    if (!ecole.database_url) continue
    console.log(`\n------------------------------------------------------------`)
    console.log(`TESTING TENANT DB FOR: ID ${ecole.id} - ${ecole.nom}`)
    console.log(`------------------------------------------------------------`)

    try {
      const tenantPrisma = getTenantClient(ecole.database_url)

      // Test 1: Classes
      try {
        const classes = await tenantPrisma.class.findMany({
          include: {
            _count: { select: { inscriptions: true, emploisDuTemps: true } }
          }
        })
        console.log(`  [Classes]: ✔ ${classes.length} classes. Sample:`, classes.slice(0, 2).map(c => ({ id: c.id, nom: c.nom, level: c.niveau, capacite: (c as any).capacite })))
      } catch (err: any) {
        console.error(`  [Classes]: ❌ ERROR:`, err.message)
      }

      // Test 2: Students & Inscriptions
      try {
        const students = await tenantPrisma.user.findMany({
          where: { role: 'student' },
          include: {
            inscriptions: {
              include: { classe: true }
            }
          }
        })
        console.log(`  [Students]: ✔ ${students.length} students. Sample:`, students.slice(0, 3).map(s => ({
          id: s.id,
          nom: s.nom,
          email: s.email,
          inscriptionsCount: s.inscriptions.length,
          inscriptions: s.inscriptions.map(i => ({ id: i.id, classId: i.id_classe, className: i.classe?.nom, annee: i.annee_scolaire, statut: (i as any).statut }))
        })))
      } catch (err: any) {
        console.error(`  [Students]: ❌ ERROR:`, err.message)
      }

      // Test 3: Parents
      try {
        const parents = await tenantPrisma.user.findMany({
          where: { role: 'parent' },
          include: {
            parentEleveAsParent: {
              include: { eleve: true }
            }
          }
        })
        console.log(`  [Parents]: ✔ ${parents.length} parents. Sample:`, parents.slice(0, 2).map(p => ({ id: p.id, nom: p.nom, email: p.email, kidsCount: p.parentEleveAsParent.length })))
      } catch (err: any) {
        console.error(`  [Parents]: ❌ ERROR:`, err.message)
      }

      // Test 4: Inscriptions directly
      try {
        const inscriptions = await tenantPrisma.inscription.findMany({
          include: { user: true, classe: true }
        })
        console.log(`  [Inscriptions]: ✔ ${inscriptions.length} total inscriptions. Sample:`, inscriptions.slice(0, 3).map(i => ({
          id: i.id,
          eleveName: i.user?.nom,
          className: i.classe?.nom,
          annee: i.annee_scolaire,
          statut: (i as any).statut
        })))
      } catch (err: any) {
        console.error(`  [Inscriptions]: ❌ ERROR:`, err.message)
      }

      // Test 5: Timetables
      try {
        const schedule = await tenantPrisma.emploiDuTemps.findMany({
          include: { classe: true, user: true }
        })
        console.log(`  [Timetables]: ✔ ${schedule.length} schedule entries.`)
      } catch (err: any) {
        console.error(`  [Timetables]: ❌ ERROR:`, err.message)
      }

      // Test 6: Evaluations & Notes
      try {
        const evals = await tenantPrisma.evaluation.findMany({
          include: { notes: true, classe: true }
        })
        const totalNotes = evals.reduce((a, b) => a + b.notes.length, 0)
        console.log(`  [Evaluations]: ✔ ${evals.length} evaluations, ${totalNotes} total notes.`)
      } catch (err: any) {
        console.error(`  [Evaluations]: ❌ ERROR:`, err.message)
      }

      // Test 7: Absences
      try {
        const absences = await tenantPrisma.absence.findMany({
          include: { user: true }
        })
        console.log(`  [Absences]: ✔ ${absences.length} absences.`)
      } catch (err: any) {
        console.error(`  [Absences]: ❌ ERROR:`, err.message)
      }

    } catch (dbErr: any) {
      console.error(`  ❌ DB CONNECTION FAILED FOR SCHOOL ${ecole.id}:`, dbErr.message)
    }
  }
}

runTenantDiagnostic().catch(console.error)
