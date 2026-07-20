"use server"

import { getPrisma } from "@/lib/tenant-context"

export async function getStudentAcademicData(userId: number) {
  const prisma = await getPrisma()
  try {
    // 1. Fetch Student Details & Class
    const student = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        inscriptions: {
          include: {
            classe: true
          }
        }
      }
    })

    if (!student || !student.inscriptions[0]) {
      return { success: false, error: "Élève non trouvé ou non inscrit" }
    }

    const currentClass = student.inscriptions[0].classe
    const classId = currentClass.id
    const level = currentClass.niveau || "Collège"

    // 2. Fetch Grades & Class Averages
    const studentNotes = await prisma.note.findMany({
      where: { id_eleve: userId },
      include: {
        evaluations: true
      }
    })

    // Group by subject and calculate personal averages
    const subjectStats: Record<string, { total: number; count: number; classTotal: number; classCount: number }> = {}

    studentNotes.forEach(note => {
      const subject = note.evaluations.matiere
      if (!subjectStats[subject]) {
        subjectStats[subject] = { total: 0, count: 0, classTotal: 0, classCount: 0 }
      }
      subjectStats[subject].total += Number(note.valeur)
      subjectStats[subject].count += 1
    })

    // Get ALL notes for the class in one query to calculate class averages and ranks
    const allClassNotes = await prisma.note.findMany({
      where: {
        evaluations: { id_classe: classId }
      },
      include: {
        evaluations: true
      }
    })

    // Calculate class stats per subject
    allClassNotes.forEach(note => {
      const subject = note.evaluations.matiere
      if (!subjectStats[subject]) {
        subjectStats[subject] = { total: 0, count: 0, classTotal: 0, classCount: 0 }
      }
      subjectStats[subject].classTotal += Number(note.valeur)
      subjectStats[subject].classCount += 1
    })

    const formattedSubjectStats = Object.entries(subjectStats).map(([subject, stats]) => ({
      subject,
      studentAvg: stats.count > 0 ? (stats.total / stats.count).toFixed(2) : "0.00",
      classAvg: stats.classCount > 0 ? (stats.classTotal / stats.classCount).toFixed(2) : "0.00"
    }))

    // 3. Calculate Global Average & Rank (More efficient way)
    const studentGlobalAvg = formattedSubjectStats.length > 0 
      ? formattedSubjectStats.reduce((acc, s) => acc + parseFloat(s.studentAvg), 0) / formattedSubjectStats.length
      : 0

    // Group all class notes by student to find their global averages
    const studentAveragesMap: Record<number, { sum: number; count: number }> = {}
    allClassNotes.forEach(note => {
      if (!studentAveragesMap[note.id_eleve]) studentAveragesMap[note.id_eleve] = { sum: 0, count: 0 }
      studentAveragesMap[note.id_eleve].sum += Number(note.valeur)
      studentAveragesMap[note.id_eleve].count++
    })

    const allAverages = Object.values(studentAveragesMap).map(s => s.sum / s.count)
    const sortedAverages = allAverages.sort((a, b) => b - a)
    const rank = sortedAverages.findIndex(avg => avg <= studentGlobalAvg) + 1

    // 4. Absences
    const absenceCount = await prisma.absence.count({
      where: { id_eleve: userId }
    })

    // 5. Schedule
    const schedule = await prisma.emploiDuTemps.findMany({
      where: { id_classe: classId },
      include: { users: true }
    })

    return {
      success: true,
      data: {
        className: currentClass.nom,
        level,
        globalAverage: studentGlobalAvg.toFixed(2),
        rank: rank || 1,
        totalStudents: Object.keys(studentAveragesMap).length || 1,
        absences: absenceCount,
        subjects: formattedSubjectStats,
        recentGrades: studentNotes.slice(-5).map(n => ({
          subject: n.evaluations.matiere,
          value: Number(n.valeur),
          date: new Date(n.evaluations.date_eval).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short' })
        })),
        documentCounts: {
          certificates: 1, // At least the enrollment certificate
          reports: studentNotes.length > 0 ? 1 : 0,
          transcripts: 1
        },
        schedule: schedule.map(s => {
          // Robust time formatting
          const formatTime = (date: Date) => {
             try {
               return date.toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })
             } catch(e) {
               return "00:00"
             }
          }
          return {
            subject: s.matiere,
            day: s.jour,
            start: formatTime(s.heure_debut),
            end: formatTime(s.heure_fin),
            teacher: s.users.nom
          }
        })
      }
    }
  } catch (error) {
    console.error("Error fetching student academic data:", error)
    return { success: false, error: "Erreur lors du chargement des données" }
  }
}
