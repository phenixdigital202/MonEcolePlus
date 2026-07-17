"use server"

import { getPrisma } from "@/lib/tenant-context"

/**
 * Fetches all dashboard data for a teacher:
 * - Classes they teach (distinct from emplois_du_temps)
 * - Total students across those classes
 * - Weekly hours from schedule
 * - Attendance rate for students in their classes
 * - Today's schedule with next upcoming class
 * - Upcoming schedule entries for the agenda
 */
export async function getTeacherDashboardData(teacherId: number) {
  try {
    const prisma = await getPrisma()

    // 1. Get all schedule entries for this teacher (with class info)
    const allScheduleEntries = await prisma.emplois_du_temps.findMany({
      where: { id_enseignant: teacherId },
      include: {
        classes: true,
        users: true
      },
      orderBy: [
        { jour: 'asc' },
        { heure_debut: 'asc' }
      ]
    })

    // 2. Distinct classes taught by this teacher
    const classMap = new Map<number, { id: number; nom: string; niveau: string }>()
    for (const entry of allScheduleEntries) {
      if (!classMap.has(entry.id_classe)) {
        classMap.set(entry.id_classe, {
          id: entry.classes.id,
          nom: entry.classes.nom,
          niveau: entry.classes.niveau
        })
      }
    }
    const teacherClasses = Array.from(classMap.values())
    const classIds = teacherClasses.map(c => c.id)

    // 3. Total students enrolled in those classes
    const totalStudents = classIds.length > 0
      ? await prisma.inscription.count({
          where: { id_classe: { in: classIds } }
        })
      : 0

    // 4. Weekly hours calculation
    let totalWeeklyMinutes = 0
    for (const entry of allScheduleEntries) {
      const debut = entry.heure_debut
      const fin = entry.heure_fin
      const diffMs = fin.getTime() - debut.getTime()
      totalWeeklyMinutes += diffMs / (1000 * 60)
    }
    const weeklyHours = Math.round(totalWeeklyMinutes / 60)

    // 5. Attendance rate for students in teacher's classes
    let attendanceRate = 100
    if (classIds.length > 0) {
      // Get all student IDs in teacher's classes
      const studentInscriptions = await prisma.inscription.findMany({
        where: { id_classe: { in: classIds } },
        select: { id_eleve: true }
      })
      const studentIds = [...new Set(studentInscriptions.map(i => i.id_eleve))]

      if (studentIds.length > 0) {
        // Count absences for these students in the last 30 days
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const absenceCount = await prisma.absence.count({
          where: {
            id_eleve: { in: studentIds },
            date_absence: { gte: thirtyDaysAgo }
          }
        })

        // Calculate attendance: total possible days (students * ~22 school days) minus absences
        const schoolDays = 22
        const totalPossiblePresences = studentIds.length * schoolDays
        if (totalPossiblePresences > 0) {
          attendanceRate = Math.round(((totalPossiblePresences - absenceCount) / totalPossiblePresences) * 100)
          if (attendanceRate < 0) attendanceRate = 0
          if (attendanceRate > 100) attendanceRate = 100
        }
      }
    }

    // 6. Today's schedule
    const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
    const today = new Date()
    const todayDayName = dayNames[today.getDay()]

    const todaySchedule = allScheduleEntries
      .filter(e => e.jour === todayDayName)
      .map(e => ({
        id: e.id,
        matiere: e.matiere,
        className: e.classes.nom,
        classNiveau: e.classes.niveau,
        salle: e.salle || 'Non assignée',
        heure_debut: e.heure_debut.toISOString(),
        heure_fin: e.heure_fin.toISOString(),
      }))

    // 7. Find the next upcoming class for today
    const now = new Date()
    // Build a reference time using the dummy date (1970-01-01) since that's how times are stored
    const nowMinutes = now.getHours() * 60 + now.getMinutes()

    let nextClass = null
    for (const course of todaySchedule) {
      const courseStart = new Date(course.heure_debut)
      const courseMinutes = courseStart.getUTCHours() * 60 + courseStart.getUTCMinutes()
      if (courseMinutes >= nowMinutes - 15) { // Include classes starting within 15 min
        const minutesUntil = courseMinutes - nowMinutes
        nextClass = {
          ...course,
          minutesUntil,
          startTimeFormatted: `${String(courseStart.getUTCHours()).padStart(2, '0')}:${String(courseStart.getUTCMinutes()).padStart(2, '0')}`
        }
        break
      }
    }

    // 8. Upcoming agenda: next courses across all days (max 5)
    const dayOrder = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
    const todayIndex = dayOrder.indexOf(todayDayName)

    const upcomingAgenda: Array<{
      matiere: string
      className: string
      jour: string
      heureFormatted: string
      salle: string
    }> = []

    // First add remaining today's courses, then next days
    for (let offset = 0; offset < dayOrder.length; offset++) {
      const dayIdx = (todayIndex + offset) % dayOrder.length
      const dayName = dayOrder[dayIdx]
      const dayCourses = allScheduleEntries.filter(e => e.jour === dayName)

      for (const course of dayCourses) {
        if (offset === 0) {
          // For today, only future courses
          const courseStart = new Date(course.heure_debut)
          const courseMinutes = courseStart.getUTCHours() * 60 + courseStart.getUTCMinutes()
          if (courseMinutes <= nowMinutes) continue
        }

        const start = new Date(course.heure_debut)
        upcomingAgenda.push({
          matiere: course.matiere,
          className: course.classes.nom,
          jour: offset === 0 ? "Aujourd'hui" : offset === 1 ? "Demain" : dayName,
          heureFormatted: `${String(start.getUTCHours()).padStart(2, '0')}:${String(start.getUTCMinutes()).padStart(2, '0')}`,
          salle: course.salle || 'N/A'
        })

        if (upcomingAgenda.length >= 5) break
      }
      if (upcomingAgenda.length >= 5) break
    }

    // 9. Count unread messages
    const unreadMessages = await prisma.message.count({
      where: {
        id_destinataire: teacherId,
        lu: false
      }
    })

    return {
      success: true,
      data: {
        classCount: teacherClasses.length,
        classes: teacherClasses,
        totalStudents,
        weeklyHours,
        attendanceRate,
        todayCoursesCount: todaySchedule.length,
        todaySchedule,
        nextClass,
        upcomingAgenda,
        unreadMessages,
        teacherSubject: null as string | null // will be filled from user.matiere
      }
    }
  } catch (error) {
    console.error("Error fetching teacher dashboard data:", error)
    return { success: false, error: "Erreur lors de la récupération des données enseignant" }
  }
}
