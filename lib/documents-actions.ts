"use server"

import { getPrisma } from "@/lib/tenant-context"
import { cookies } from "next/headers"
import { getAuthenticatedUser } from "@/lib/session"

export async function getCertificateStudentsAction(search?: string) {
  try {
    const prisma = await getPrisma()
    const cookieStore = await cookies()
    const schoolId = cookieStore.get("school_id")?.value
    const user = await getAuthenticatedUser()

    const whereClause: any = { role: 'student' }
    if (user && user.role === 'student') {
      whereClause.id = user.id
    } else {
      if (schoolId) {
        whereClause.OR = [
          { id_ecole: parseInt(schoolId) },
          { id_ecole: null }
        ]
      }
      if (search && search.trim() !== "") {
        whereClause.nom = { contains: search, mode: 'insensitive' }
      }
    }

    const students = await prisma.user.findMany({
      where: whereClause,
      include: {
        inscriptions: {
          include: {
            classe: true
          }
        }
      },
      orderBy: { nom: 'asc' },
      take: 50
    })

    return {
      success: true,
      data: students.map(s => ({
        id: s.id,
        nom: s.nom,
        email: s.email,
        classe: s.inscriptions?.[0]?.classe?.nom || "Non inscrite",
        classId: s.inscriptions?.[0]?.classe?.id || null,
        created_at: s.created_at
      }))
    }
  } catch (error: any) {
    console.error("[getCertificateStudentsAction] Error:", error)
    return { success: false, error: "Erreur lors de la récupération des élèves", data: [] }
  }
}

export async function getSchoolInfoAction() {
  try {
    const prisma = await getPrisma()
    
    // Fetch active school year
    const activeYear = await prisma.schoolYear.findFirst({
      where: { status: "ACTIVE" }
    })

    const school = await prisma.ecole.findFirst()

    return {
      success: true,
      data: {
        nom: school?.nom || "",
        adresse: (school as any)?.adresse || "",
        telephone: (school as any)?.telephone || "",
        email: (school as any)?.email || "",
        directeur: (school as any)?.directeur || "",
        website: (school as any)?.website || "",
        logo_url: school?.logo_url || null,
        cachet_url: (school as any)?.cachet_url || null,
        activeSchoolYear: activeYear?.label || ""
      }
    }
  } catch (error: any) {
    console.error("[getSchoolInfoAction] Error:", error)
    return { success: false, error: error.message }
  }
}

export async function getBulletinDataAction(classeId: number, period: string) {
  try {
    const prisma = await getPrisma()

    // Fetch class subjects configured for this class
    const classSubjects = await prisma.classSubject.findMany({
      where: { id_classe: classeId },
      orderBy: [{ ordre: 'asc' }, { id: 'asc' }]
    })
    
    // Fetch all students in class with their notes & absences
    const students = await prisma.user.findMany({
      where: {
        role: 'student',
        inscriptions: {
          some: { id_classe: classeId }
        }
      },
      include: {
        notes: {
          include: { evaluation: true }
        },
        absences: true
      }
    })

    const computedReport = students.map(student => {
      const studentNotes = student.notes || []
      const studentAbsences = student.absences || []

      let subjects: Array<{
        name: string
        coef: number
        notesCount: number
        avg: number
        totalPoints: number
        feedback: string
        hasNotes: boolean
      }> = []

      let totalWeightedNotes = 0
      let totalCoefficients = 0

      if (classSubjects.length > 0) {
        subjects = classSubjects.map(cs => {
          const notesForMat = studentNotes.filter(
            n => n.evaluation.matiere.toLowerCase().trim() === cs.matiere.toLowerCase().trim()
          )
          if (notesForMat.length > 0) {
            const list = notesForMat.map(n => Number(n.valeur))
            const avg = list.reduce((a, b) => a + b, 0) / list.length
            const coef = cs.coefficient
            const totalPoints = avg * coef
            totalWeightedNotes += totalPoints
            totalCoefficients += coef

            return {
              name: cs.matiere,
              coef,
              notesCount: list.length,
              avg: Number(avg.toFixed(2)),
              totalPoints: Number(totalPoints.toFixed(2)),
              hasNotes: true,
              feedback: avg >= 16 ? "Excellent travail. Très rigoureux." : 
                        avg >= 14 ? "Très bon travail. Continuez ainsi." : 
                        avg >= 12 ? "Bon travail dans l'ensemble." : 
                        avg >= 10 ? "Passable. Des efforts sont nécessaires." : 
                        "Insuffisant. Travail régulier exigé."
            }
          } else {
            return {
              name: cs.matiere,
              coef: cs.coefficient,
              notesCount: 0,
              avg: 0,
              totalPoints: 0,
              hasNotes: false,
              feedback: "Aucune note saisie"
            }
          }
        })
      } else {
        const subjectMap: Record<string, { notes: number[], type: string }> = {}
        studentNotes.forEach(n => {
          const mat = n.evaluation.matiere || "Général"
          if (!subjectMap[mat]) {
            subjectMap[mat] = { notes: [], type: n.evaluation.type_eval || "Devoir" }
          }
          subjectMap[mat].notes.push(Number(n.valeur))
        })

        subjects = Object.keys(subjectMap).map(mat => {
          const list = subjectMap[mat].notes
          const avg = list.reduce((a, b) => a + b, 0) / list.length
          const coef = 2
          const totalPoints = avg * coef
          totalWeightedNotes += totalPoints
          totalCoefficients += coef
          return {
            name: mat,
            coef,
            notesCount: list.length,
            avg: Number(avg.toFixed(2)),
            totalPoints: Number(totalPoints.toFixed(2)),
            hasNotes: true,
            feedback: avg >= 16 ? "Excellent travail. Très rigoureux." : 
                      avg >= 14 ? "Très bon travail. Continuez ainsi." : 
                      avg >= 12 ? "Bon travail dans l'ensemble." : 
                      avg >= 10 ? "Passable. Des efforts sont nécessaires." : 
                      "Insuffisant. Travail régulier exigé."
          }
        })
      }

      const overallAvg = totalCoefficients > 0
        ? totalWeightedNotes / totalCoefficients
        : 0

      return {
        id: student.id,
        nom: student.nom,
        email: student.email,
        classNom: "Classe",
        overallAvg: Number(overallAvg.toFixed(2)),
        totalAbsences: studentAbsences.length,
        subjects: subjects.length > 0 ? subjects : [],
        decision: overallAvg >= 10 ? "Tableau d'Honneur / Admis" : "Avertissement du Conseil"
      }
    })

    return { success: true, data: computedReport }
  } catch (error: any) {
    console.error("[getBulletinDataAction] Error:", error)
    return { success: false, error: error.message }
  }
}

export async function getBulletinFullClassDataAction(classId: number, semester: string = "1") {
  try {
    const prisma = await getPrisma()

    // 1. Fetch class details & configured subjects
    const targetClass = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        classSubjects: {
          orderBy: [{ ordre: 'asc' }, { id: 'asc' }]
        }
      }
    })

    if (!targetClass) {
      return { success: false, error: "Classe introuvable" }
    }

    const classSubjects = targetClass.classSubjects || []

    // 2. Fetch all students registered in this class
    const inscriptions = await prisma.inscription.findMany({
      where: { id_classe: classId },
      include: {
        user: {
          include: {
            notes: {
              where: {
                evaluation: {
                  id_classe: classId
                }
              },
              include: {
                evaluation: true
              }
            },
            absences: true
          }
        }
      }
    })

    const students = inscriptions.map(i => i.user)

    // 3. Compute student report data with exact calculations
    const computedReport = students.map(student => {
      const studentNotes = student.notes || []
      const studentAbsences = student.absences || []

      let subjects: Array<{
        name: string
        coef: number
        notesCount: number
        avg: number
        totalPoints: number
        feedback: string
        hasNotes: boolean
      }> = []

      let totalWeightedNotes = 0
      let totalCoefficients = 0

      if (classSubjects.length > 0) {
        subjects = classSubjects.map(cs => {
          const notesForMat = studentNotes.filter(
            n => n.evaluation.matiere.toLowerCase().trim() === cs.matiere.toLowerCase().trim()
          )

          if (notesForMat.length > 0) {
            const list = notesForMat.map(n => Number(n.valeur))
            const avg = list.reduce((a, b) => a + b, 0) / list.length
            const coef = cs.coefficient
            const totalPoints = avg * coef
            totalWeightedNotes += totalPoints
            totalCoefficients += coef

            return {
              name: cs.matiere,
              coef,
              notesCount: list.length,
              avg: Number(avg.toFixed(2)),
              totalPoints: Number(totalPoints.toFixed(2)),
              hasNotes: true,
              feedback: avg >= 16 ? "Excellent travail. Très rigoureux." : 
                        avg >= 14 ? "Très bon travail. Continuez ainsi." : 
                        avg >= 12 ? "Bon travail dans l'ensemble." : 
                        avg >= 10 ? "Passable. Des efforts sont nécessaires." : 
                        "Insuffisant. Travail régulier exigé."
            }
          } else {
            return {
              name: cs.matiere,
              coef: cs.coefficient,
              notesCount: 0,
              avg: 0,
              totalPoints: 0,
              hasNotes: false,
              feedback: "Aucune note saisie"
            }
          }
        })
      } else {
        const subjectMap: Record<string, { notes: number[], type: string }> = {}
        studentNotes.forEach(n => {
          const mat = n.evaluation.matiere || "Général"
          if (!subjectMap[mat]) {
            subjectMap[mat] = { notes: [], type: n.evaluation.type_eval || "devoir" }
          }
          subjectMap[mat].notes.push(Number(n.valeur))
        })

        subjects = Object.keys(subjectMap).map(mat => {
          const list = subjectMap[mat].notes
          const avg = list.reduce((a, b) => a + b, 0) / list.length
          const coef = 2
          const totalPoints = avg * coef
          totalWeightedNotes += totalPoints
          totalCoefficients += coef

          return {
            name: mat,
            coef,
            notesCount: list.length,
            avg: Number(avg.toFixed(2)),
            totalPoints: Number(totalPoints.toFixed(2)),
            hasNotes: true,
            feedback: avg >= 16 ? "Excellent travail. Très rigoureux." : 
                      avg >= 14 ? "Très bon travail. Continuez ainsi." : 
                      avg >= 12 ? "Bon travail dans l'ensemble." : 
                      avg >= 10 ? "Passable. Des efforts sont nécessaires." : 
                      "Insuffisant. Travail régulier exigé."
          }
        })
      }

      const overallAvg = totalCoefficients > 0
        ? totalWeightedNotes / totalCoefficients
        : 0

      return {
        id: student.id,
        nom: student.nom,
        email: student.email,
        classNom: targetClass.nom,
        overallAvg: Number(overallAvg.toFixed(2)),
        totalAbsences: studentAbsences.length,
        subjects: subjects.length > 0 ? subjects : [
          { name: "Mathématiques", coef: 4, notesCount: 0, avg: 0, totalPoints: 0, hasNotes: false, feedback: "Aucune note saisie" },
          { name: "Français", coef: 4, notesCount: 0, avg: 0, totalPoints: 0, hasNotes: false, feedback: "Aucune note saisie" }
        ],
        decision: overallAvg >= 10 ? "Tableau d'Honneur / Admis" : "Avertissement du Conseil"
      }
    })

    // Sort by overall average descending to assign exact ranking
    computedReport.sort((a, b) => b.overallAvg - a.overallAvg)

    const rankedReport = computedReport.map((item, index) => ({
      ...item,
      rank: index + 1,
      totalStudents: computedReport.length
    }))

    return {
      success: true,
      data: {
        classInfo: targetClass,
        students: rankedReport
      }
    }
  } catch (error: any) {
    console.error("[getBulletinFullClassDataAction] Error:", error)
    return { success: false, error: error?.message || "Erreur lors du calcul du bulletin" }
  }
}

export async function getDocumentsPortalDataAction() {
  try {
    const prisma = await getPrisma()
    const user = await getAuthenticatedUser()

    if (user && user.role === 'student') {
      const studentData = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          inscriptions: {
            include: {
              classe: true
            }
          }
        }
      })

      const studentName = studentData?.nom || user.nom || "Élève"
      const formattedName = studentName.replace(/\s+/g, '_')
      const classId = studentData?.inscriptions?.[0]?.id_classe
      const className = studentData?.inscriptions?.[0]?.classe?.nom || "Classe"
      const dateStr = studentData?.created_at ? new Date(studentData.created_at).toLocaleDateString("fr-FR") : "Récent"

      const studentDocs = [
        {
          id: `cert-${user.id}`,
          name: `Certificat_Scolarite_${formattedName}.pdf`,
          type: "Certificat de scolarité",
          date: dateStr,
          size: "142 Ko",
          status: "Signé",
          studentId: user.id,
          classId: classId,
          href: "/dashboard/documents/cert"
        },
        {
          id: `bulletin-${user.id}`,
          name: `Bulletin_Scolaire_${className.replace(/\s+/g, '_')}_${formattedName}.pdf`,
          type: "Bulletin scolaire",
          date: dateStr,
          size: "265 Ko",
          status: "Signé",
          studentId: user.id,
          classId: classId,
          href: `/dashboard/documents/bulletin${classId ? `?classId=${classId}` : ''}`
        },
        {
          id: `attest-${user.id}`,
          name: `Attestation_Reussite_${formattedName}.pdf`,
          type: "Attestation de réussite",
          date: dateStr,
          size: "185 Ko",
          status: "Signé",
          studentId: user.id,
          classId: classId,
          href: "/dashboard/documents/cert"
        }
      ]

      return {
        success: true,
        data: {
          documentCounts: {
            certificates: 1,
            reports: 1,
            transcripts: 1,
            attestations: 1
          },
          recentDocuments: studentDocs
        }
      }
    }
    
    // Real DB Counts (Admin / Teacher View)
    const [totalStudents, totalInscriptions, totalClasses, totalEvaluations, totalNotes] = await Promise.all([
      prisma.user.count({ where: { role: 'student' } }),
      prisma.inscription.count(),
      prisma.class.count(),
      prisma.evaluation.count(),
      prisma.note.count()
    ])

    // Real Recent Students / Inscriptions
    const recentStudents = await prisma.user.findMany({
      where: { role: 'student' },
      take: 5,
      orderBy: { created_at: 'desc' },
      include: {
        inscriptions: {
          include: {
            classe: true
          }
        }
      }
    })

    // Real Recent Evaluations
    const recentEvaluations = await prisma.evaluation.findMany({
      take: 5,
      orderBy: { date_eval: 'desc' },
      include: {
        classe: true
      }
    })

    const realDocs: Array<{
      id: string | number
      name: string
      type: string
      date: string
      size: string
      status: string
      studentId?: number
      classId?: number
      href?: string
    }> = []

    recentStudents.forEach(st => {
      const studentName = st.nom || "Élève"
      const dateStr = st.created_at ? new Date(st.created_at).toLocaleDateString("fr-FR") : "Récent"
      const classId = st.inscriptions?.[0]?.id_classe
      realDocs.push({
        id: `cert-${st.id}`,
        name: `Certificat_Scolarite_${studentName.replace(/\s+/g, '_')}.pdf`,
        type: "Certificat de scolarité",
        date: dateStr,
        size: "142 Ko",
        status: "Signé",
        studentId: st.id,
        classId: classId,
        href: "/dashboard/documents/cert"
      })
    })

    recentEvaluations.forEach(ev => {
      const className = ev.classe?.nom || "Classe"
      const subjectName = ev.matiere || "Matière"
      const dateStr = ev.date_eval ? new Date(ev.date_eval).toLocaleDateString("fr-FR") : "Récent"
      realDocs.push({
        id: `bulletin-${ev.id}`,
        name: `Bulletin_${className.replace(/\s+/g, '_')}_${subjectName.replace(/\s+/g, '_')}.pdf`,
        type: "Bulletin scolaire",
        date: dateStr,
        size: "265 Ko",
        status: "Signé",
        classId: ev.id_classe,
        href: `/dashboard/documents/bulletin?classId=${ev.id_classe}`
      })
    })

    recentStudents.slice(0, 3).forEach(st => {
      const studentName = st.nom || "Élève"
      const dateStr = st.created_at ? new Date(st.created_at).toLocaleDateString("fr-FR") : "Récent"
      realDocs.push({
        id: `attest-${st.id}`,
        name: `Attestation_Reussite_${studentName.replace(/\s+/g, '_')}.pdf`,
        type: "Attestation de réussite",
        date: dateStr,
        size: "185 Ko",
        status: "Signé",
        studentId: st.id,
        href: "/dashboard/admin/examens"
      })
    })

    return {
      success: true,
      data: {
        documentCounts: {
          certificates: totalInscriptions || totalStudents || 0,
          reports: totalClasses || 0,
          transcripts: totalEvaluations || totalNotes || 0,
          attestations: totalStudents || 0
        },
        recentDocuments: realDocs.length > 0 ? realDocs : [
          { id: 1, name: "Bulletin_General_Academique.pdf", type: "Bulletin scolaire", date: "Aujourd'hui", size: "245 Ko", status: "Signé", href: "/dashboard/documents/bulletin" }
        ]
      }
    }
  } catch (error: any) {
    console.error("[getDocumentsPortalDataAction] Error:", error)
    return {
      success: false,
      data: {
        documentCounts: { certificates: 0, reports: 0, transcripts: 0, attestations: 0 },
        recentDocuments: []
      }
    }
  }
}
