"use server"

import { getPrisma } from "@/lib/tenant-context"

async function getPrismaClient() {
  return await getPrisma()
}

export async function getGamificationStats(userId: number) {
  try {
    const prisma = await getPrismaClient()
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        eleve_badges: {
          include: { badges: true }
        },
        notes: true,
        absences: true
      }
    })

    if (!user) return { success: false, error: "Utilisateur non trouvé" }

    // 1. Calculate Points dynamically based on academic history
    let academicPoints = 0
    
    // Excellence: 20/20 -> 50 pts, >= 15 -> 20 pts
    user.notes.forEach(note => {
      const val = Number(note.valeur)
      if (val === 20) academicPoints += 50
      else if (val >= 15) academicPoints += 20
      else academicPoints += 5 // Participation
    })

    // Attendance: No absence -> 100 pts bonus
    if (user.absences.length === 0) academicPoints += 100

    // Update user points in DB using raw SQL to bypass Prisma Client lock issues on Windows
    const currentPoints = (user as any).points || 0
    if (currentPoints !== academicPoints) {
      const level = Math.floor(academicPoints / 200) + 1
      await prisma.$executeRawUnsafe(
        `UPDATE users SET points = ?, niveau = ? WHERE id = ?`,
        academicPoints,
        level,
        userId
      )
    }

    // 2. Fetch all possible badges
    const allBadges = await prisma.badge.findMany()
    const earnedBadgeIds = user.eleve_badges.map(eb => eb.id_badge)

    return {
      success: true,
      data: {
        points: academicPoints,
        level: Math.floor(academicPoints / 200) + 1,
        nextLevelXP: 200,
        currentXP: academicPoints % 200,
        earnedBadges: user.eleve_badges.map(eb => ({
            id: eb.badges.id,
            name: eb.badges.nom,
            description: eb.badges.description,
            icon: eb.badges.icon_name,
            date: eb.date_obtention
        })),
        allBadges: allBadges.map(b => ({
            ...b,
            isLocked: !earnedBadgeIds.includes(b.id)
        }))
      }
    }
  } catch (error) {
    console.error("Error in getGamificationStats:", error)
    return { success: false, error: "Erreur serveur" }
  }
}

export async function getLeaderboard(classId: number) {
  try {
    const prisma = await getPrismaClient()
    const students: any[] = await prisma.$queryRawUnsafe(
      `SELECT u.id, u.nom as name, u.points, u.niveau as level 
       FROM users u 
       JOIN inscriptions i ON u.id = i.id_eleve 
       WHERE i.id_classe = ? 
       ORDER BY u.points DESC`,
      classId
    )

    return { success: true, data: students }
  } catch (error) {
    console.error("Error in getLeaderboard:", error)
    return { success: false, error: "Erreur serveur" }
  }
}
