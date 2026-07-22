"use server"

import { getPrisma } from "@/lib/tenant-context"

export async function getStudentAcademicData(userId: number) {
  const prisma = await getPrisma()
  try {
    // 1. Fetch Student Details & Class with strict select
    const student = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nom: true,
        inscriptions: {
          take: 1,
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

    if (!student || !student.inscriptions[0]) {
      return { success: false, error: "Élève non trouvé ou non inscrit" }
    }

    const currentClass = student.inscriptions[0].classe
    const classId = currentClass.id
    const level = currentClass.niveau || "Collège"

    // 2. Fetch Grades, Class Notes, Absences and Schedule concurrently
    const [studentNotes, allClassNotes, absenceCount, schedule] = await Promise.all([
      prisma.note.findMany({
        where: { id_eleve: userId },
        select: {
          valeur: true,
          evaluation: {
            select: { matiere: true, date_eval: true }
          }
        }
      }),
      prisma.note.findMany({
        where: { evaluation: { id_classe: classId } },
        select: {
          id_eleve: true,
          valeur: true,
          evaluation: { select: { matiere: true } }
        }
      }),
      prisma.absence.count({
        where: { id_eleve: userId }
      }),
      prisma.emploiDuTemps.findMany({
        where: { id_classe: classId },
        select: {
          matiere: true,
          jour: true,
          heure_debut: true,
          heure_fin: true,
          user: { select: { nom: true } }
        }
      })
    ])

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
          subject: n.evaluation.matiere,
          value: Number(n.valeur),
          date: new Date(n.evaluation.date_eval).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short' })
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
            teacher: s.user.nom
          }
        })
      }
    }
  } catch (error) {
    console.error("Error fetching student academic data:", error)
    return { success: false, error: "Erreur lors du chargement des données" }
  }
}
