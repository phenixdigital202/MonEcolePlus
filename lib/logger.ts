import { PrismaClient } from "@prisma/client"

const prismaMaster = new PrismaClient()

/**
 * System Logger to save operational audit logs in the Master Database
 */
export async function logSystem(
  level: "info" | "warn" | "error",
  source: string,
  message: string,
  ipAddress?: string | null,
  userAgent?: string | null
) {
  try {
    const log = await prismaMaster.systemLog.create({
      data: {
        level,
        source,
        message,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null
      }
    })
    console.log(`[LOG][${level.toUpperCase()}][${source}] ${message}`)
    return log
  } catch (error) {
    console.error("Failed to write system log:", error)
  }
}

export async function logError(source: string, message: string) {
  return logSystem("error", source, message)
}
