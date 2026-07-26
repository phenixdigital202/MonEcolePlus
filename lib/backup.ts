import fs from "fs"
import path from "path"
import crypto from "crypto"
import zlib from "zlib"
import { getPrisma } from "@/lib/tenant-context"
import { sendEmail } from "@/lib/mail"

const BACKUP_DIR = path.join(process.cwd(), "backups")
const ENCRYPTION_ALGORITHM = "aes-256-cbc"
const BACKUP_KEY = process.env.BACKUP_ENCRYPTION_KEY || "MonEcolePlusBackupSecretKey2026!!" // 32 characters

// Ensure backup folder exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true })
}

/**
 * Encrypt a buffer with AES-256-CBC
 */
function encrypt(buffer: Buffer): Buffer {
  const iv = crypto.randomBytes(16)
  // Ensure key is exactly 32 bytes
  const key = crypto.createHash("sha256").update(BACKUP_KEY).digest()
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()])
  // Prepend IV for decryption
  return Buffer.concat([iv, encrypted])
}

/**
 * Decrypt a buffer with AES-256-CBC
 */
function decrypt(buffer: Buffer): Buffer {
  const iv = buffer.subarray(0, 16)
  const encryptedData = buffer.subarray(16)
  const key = crypto.createHash("sha256").update(BACKUP_KEY).digest()
  const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv)
  return Buffer.concat([decipher.update(encryptedData), decipher.final()])
}

/**
 * Triggers a backup of database tables, compresses and encrypts it
 */
export async function createDatabaseBackup(): Promise<{ success: boolean; filename?: string; size?: string; error?: string }> {
  const prisma = await getPrisma()
  try {
    // 1. Collect database data for main entities
    const users = await prisma.user.findMany()
    const emails = await prisma.notificationEmail.findMany()
    const whatsapps = await prisma.notificationWhatsapp.findMany()
    const backupLogs = await prisma.backupLog.findMany()

    const backupPayload = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      data: {
        users,
        emails,
        whatsapps,
        backupLogs
      }
    }

    // 2. Compress payload
    const jsonString = JSON.stringify(backupPayload)
    const compressed = zlib.gzipSync(Buffer.from(jsonString))

    // 3. Encrypt payload
    const encrypted = encrypt(compressed)

    // 4. Save to backups directory
    const filename = `db_backup_${Date.now()}.enc`
    const filePath = path.join(BACKUP_DIR, filename)
    fs.writeFileSync(filePath, encrypted)

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

    // Perform rotation (keep only last 7 days)
    await rotateBackups()

    return { success: true, filename, size: sizeStr }
  } catch (error: any) {
    console.error("[Backup Error] Failed to create backup:", error)
    
    // Log failure
    try {
      await prisma.backupLog.create({
        data: {
          filename: "failed_backup.enc",
          backupType: "database",
          size: "0 KB",
          status: "failed",
          errorMessage: error.message || String(error)
        }
      })
    } catch (e) {
      console.error("Could not write backup failure log to db:", e)
    }

    // Send Alert Email to Admin
    try {
      const adminEmail = process.env.ADMIN_EMAIL || "admin@monecoleplus.com"
      await sendEmail({
        to: adminEmail,
        subject: "🚨 [Alerte MonÉcole+] Échec de la Sauvegarde Automatique",
        templateName: "admin_message",
        bodyHtml: `
          <h2>Alerte de Sécurité & Maintenance</h2>
          <p>Le système de sauvegarde automatique a rencontré une erreur critique lors de l'exécution.</p>
          <div style="background-color: #fff5f5; padding: 16px; border-radius: 12px; border: 1px solid #fed7d7; margin: 16px 0; color: #c53030;">
            <strong>Détails de l'erreur :</strong><br/>
            ${error.message || String(error)}
          </div>
          <p>Veuillez inspecter les serveurs et le stockage de données immédiatement.</p>
        `
      })
    } catch (mailErr) {
      console.error("Could not send failure email:", mailErr)
    }

    return { success: false, error: error.message || String(error) }
  }
}

/**
 * Restore database state from a backup file
 */
export async function restoreDatabaseBackup(filename: string): Promise<{ success: boolean; error?: string }> {
  const prisma = await getPrisma()
  try {
    const filePath = path.join(BACKUP_DIR, filename)
    if (!fs.existsSync(filePath)) {
      return { success: false, error: "Fichier de sauvegarde introuvable" }
    }

    // 1. Read & Decrypt
    const encryptedData = fs.readFileSync(filePath)
    const decryptedCompressed = decrypt(encryptedData)

    // 2. Decompress
    const jsonBuffer = zlib.gunzipSync(decryptedCompressed)
    const backupPayload = JSON.parse(jsonBuffer.toString())

    const { users, emails, whatsapps } = backupPayload.data

    // 3. Clear and restore using prisma transactions
    await prisma.$transaction(async (tx) => {
      // Clear tables
      await tx.user.deleteMany()
      await tx.notificationEmail.deleteMany()
      await tx.notificationWhatsapp.deleteMany()

      // Restore Users
      for (const u of users) {
        await tx.user.create({ data: u })
      }
      // Restore Emails
      for (const e of emails) {
        await tx.notificationEmail.create({ data: e })
      }
      // Restore WhatsApps
      for (const w of whatsapps) {
        await tx.notificationWhatsapp.create({ data: w })
      }
    })

    return { success: true }
  } catch (error: any) {
    console.error("[Restore Error] Failed to restore backup:", error)
    return { success: false, error: error.message || String(error) }
  }
}

/**
 * Backup Rotation: Removes backup files older than 7 days
 */
export async function rotateBackups() {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
    const now = Date.now()
    const cutoff = 7 * 24 * 60 * 60 * 1000 // 7 days in ms

    for (const file of files) {
      if (file.endsWith(".enc")) {
        const filePath = path.join(BACKUP_DIR, file)
        const stats = fs.statSync(filePath)
        if (now - stats.mtimeMs > cutoff) {
          fs.unlinkSync(filePath)
          console.log(`[Backup Rotation] Deleted old backup file: ${file}`)
        }
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
      .filter(f => f.endsWith(".enc"))
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
