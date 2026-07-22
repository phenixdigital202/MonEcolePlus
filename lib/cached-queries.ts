import { cache } from 'react'
import { getPrisma } from './tenant-context'

export const getCachedUser = cache(async (userId: number) => {
  const prisma = await getPrisma()
  return prisma.user.findUnique({
    where: { id: userId },
  })
})

export const getCachedSchoolStats = cache(async (schoolId: number) => {
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
    revenueData
  }
})
