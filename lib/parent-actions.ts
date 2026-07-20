"use server"

import { getPrisma } from "@/lib/tenant-context"
import { getStudentAcademicData } from "@/lib/student-actions"

export async function getParentDashboardData(parentId: number) {
  try {
    const prisma = await getPrisma()

    // 1. Fetch parent's children
    const links = await prisma.parentEleve.findMany({
      where: { id_parent: parentId },
      include: {
        eleve: {
          include: {
            inscriptions: {
              include: {
                classe: true
              }
            }
          }
        }
      }
    })

    if (links.length === 0) {
      return { 
        success: true, 
        data: { 
          children: [], 
          recentGrades: [], 
          upcomingEvents: [], 
          notifications: [] 
        } 
      }
    }

    // 2. Fetch academic data for each child
    const childrenData = await Promise.all(
      links.map(async (link) => {
        const student = link.eleve
        const studentRes = await getStudentAcademicData(student.id)
        const nameParts = student.nom.split(" ")
        const initials = nameParts.map(p => p[0]).join("").toUpperCase().substring(0, 2)
        
        let previousAverage = 10.0 // Default fallback
        // Fetch previous averages from parcours_scolaires if available
        const lastYear = await prisma.parcoursScolaire.findFirst({
          where: { id_eleve: student.id },
          orderBy: { annee_scolaire: 'desc' }
        })
        if (lastYear && lastYear.moyenne_generale) {
          previousAverage = Number(lastYear.moyenne_generale)
        }

        const academic = studentRes.success ? studentRes.data : null

        return {
          id: student.id,
          name: student.nom,
          avatar: initials || "E",
          class: academic?.className || "Non inscrit",
          classId: student.inscriptions?.[0]?.id_classe || null,
          averageGrade: academic?.globalAverage ? parseFloat(academic.globalAverage) : 0,
          previousAverage,
          absences: academic?.absences || 0,
          rank: academic?.rank || 1,
          totalStudents: academic?.totalStudents || 1,
          subjects: academic?.subjects || [],
          recentGrades: academic?.recentGrades || []
        }
      })
    )

    // 3. Aggregate and sort recent grades of all children
    const allRecentGrades: any[] = []
    childrenData.forEach((child) => {
      child.recentGrades.forEach((g) => {
        allRecentGrades.push({
          subject: g.subject,
          grade: g.value,
          max: 20,
          date: g.date,
          child: child.name.split(" ")[0], // Use first name
          trend: g.value >= child.previousAverage ? "up" : "down"
        })
      })
    })
    
    // Sort recent grades
    const sortedRecentGrades = allRecentGrades.slice(0, 5)

    // 4. Fetch upcoming evaluations/events for children's classes
    const resolvedClassIds = childrenData
      .map(c => c.classId)
      .filter(Boolean) as number[]

    const upcomingEvals = resolvedClassIds.length > 0
      ? await prisma.evaluation.findMany({
          where: { id_classe: { in: resolvedClassIds } },
          include: { classes: true },
          orderBy: { date_eval: 'asc' },
          take: 5
        })
      : []

    const upcomingEvents = upcomingEvals.map((e) => {
      // Find which child is in this class
      const childInClass = childrenData.find(c => c.classId === e.id_classe)
      return {
        type: e.type_eval || "exam",
        title: `${e.type_eval === 'examen' ? 'Examen' : e.type_eval === 'controle' ? 'Contrôle' : 'Devoir'} de ${e.matiere}`,
        child: childInClass ? childInClass.name.split(" ")[0] : "Classe",
        date: new Date(e.date_eval).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short' }),
        time: "08:00" // Default or mock time
      }
    })

    // 5. Fetch announcements/notifications for parents or all
    const announcements = await prisma.annonce.findMany({
      where: {
        cible: { in: ['parents', 'tous'] }
      },
      orderBy: { date_creation: 'desc' },
      take: 4
    })

    const notifications = announcements.map(a => ({
      type: "announcement",
      message: `${a.titre} : ${a.message.substring(0, 80)}${a.message.length > 80 ? '...' : ''}`,
      time: new Date(a.date_creation).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short' }),
      read: false
    }))

    return {
      success: true,
      data: {
        children: childrenData,
        recentGrades: sortedRecentGrades,
        upcomingEvents,
        notifications
      }
    }
  } catch (error) {
    console.error("Error in getParentDashboardData server action:", error)
    return { success: false, error: "Impossible de charger les données de l'espace parent" }
  }
}
