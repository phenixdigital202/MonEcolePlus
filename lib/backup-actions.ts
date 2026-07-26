"use server"

import { getPrisma } from "@/lib/tenant-context"
import { revalidatePath } from "next/cache"
import * as backup from "./backup"

/**
 * Get backups history log from DB
 */
export async function getBackupHistory() {
  try {
    const prisma = await getPrisma()
    const logs = await prisma.backupLog.findMany({
      orderBy: { createdAt: "desc" }
    })
    return { success: true, data: JSON.parse(JSON.stringify(logs)) }
  } catch (error: any) {
    console.error("Error fetching backup logs:", error)
    return { success: false, error: error.message || "Failed to load logs" }
  }
}

/**
 * Get list of backup files on disk
 */
export async function getBackupFiles() {
  try {
    const list = backup.getBackupFilesList()
    return { success: true, data: JSON.parse(JSON.stringify(list)) }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to load files" }
  }
}

/**
 * Trigger manual database backup
 */
export async function triggerManualBackup() {
  try {
    const res = await backup.createDatabaseBackup()
    revalidatePath("/dashboard/admin/backups")
    return res
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Restore database from a backup file
 */
export async function triggerRestore(filename: string) {
  try {
    const res = await backup.restoreDatabaseBackup(filename)
    revalidatePath("/dashboard/admin/backups")
    return res
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
