import fs from "fs"
import path from "path"
import zlib from "zlib"
import { getPrisma } from "@/lib/tenant-context"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)
const BACKUP_DIR = path.join(process.cwd(), "backups")

// Ensure backup folder exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true })
}

/**
 * Triggers a backup of database tables, compresses it as .sql.gz
 */
export async function createDatabaseBackup(): Promise<{ success: boolean; filename?: string; size?: string; error?: string }> {
  const prisma = await getPrisma()
  const { getCurrentTenant } = require("./tenant-context")
  
  let dbUrl = process.env.DATABASE_URL
  try {
    const tenant = await getCurrentTenant()
    if (tenant && tenant.database_url) {
      dbUrl = tenant.database_url
    }
  } catch (e) {
    console.warn("[Backup] Could not resolve current tenant database URL, using process env database URL.")
  }

  if (!dbUrl) {
    return { success: false, error: "No database URL available for backup" }
  }

  try {
    let sqlContent = ""
    let backupMethod = "pg_dump"

    try {
      // 1. Try full pg_dump extract
      const { stdout } = await execAsync(`pg_dump "${dbUrl}" --clean --no-owner --no-privileges`)
      sqlContent = stdout
    } catch (dumpErr) {
      console.warn("[Backup] pg_dump failed or is not available. Falling back to programmatic SQL generation.", dumpErr)
      backupMethod = "programmatic"
      
      // Programmatic insert script generator fallback
      const tables = ["User", "Class", "Inscription", "NotificationEmail", "NotificationWhatsapp", "BackupLog", "SystemLog"]
      let dump = `-- Programmatic SQL Dump (Fallback)\n`
      dump += `SET CONSTRAINTS ALL DEFERRED;\n`
      
      for (const table of tables) {
        try {
          const modelName = table.charAt(0).toLowerCase() + table.slice(1)
          const dbModel = (prisma as any)[modelName]
          if (dbModel) {
            const records = await dbModel.findMany()
            dump += `\n-- Table: ${table}\n`
            dump += `TRUNCATE TABLE "${table}" CASCADE;\n`
            for (const rec of records) {
              const keys = Object.keys(rec)
              const cols = keys.map(k => `"${k}"`).join(", ")
              const vals = keys.map(k => {
                const val = rec[k]
                if (val === null) return "NULL"
                if (val instanceof Date) return `'${val.toISOString()}'`
                if (typeof val === "object") return `'${JSON.stringify(val).replace(/'/g, "''")}'`
                if (typeof val === "string") return `'${val.replace(/'/g, "''")}'`
                return val
              }).join(", ")
              dump += `INSERT INTO "${table}" (${cols}) VALUES (${vals});\n`
            }
          }
        } catch (tableErr) {
          console.warn(`[Backup Fallback] Failed to dump table ${table}:`, tableErr)
        }
      }
      sqlContent = dump
    }

    // 2. Compress the SQL output
    const compressed = zlib.gzipSync(Buffer.from(sqlContent))

    // 3. Write file in .sql.gz format
    const filename = `db_backup_${Date.now()}.sql.gz`
    const filePath = path.join(BACKUP_DIR, filename)
    fs.writeFileSync(filePath, compressed)

    const stats = fs.statSync(filePath)
    const sizeStr = `${(stats.size / 1024).toFixed(2)} KB`

    // Log success in DB
    await prisma.backupLog.create({
      data: {
        filename,
        backupType: "database",
        size: sizeStr,
        status: "success"
      }
    })

    // Perform rotation (keep only last 10 backups)
    await rotateBackups()

    return { success: true, filename, size: sizeStr }
  } catch (error: any) {
    console.error("[Backup Error] Failed to create backup:", error)
    
    // Log failure
    try {
      await prisma.backupLog.create({
        data: {
          filename: "failed_backup.sql.gz",
          backupType: "database",
          size: "0 KB",
          status: "failed",
          errorMessage: error.message || String(error)
        }
      })
    } catch (e) {
      console.error("Could not write backup failure log to db:", e)
    }

    return { success: false, error: error.message || String(error) }
  }
}

/**
 * Restore database state from a backup file
 */
export async function restoreDatabaseBackup(filename: string): Promise<{ success: boolean; error?: string }> {
  const prisma = await getPrisma()
  const { getCurrentTenant } = require("./tenant-context")
  
  let dbUrl = process.env.DATABASE_URL
  try {
    const tenant = await getCurrentTenant()
    if (tenant && tenant.database_url) {
      dbUrl = tenant.database_url
    }
  } catch (e) {
    console.warn("[Restore] Could not resolve current tenant database URL, using process env database URL.")
  }

  if (!dbUrl) {
    return { success: false, error: "No database URL available for restore" }
  }

  try {
    const filePath = path.join(BACKUP_DIR, filename)
    if (!fs.existsSync(filePath)) {
      return { success: false, error: "Fichier de sauvegarde introuvable" }
    }

    // 1. Decompress Gzip
    const compressedData = fs.readFileSync(filePath)
    const decompressed = zlib.gunzipSync(compressedData)
    const sqlContent = decompressed.toString()

    try {
      // 2. Try restoring via psql command
      const tempSqlFile = path.join(process.cwd(), `temp_restore_${Date.now()}.sql`)
      fs.writeFileSync(tempSqlFile, sqlContent)
      try {
        await execAsync(`psql "${dbUrl}" -f "${tempSqlFile}"`)
        fs.unlinkSync(tempSqlFile)
      } catch (psqlErr) {
        fs.unlinkSync(tempSqlFile)
        throw psqlErr
      }
    } catch (execErr) {
      console.warn("[Restore] psql command failed. Executing statements programmatically.", execErr)
      
      // Parse statements separated by semicolons
      const statements = sqlContent
        .split(";\n")
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith("--"))

      await prisma.$transaction(async (tx) => {
        for (const stmt of statements) {
          try {
            await tx.$executeRawUnsafe(stmt)
          } catch (stmtErr: any) {
            console.warn("[Restore Statement Warning] Statement failed:", stmt, stmtErr.message)
          }
        }
      }, { timeout: 45000 })
    }

    return { success: true }
  } catch (error: any) {
    console.error("[Restore Error] Failed to restore backup:", error)
    return { success: false, error: error.message || String(error) }
  }
}

/**
 * Backup Rotation: Keeps only the last 10 backups on disk
 */
export async function rotateBackups() {
  try {
    if (!fs.existsSync(BACKUP_DIR)) return
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.endsWith(".sql.gz") || f.endsWith(".enc"))
      .map(file => {
        const filePath = path.join(BACKUP_DIR, file)
        const stats = fs.statSync(filePath)
        return { file, mtime: stats.mtimeMs }
      })
      .sort((a, b) => b.mtime - a.mtime) // Newest first

    if (files.length > 10) {
      const toDelete = files.slice(10)
      for (const item of toDelete) {
        fs.unlinkSync(path.join(BACKUP_DIR, item.file))
        console.log(`[Backup Rotation] Deleted old backup file: ${item.file}`)
      }
    }
  } catch (error) {
    console.error("[Backup Rotation Error] Failed to rotate backups:", error)
  }
}

/**
 * Get all available backup files on disk
 */
export function getBackupFilesList() {
  try {
    if (!fs.existsSync(BACKUP_DIR)) return []
    const files = fs.readdirSync(BACKUP_DIR)
    return files
      .filter(f => f.endsWith(".sql.gz") || f.endsWith(".enc"))
      .map(file => {
        const filePath = path.join(BACKUP_DIR, file)
        const stats = fs.statSync(filePath)
        return {
          filename: file,
          createdAt: stats.mtime,
          size: `${(stats.size / 1024).toFixed(2)} KB`
        }
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  } catch (error) {
    console.error("Failed to list backup files:", error)
    return []
  }
}
