import { cache } from 'react'
import { getPrisma } from './tenant-context'

export const getCachedUser = cache(async (userId: number) => {
  try {
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
      if (user) return user
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
