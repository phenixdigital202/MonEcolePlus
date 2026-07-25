"use server"

import { getPrisma } from "@/lib/tenant-context"

export async function getStudentAcademicData(userId: number) {
  try {
    const prisma = await getPrisma()

    // 1. Fetch Student Details & Inscription
    const student = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nom: true,
        email: true,
        inscriptions: {
          take: 1,
          orderBy: { id: 'desc' },
          select: {
            classe: {
              select: {
                id: true,
                nom: true,
                niveau: true
              }
            }
          }
        }
      }
    })

    if (!student) {
      return { success: false, error: "Élève introuvable en base de données." }
    }

    const inscription = student.inscriptions[0]
    const currentClass = inscription?.classe || null
    const classId = currentClass?.id || null
    const className = currentClass?.nom || "Non inscrit"
    const level = currentClass?.niveau || "Général"

    // 2. Concurrently fetch Notes, Class Notes (for ranking & class avg), Absences, and Schedule
    const [studentNotes, allClassNotes, absenceCount, schedule] = await Promise.all([
      prisma.note.findMany({
        where: { id_eleve: userId },
        select: {
          id: true,
          valeur: true,
          commentaire: true,
          evaluation: {
            select: { matiere: true, date_eval: true, type_eval: true, bareme: true }
          }
        }
      }),
      classId ? prisma.note.findMany({
        where: { evaluation: { id_classe: classId } },
        select: {
          id_eleve: true,
          valeur: true,
          evaluation: { select: { matiere: true, bareme: true } }
        }
      }) : Promise.resolve([]),
      prisma.absence.count({
        where: { id_eleve: userId }
      }),
      classId ? prisma.emploiDuTemps.findMany({
        where: { id_classe: classId },
        select: {
          matiere: true,
          jour: true,
          heure_debut: true,
          heure_fin: true,
          salle: true,
          user: { select: { nom: true } }
        }
      }) : Promise.resolve([])
    ])

    // 3. Compute Student Global Average & Subject breakdown
    let totalScore = 0
    let totalMax = 0
    const subjectMap: Record<string, { sum: number; max: number; count: number }> = {}

    studentNotes.forEach(n => {
      const val = Number(n.valeur)
      const bareme = n.evaluation?.bareme || 20
      const subject = n.evaluation?.matiere || "Général"

      totalScore += val
      totalMax += bareme

      if (!subjectMap[subject]) {
        subjectMap[subject] = { sum: 0, max: 0, count: 0 }
      }
      subjectMap[subject].sum += val
      subjectMap[subject].max += bareme
      subjectMap[subject].count += 1
    })

    const globalAverageVal = totalMax > 0 ? (totalScore / totalMax) * 20 : 0
    const globalAverageStr = totalMax > 0 ? globalAverageVal.toFixed(2) : "0.00"

    // Calculate Class Averages per Subject
    const subjectClassMap: Record<string, { sum: number; max: number }> = {}
    allClassNotes.forEach(cn => {
      const subj = cn.evaluation?.matiere || "Général"
      const val = Number(cn.valeur)
      const max = cn.evaluation?.bareme || 20
      if (!subjectClassMap[subj]) {
        subjectClassMap[subj] = { sum: 0, max: 0 }
      }
      subjectClassMap[subj].sum += val
      subjectClassMap[subj].max += max
    })

    const formattedSubjectStats = Object.entries(subjectMap).map(([subject, data]) => {
      const studentAvgNum = data.max > 0 ? (data.sum / data.max) * 20 : 0
      const classData = subjectClassMap[subject]
      const classAvgNum = classData && classData.max > 0 ? (classData.sum / classData.max) * 20 : 12.50
      return {
        subject,
        studentAvg: studentAvgNum.toFixed(2),
        classAvg: classAvgNum.toFixed(2),
        count: data.count
      }
    })

    // 4. Compute Student Rank within Class
    const studentAveragesMap: Record<number, { sum: number; max: number }> = {}
    allClassNotes.forEach(cn => {
      const eleveId = cn.id_eleve
      const val = Number(cn.valeur)
      const bareme = cn.evaluation?.bareme || 20
      if (!studentAveragesMap[eleveId]) {
        studentAveragesMap[eleveId] = { sum: 0, max: 0 }
      }
      studentAveragesMap[eleveId].sum += val
      studentAveragesMap[eleveId].max += bareme
    })

    const sortedRanks = Object.entries(studentAveragesMap)
      .map(([id, data]) => ({
        id: Number(id),
        avg: data.max > 0 ? (data.sum / data.max) * 20 : 0
      }))
      .sort((a, b) => b.avg - a.avg)

    const studentRankIndex = sortedRanks.findIndex(r => r.id === userId)
    const rank = studentRankIndex !== -1 ? studentRankIndex + 1 : 1
    const totalStudentsInClass = sortedRanks.length > 0 ? sortedRanks.length : 1

    // 5. Format Recent Grades safely
    const recentGrades = studentNotes.slice(-5).map(n => ({
      id: n.id,
      subject: n.evaluation?.matiere || "Evaluation",
      value: Number(n.valeur),
      bareme: n.evaluation?.bareme || 20,
      date: n.evaluation?.date_eval 
        ? new Date(n.evaluation.date_eval).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short' })
        : "N/A"
    }))

    // 6. Format Schedule safely
    const formattedSchedule = schedule.map(s => {
      const formatTime = (date: Date | string) => {
        try {
          const d = new Date(date)
          return d.toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })
        } catch (e) {
          return "00:00"
        }
      }
      return {
        subject: s.matiere,
        day: s.jour,
        start: formatTime(s.heure_debut),
        end: formatTime(s.heure_fin),
        salle: s.salle || "N/A",
        teacher: s.user?.nom || "Enseignant"
      }
    })

    return {
      success: true,
      data: {
        studentName: student.nom,
        studentEmail: student.email,
        className,
        level,
        globalAverage: globalAverageStr,
        rank,
        totalStudents: totalStudentsInClass,
        absences: absenceCount,
        subjects: formattedSubjectStats,
        recentGrades,
        documentCounts: {
          certificates: 1,
          reports: studentNotes.length > 0 ? 1 : 0,
          transcripts: 1
        },
        schedule: formattedSchedule
      }
    }
  } catch (error: any) {
    console.error("[getStudentAcademicData] FATAL ERROR:", error)
    return { 
      success: false, 
      error: error?.message || "Erreur lors du chargement des données de l'élève" 
    }
  }
}
