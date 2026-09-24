import { cache } from 'react'
import { getPrisma } from './tenant-context'

declare global {
  var userCacheByMasterId: Map<number, { user: any; timestamp: number }> | undefined
}

const userMapCache = globalThis.userCacheByMasterId || new Map<number, { user: any; timestamp: number }>()
globalThis.userCacheByMasterId = userMapCache
const USER_CACHE_TTL_MS = 60 * 1000 // 60 seconds

export function invalidateUserCache(userId?: number) {
  if (userId) {
    userMapCache.delete(userId)
  } else {
    userMapCache.clear()
  }
}

export const getCachedUser = cache(async (userId: number) => {
  try {
    if (!userId) return null

    const cached = userMapCache.get(userId)
    if (cached && (Date.now() - cached.timestamp < USER_CACHE_TTL_MS)) {
      return cached.user
    }

    const prisma = await getPrisma()
    const master = require("./prisma").default
    
    const masterUser = await master.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true }
    })

    if (masterUser && masterUser.email) {
      const user = await prisma.user.findUnique({
        where: { email: masterUser.email.toLowerCase().trim() },
        include: { ecole: true }
      })
      if (user) {
        userMapCache.set(userId, { user, timestamp: Date.now() })
        return user
      }
    }

    console.warn(`[getCachedUser] User resolution failed for Master User ID ${userId}`)
    return null
  } catch (error) {
    console.error(`[getCachedUser] Error fetching user ${userId}:`, error)
    return null
  }
})

/**
 * Fetch real school stats in real-time from the current active tenant database
 */
export async function getCachedSchoolStats(schoolId: number) {
  try {
    const prisma = await getPrisma()

    const [studentCount, teacherCount, classCount, revenueData] = await Promise.all([
      prisma.user.count({ where: { role: 'student' } }),
      prisma.user.count({ where: { role: 'teacher' } }),
      prisma.class.count(),
      prisma.paiement.aggregate({
        _sum: { montant: true },
        where: { status: 'paye' }
      })
    ])
    
    return {
      studentCount,
      teacherCount,
      classCount,
      revenueData: {
        _sum: {
          montant: revenueData._sum.montant ? Number(revenueData._sum.montant) : 0
        }
      }
    }
  } catch (error) {
    return {
      studentCount: 0,
      teacherCount: 0,
      classCount: 0,
      revenueData: { _sum: { montant: 0 } }
    }
  }
}
