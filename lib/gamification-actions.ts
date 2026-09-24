"use server"

import { getPrisma } from "@/lib/tenant-context"

async function getPrismaClient() {
  return await getPrisma()
}

export async function getGamificationStats(userId: number) {
  try {
    const prisma = await getPrismaClient()

    // 0. Ensure standard badges exist
    let allBadges = await prisma.badge.findMany()
    if (allBadges.length === 0) {
      try {
        await prisma.badge.createMany({
          data: [
            { nom: "Calculateur Pro", description: "Obtenir une excellente note en Mathématiques", icon_name: "Calculator", points_requis: 20 },
            { nom: "Assiduité Parfaite", description: "Zéro absence au cours du trimestre", icon_name: "UserCheck", points_requis: 100 },
            { nom: "Brillant Élève", description: "Obtenir une note parfaite de 20/20", icon_name: "Star", points_requis: 50 },
            { nom: "Major de Classe", description: "Atteindre le sommet du classement de la classe", icon_name: "Trophy", points_requis: 150 },
            { nom: "Pionnier MonÉcole+", description: "Compte actif et assidu sur la plateforme", icon_name: "Rocket", points_requis: 10 },
            { nom: "Maître du Savoir", description: "Débloquer le niveau 5 et l'excellence académique", icon_name: "Crown", points_requis: 500 }
          ],
          skipDuplicates: true
        })
        allBadges = await prisma.badge.findMany()
      } catch (e) {
        console.warn("[getGamificationStats] Badge seed warning:", e)
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        eleveBadges: {
          include: { badge: true }
        },
        notes: {
          include: { evaluation: true }
        },
        absences: true,
        inscriptions: {
          include: { classe: true }
        }
      }
    })

    if (!user) return { success: false, error: "Utilisateur non trouvé" }

    // Calculate academic points
    let academicPoints = 0
    let hasPerfectScore = false
    let hasHighMathScore = false

    user.notes.forEach(note => {
      const val = Number(note.valeur)
      if (val === 20) {
        academicPoints += 50
        hasPerfectScore = true
      } else if (val >= 15) {
        academicPoints += 20
      } else {
        academicPoints += 5
      }

      if ((note.evaluation?.matiere || "").toLowerCase().includes("math") && val >= 14) {
        hasHighMathScore = true
      }
    })

    // Attendance points
    if (user.absences.length === 0) {
      academicPoints += 100
    }

    if (user.notes.length > 0) {
      academicPoints += 20
    }

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
        console.warn("[getGamificationStats] Point update error:", e)
      }
    }

    // Auto grant badges if earned
    const earnedBadgeIds = user.eleveBadges.map(eb => eb.id_badge)
    const newBadgeIdsToGrant: number[] = []

    allBadges.forEach(b => {
      if (!earnedBadgeIds.includes(b.id)) {
        if (b.nom === "Pionnier MonÉcole+" && academicPoints >= 0) newBadgeIdsToGrant.push(b.id)
        if (b.nom === "Assiduité Parfaite" && user.absences.length === 0) newBadgeIdsToGrant.push(b.id)
        if (b.nom === "Brillant Élève" && hasPerfectScore) newBadgeIdsToGrant.push(b.id)
        if (b.nom === "Calculateur Pro" && hasHighMathScore) newBadgeIdsToGrant.push(b.id)
        if (b.nom === "Maître du Savoir" && calculatedLevel >= 5) newBadgeIdsToGrant.push(b.id)
      }
    })

    if (newBadgeIdsToGrant.length > 0) {
      try {
        await prisma.eleveBadge.createMany({
          data: newBadgeIdsToGrant.map(bId => ({
            id_eleve: userId,
            id_badge: bId
          })),
          skipDuplicates: true
        })
      } catch (e) {
        console.warn("[getGamificationStats] Auto badge creation error:", e)
      }
    }

    // Re-fetch user badges after grant
    const updatedUserBadges = await prisma.eleveBadge.findMany({
      where: { id_eleve: userId },
      include: { badge: true }
    })

    const finalEarnedIds = updatedUserBadges.map(eb => eb.id_badge)

    // Compute subject averages
    const subjectMap: Record<string, { notes: number[]; sum: number }> = {}
    user.notes.forEach(n => {
      const mat = n.evaluation?.matiere || "Général"
      const val = Number(n.valeur)
      if (!subjectMap[mat]) subjectMap[mat] = { notes: [], sum: 0 }
      subjectMap[mat].notes.push(val)
      subjectMap[mat].sum += val
    })

    const subjectAverages = Object.keys(subjectMap).map(mat => {
      const avg = subjectMap[mat].sum / subjectMap[mat].notes.length
      return {
        subject: mat,
        average: Number(avg.toFixed(2)),
        notesCount: subjectMap[mat].notes.length
      }
    })

    const overallAverage = user.notes.length > 0
      ? Number((user.notes.reduce((acc, n) => acc + Number(n.valeur), 0) / user.notes.length).toFixed(2))
      : null

    return {
      success: true,
      data: {
        points: academicPoints,
        level: calculatedLevel,
        nextLevelXP: 200,
        currentXP: academicPoints % 200,
        earnedBadges: updatedUserBadges.map(eb => ({
          id: eb.badge.id,
          name: eb.badge.nom,
          description: eb.badge.description,
          icon: eb.badge.icon_name || "Award",
          date: eb.date_obtention
        })),
        allBadges: allBadges.map(b => ({
          ...b,
          isLocked: !finalEarnedIds.includes(b.id)
        })),
        overallAverage,
        subjectAverages,
        notesCount: user.notes.length,
        absencesCount: user.absences.length,
        className: user.inscriptions?.[0]?.classe?.nom || "Élève Inscrit"
      }
    }
  } catch (error) {
    console.error("Error in getGamificationStats:", error)
    return { success: false, error: "Erreur lors du chargement de la gamification" }
  }
}

export async function getLeaderboard(classId?: number) {
  try {
    const prisma = await getPrismaClient()
    let whereClause: any = {}
    if (classId && classId > 0) {
      whereClause.id_classe = classId
    }

    const inscriptions = await prisma.inscription.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            nom: true,
            points: true,
            niveau: true
          }
        }
      },
      take: 20
    })

    let leaderboardData = inscriptions
      .filter(i => i.user)
      .map(i => ({
        id: i.user.id,
        name: i.user.nom,
        points: i.user.points || 0,
        level: i.user.niveau || 1
      }))

    if (leaderboardData.length === 0) {
      const students = await prisma.user.findMany({
        where: { role: 'student' },
        select: { id: true, nom: true, points: true, niveau: true },
        take: 10
      })
      leaderboardData = students.map(s => ({
        id: s.id,
        name: s.nom,
        points: s.points || 0,
        level: s.niveau || 1
      }))
    }

    leaderboardData.sort((a, b) => b.points - a.points)

    return { success: true, data: leaderboardData }
  } catch (error) {
    console.error("Error in getLeaderboard:", error)
    return { success: true, data: [] }
  }
}
