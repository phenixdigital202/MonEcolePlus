import { PrismaClient } from "@prisma/client"
import { execSync } from "child_process"

const masterPrisma = new PrismaClient()

export interface MigrationLog {
  id: number
  tenant_id: number
  version: string
  migration: string
  status: "success" | "failed"
  duration: number
  error?: string
  date: Date
}

export async function ensureDatabaseColumnsExist(client: any) {
  const sqls = [
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "matricule" TEXT;`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "date_naissance" TIMESTAMP(3);`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lieu_naissance" TEXT;`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "nationalite" TEXT DEFAULT 'Ivoirienne';`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "sexe" TEXT;`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "etablissement_origine" TEXT;`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "statut_affectation" TEXT DEFAULT 'Non Affecté';`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "statut_redoublement" TEXT DEFAULT 'Non Redoublant';`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "cantine" BOOLEAN DEFAULT false;`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "transport" BOOLEAN DEFAULT false;`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lv2" TEXT;`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "tuteur_type" TEXT DEFAULT 'Père';`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "tuteur_nom" TEXT;`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "tuteur_profession" TEXT;`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "tuteur_tel_domicile" TEXT;`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "tuteur_tel_bureau" TEXT;`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "tuteur_tel_mobile" TEXT;`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "tuteur_adresse" TEXT;`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "tuteur_email" TEXT;`,
    `ALTER TABLE "inscriptions" ADD COLUMN IF NOT EXISTS "type_inscription" TEXT DEFAULT 'Inscription';`,
    `ALTER TABLE "inscriptions" ADD COLUMN IF NOT EXISTS "montant_scolarite" DECIMAL(65,3);`
  ]

  for (const sql of sqls) {
    try {
      await client.$executeRawUnsafe(sql)
    } catch (e) {}
  }
}

/**
 * MigrationManager automates checking, pushing, and logging schema versions
 * across all school tenant databases.
 */
export class MigrationManager {
  static CURRENT_VERSION = "1.0.4" // Incremented schema version tracker

  /**
   * Helper to execute Prisma db push on a specific database URL overriding both DATABASE_URL and DIRECT_URL
   */
  private static async executeDbPush(databaseUrl: string) {
    // 1. Extract database name from connection URL
    const dbName = databaseUrl.split("/").pop()?.split("?")[0]
    
    if (dbName && dbName !== "postgres") {
      console.log(`[MigrationManager] Ensuring database "${dbName}" exists on PostgreSQL cluster...`)
      
      // Connect to the master default 'postgres' database to run CREATE DATABASE
      const defaultDbUrl = process.env.DIRECT_URL || "postgresql://postgres.nfrripylvuzxpuipdrpy:MonEcolePlus@aws-0-eu-west-3.pooler.supabase.com:5432/postgres"
      const defaultPrisma = new PrismaClient({
        datasources: { db: { url: defaultDbUrl } }
      })

      try {
        await defaultPrisma.$executeRawUnsafe(`CREATE DATABASE "${dbName}"`)
        console.log(`[MigrationManager] Database "${dbName}" created successfully.`)
      } catch (err: any) {
        // Safe to ignore if database already exists (code 42P04 in postgres)
        if (err.message.includes("already exists") || err.message.includes("42P04")) {
          console.log(`[MigrationManager] Database "${dbName}" already exists.`)
        } else {
          console.warn(`[MigrationManager] Database creation warning: ${err.message}`)
        }
      } finally {
        await defaultPrisma.$disconnect()
      }
    }

    // 2. Transform pooler connection URL (6543) into direct connection URL (5432) for DDL migrations support
    const directUrl = databaseUrl
      .replace(":6543/", ":5432/")
      .replace("?pgbouncer=true", "")

    console.log(`[MigrationManager] Running prisma db push on: ${directUrl.split("@")[1] || "hidden"}`)

    try {
      execSync("node node_modules/prisma/build/index.js db push --accept-data-loss --skip-generate", {
        env: {
          ...process.env,
          DATABASE_URL: directUrl,
          PRISMA_SKIP_ENV_VAR_LOAD: "1" // Bypass loading of .env files
        },
        stdio: "pipe"
      })
    } catch (err: any) {
      const stderr = err.stderr?.toString() || ""
      const stdout = err.stdout?.toString() || ""
      throw new Error(`Prisma Push Failed:\nSTDOUT: ${stdout}\nSTDERR: ${stderr}\nMessage: ${err.message}`)
    }
  }

  /**
   * Run schema migrations on all active school tenants
   */
  static async migrateAllTenants() {
    const ecoles = await masterPrisma.ecole.findMany()
    const report = {
      total: ecoles.length,
      successCount: 0,
      failedCount: 0,
      details: [] as any[]
    }

    for (const ecole of ecoles) {
      if (!ecole.database_url) continue

      const startTime = Date.now()
      console.log(`[MigrationManager] Starting migration for school: ${ecole.nom} (ID: ${ecole.id})`)

      try {
        // Execute db push with the direct connection URL
        await this.executeDbPush(ecole.database_url)

        const duration = Date.now() - startTime

        // Connect to tenant DB to log success
        const tenantPrisma = new PrismaClient({
          datasources: { db: { url: ecole.database_url } }
        })

        await tenantPrisma.schemaVersion.create({
          data: {
            tenant_id: ecole.id,
            version: this.CURRENT_VERSION,
            migration: `db_push_v${this.CURRENT_VERSION}`,
            status: "success",
            duration,
            error: null
          }
        })
        await tenantPrisma.$disconnect()

        report.successCount++
        report.details.push({ school: ecole.nom, status: "success", duration })
        console.log(`[MigrationManager] Successfully migrated school: ${ecole.nom}`)

      } catch (err: any) {
        const duration = Date.now() - startTime
        report.failedCount++
        report.details.push({ school: ecole.nom, status: "failed", error: err.message, duration })
        console.error(`[MigrationManager] Migration failed for school: ${ecole.nom}. Error: ${err.message}`)
      }
    }

    return report
  }

  /**
   * Check if a specific tenant database is in sync with CURRENT_VERSION
   */
  static async checkAndAutoMigrate(ecoleId: number, databaseUrl: string) {
    try {
      // Connect to tenant DB to query version
      const tenantPrisma = new PrismaClient({
        datasources: { db: { url: databaseUrl } }
      })

      // Get latest schema version logged on tenant (safely wrap in case table doesn't exist yet)
      let latest = null
      try {
        latest = await tenantPrisma.schemaVersion.findFirst({
          orderBy: { date: "desc" }
        })
      } catch (e) {}
      await tenantPrisma.$disconnect()

      if (!latest || latest.version !== this.CURRENT_VERSION) {
        console.log(`[MigrationManager] Tenant ${ecoleId} is outdated (version: ${latest?.version || "none"}). Auto-migrating...`)
        
        const startTime = Date.now()
        await this.executeDbPush(databaseUrl)
        const duration = Date.now() - startTime

        // Log success
        const tPrisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } })
        await tPrisma.schemaVersion.create({
          data: {
            tenant_id: ecoleId,
            version: this.CURRENT_VERSION,
            migration: `auto_sync_v${this.CURRENT_VERSION}`,
            status: "success",
            duration
          }
        })
        await tPrisma.$disconnect()
      }
    } catch (err: any) {
      console.error(`[MigrationManager] Auto-migration check failed for tenant ${ecoleId}:`, err.message)
    }
  }
}
