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
        eleveBadges: {
          include: { badge: true }
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

    const currentPoints = user.points || 0
    const calculatedLevel = Math.floor(academicPoints / 200) + 1

    if (currentPoints !== academicPoints) {
      try {
        await prisma.user.update({
          where: { id: userId },
          data: {
            points: academicPoints,
            niveau: calculatedLevel
          }
        })
      } catch (e) {
        console.warn("[getGamificationStats] Non-fatal point update error:", e)
      }
    }

    // 2. Fetch all possible badges
    const allBadges = await prisma.badge.findMany()
    const earnedBadgeIds = user.eleveBadges.map(eb => eb.id_badge)

    return {
      success: true,
      data: {
        points: academicPoints,
        level: calculatedLevel,
        nextLevelXP: 200,
        currentXP: academicPoints % 200,
        earnedBadges: user.eleveBadges.map(eb => ({
          id: eb.badge.id,
          name: eb.badge.nom,
          description: eb.badge.description,
          icon: eb.badge.icon_name || "Award",
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
    return { success: false, error: "Erreur lors du chargement de la gamification" }
  }
}

export async function getLeaderboard(classId: number) {
  try {
    const prisma = await getPrismaClient()
    const inscriptions = await prisma.inscription.findMany({
      where: { id_classe: classId },
      include: {
        user: {
          select: {
            id: true,
            nom: true,
            points: true,
            niveau: true
          }
        }
      }
    })

    const leaderboardData = inscriptions
      .map(i => ({
        id: i.user.id,
        name: i.user.nom,
        points: i.user.points || 0,
        level: i.user.niveau || 1
      }))
      .sort((a, b) => b.points - a.points)

    return { success: true, data: leaderboardData }
  } catch (error) {
    console.error("Error in getLeaderboard:", error)
    return { success: true, data: [] }
  }
}
