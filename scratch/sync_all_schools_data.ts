import { PrismaClient } from "@prisma/client"

interface SyncDiff {
  schoolId: number
  subdomain: string
  field: string
  masterVal: string | null
  tenantVal: string | null
  resolvedVal: string | null
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms))

async function runSyncAllSchools(applyFix: boolean = false) {
  const masterPrisma = new PrismaClient()
  const masterSchools = await masterPrisma.ecole.findMany({
    orderBy: { id: "asc" }
  })

  console.log(`==================================================`)
  console.log(`SYNCHRONISATION DES ÉTABLISSEMENTS — ${applyFix ? 'MODE EXECUTION (CORRECTION)' : 'MODE DRY-RUN'}`)
  console.log(`==================================================\n`)
  console.log(`Établissements trouvés dans Master DB: ${masterSchools.length}\n`)

  let totalSchoolsAnalyzed = 0
  let totalConform = 0
  let totalDivergent = 0
  let totalCorrected = 0
  let totalFailures = 0

  const syncFields = [
    "nom",
    "directeur",
    "adresse",
    "telephone",
    "email",
    "website",
    "logo_url",
    "cachet_url"
  ] as const

  const sqlAddColumns = [
    `ALTER TABLE "ecoles" ADD COLUMN IF NOT EXISTS "cachet_url" TEXT;`,
    `ALTER TABLE "ecoles" ADD COLUMN IF NOT EXISTS "subdomain" TEXT;`,
    `ALTER TABLE "ecoles" ADD COLUMN IF NOT EXISTS "smtp_host" TEXT;`,
    `ALTER TABLE "ecoles" ADD COLUMN IF NOT EXISTS "smtp_port" INTEGER;`,
    `ALTER TABLE "ecoles" ADD COLUMN IF NOT EXISTS "smtp_user" TEXT;`,
    `ALTER TABLE "ecoles" ADD COLUMN IF NOT EXISTS "smtp_pass" TEXT;`,
    `ALTER TABLE "ecoles" ADD COLUMN IF NOT EXISTS "whatsapp_access_token" TEXT;`,
    `ALTER TABLE "ecoles" ADD COLUMN IF NOT EXISTS "whatsapp_phone_number_id" TEXT;`
  ]

  for (const ms of masterSchools) {
    totalSchoolsAnalyzed++
    console.log(`--------------------------------------------------`)
    console.log(`[Master ID ${ms.id}] "${ms.nom}" (${ms.subdomain})`)

    if (!ms.database_url) {
      console.log(`  ⚠️ Ignoré: Pas de database_url`)
      totalFailures++
      continue
    }

    let tenantUrl = ms.database_url
    if (process.env.SUPABASE_DIRECT_URL && tenantUrl.includes("pooler.supabase.com")) {
      const dbName = tenantUrl.split("/").pop()?.split("?")[0]
      tenantUrl = `${process.env.SUPABASE_DIRECT_URL}/${dbName}`
    }

    let tenantPrisma: PrismaClient | null = null
    let success = false
    let attempts = 0

    while (attempts < 2 && !success) {
      attempts++
      try {
        tenantPrisma = new PrismaClient({
          datasources: { db: { url: tenantUrl } }
        })

        // Fix schema drift for all potential missing ecole columns individually
        for (const sql of sqlAddColumns) {
          try {
            await tenantPrisma.$executeRawUnsafe(sql)
          } catch (e: any) {}
        }

        let tenantSchool = await tenantPrisma.ecole.findFirst()

        if (!tenantSchool) {
          console.log(`  ⚠️ Tenant DB ne contient aucune entrée ecole! Creation d'une entrée...`)
          if (applyFix) {
            tenantSchool = await tenantPrisma.ecole.create({
              data: {
                id: ms.id,
                nom: ms.nom,
                subdomain: ms.subdomain,
                logo_url: ms.logo_url,
                cachet_url: ms.cachet_url,
                directeur: ms.directeur,
                adresse: ms.adresse,
                telephone: ms.telephone,
                email: ms.email,
                website: ms.website
              }
            })
            try {
              await tenantPrisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('ecoles', 'id'), (SELECT MAX(id) FROM ecoles));`)
            } catch (e: any) {}
          }
        }

        const schoolDiffs: SyncDiff[] = []
        const updateMaster: Record<string, any> = {}
        const updateTenant: Record<string, any> = {}

        for (const field of syncFields) {
          const mVal = (ms as any)[field] ?? null
          const tVal = tenantSchool ? ((tenantSchool as any)[field] ?? null) : null

          if (mVal !== tVal) {
            let resolved = mVal
            if (mVal === null && tVal !== null) {
              resolved = tVal
            }

            schoolDiffs.push({
              schoolId: ms.id,
              subdomain: ms.subdomain || '',
              field,
              masterVal: mVal,
              tenantVal: tVal,
              resolvedVal: resolved
            })

            if (mVal !== resolved) {
              updateMaster[field] = resolved
            }
            if (tVal !== resolved) {
              updateTenant[field] = resolved
            }
          }
        }

        if (schoolDiffs.length === 0) {
          console.log(`  ✅ 100% Conforme (Master DB == Tenant DB)`)
          totalConform++
        } else {
          totalDivergent++
          console.log(`  ❌ ${schoolDiffs.length} divergence(s) détectée(s):`)
          for (const d of schoolDiffs) {
            console.log(`     - [${d.field}] Master: "${d.masterVal ? d.masterVal.slice(0, 30) : 'null'}" | Tenant: "${d.tenantVal ? d.tenantVal.slice(0, 30) : 'null'}" => Solution: "${d.resolvedVal ? d.resolvedVal.slice(0, 30) : 'null'}"`)
          }

          if (applyFix && tenantSchool) {
            if (Object.keys(updateTenant).length > 0) {
              await tenantPrisma.ecole.update({
                where: { id: tenantSchool.id },
                data: updateTenant
              })
            }
            if (Object.keys(updateMaster).length > 0) {
              await masterPrisma.ecole.update({
                where: { id: ms.id },
                data: updateMaster
              })
            }
            console.log(`  🎉 CORRIGÉ AVEC SUCCÈS`)
            totalCorrected++
          }
        }
        success = true
      } catch (err: any) {
        if (attempts >= 2) {
          console.log(`  ❌ ERREUR TENANT DB: ${err.message}`)
          totalFailures++
        } else {
          await delay(500)
        }
      } finally {
        if (tenantPrisma) {
          await tenantPrisma.$disconnect()
        }
      }
    }
    await delay(200)
  }

  await masterPrisma.$disconnect()

  console.log(`\n==================================================`)
  console.log(`RÉSUMÉ Bilan Synchronisation (${applyFix ? 'APPLIQUÉ' : 'DRY-RUN'})`)
  console.log(`==================================================`)
  console.log(`Tenants analysés:    ${totalSchoolsAnalyzed}`)
  console.log(`Tenants conformes:   ${totalConform}`)
  console.log(`Tenants divergents:  ${totalDivergent}`)
  console.log(`Tenants corrigés:    ${totalCorrected}`)
  console.log(`Tenants en échec:    ${totalFailures}`)

  process.exit(0)
}

const isFix = process.argv.includes("--apply")
runSyncAllSchools(isFix)
