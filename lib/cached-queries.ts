import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { getPrisma } from './tenant-context'

export const getCachedUser = cache(async (userId: number) => {
  try {
    const prisma = await getPrisma()
    return await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        id_ecole: true,
        nom: true,
        email: true,
        role: true,
        matiere: true,
        niveau: true,
        created_at: true
      }
    })
  } catch (error) {
    console.error(`[getCachedUser] Error fetching user ${userId}:`, error)
    return null
  }
})

// Wrap with unstable_cache for cross-request high performance server side caching
export const getCachedSchoolStats = cache(async (schoolId: number) => {
  return unstable_cache(
    async () => {
      try {
        const prisma = await getPrisma()
        
        const userFilter = schoolId > 0 
          ? { OR: [{ id_ecole: schoolId }, { id_ecole: null }] } 
          : {}

        const classFilter = schoolId > 0 
          ? { OR: [{ id_ecole: schoolId }, { id_ecole: null }] } 
          : {}

        const [studentCount, teacherCount, classCount, revenueData] = await Promise.all([
          prisma.user.count({ where: { role: 'student', ...userFilter } }),
          prisma.user.count({ where: { role: 'teacher', ...userFilter } }),
          prisma.class.count({ where: classFilter }),
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
        console.error(`[getCachedSchoolStats] Error fetching stats for school ${schoolId}:`, error)
        return {
          studentCount: 0,
          teacherCount: 0,
          classCount: 0,
          revenueData: { _sum: { montant: 0 } }
        }
      }
    },
    [`school-stats-${schoolId}`],
    { revalidate: 60, tags: [`school-stats-${schoolId}`] } // Revalidate stats every 60 seconds
  )()
})

