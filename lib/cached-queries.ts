import { cache } from 'react'
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

export const getCachedSchoolStats = cache(async (schoolId: number) => {
  try {
    const prisma = await getPrisma()
    
    const [studentCount, teacherCount, classCount, revenueData] = await Promise.all([
      prisma.user.count({ where: { role: 'student', id_ecole: schoolId } }),
      prisma.user.count({ where: { role: 'teacher', id_ecole: schoolId } }),
      prisma.class.count({ where: { id_ecole: schoolId } }),
      prisma.paiement.aggregate({
        _sum: { montant: true },
        where: { status: 'paye', user: { id_ecole: schoolId } }
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
})
