"use server"

import { getPrisma } from "@/lib/tenant-context"
import { cookies } from "next/headers"

export async function getCertificateStudentsAction(search?: string) {
  try {
    const prisma = await getPrisma()
    const cookieStore = await cookies()
    const schoolId = cookieStore.get("school_id")?.value

    const whereClause: any = { role: 'student' }
    if (schoolId) {
      whereClause.OR = [
        { id_ecole: parseInt(schoolId) },
        { id_ecole: null }
      ]
    }

    if (search && search.trim() !== "") {
      whereClause.nom = { contains: search, mode: 'insensitive' }
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
    const cookieStore = await cookies()
    const schoolId = cookieStore.get("school_id")?.value

    let school = null
    if (schoolId) {
      school = await prisma.ecole.findUnique({
        where: { id: parseInt(schoolId) }
      })
    }

    return {
      success: true,
      data: {
        nom: school?.nom || "MonÉcole+ Groupe Scolaire",
        adresse: school?.adresse || "Abidjan, Côte d'Ivoire",
        telephone: school?.telephone || "+225 07 00 00 00 00",
        email: school?.email || "contact@monecoleplus.ci",
        directeur: "Le Chef d'Établissement"
      }
    }
  } catch (error: any) {
    console.error("[getSchoolInfoAction] Error:", error)
    return {
      success: true,
      data: {
        nom: "MonÉcole+ Groupe Scolaire",
        adresse: "Abidjan, Côte d'Ivoire",
        telephone: "+225 07 00 00 00 00",
        email: "contact@monecoleplus.ci",
        directeur: "Le Chef d'Établissement"
      }
    }
  }
}

export async function getBulletinFullClassDataAction(classId: number, semester: string = "1") {
  try {
    const prisma = await getPrisma()

    // 1. Fetch class details
    const targetClass = await prisma.class.findUnique({
      where: { id: classId }
    })

    if (!targetClass) {
      return { success: false, error: "Classe introuvable" }
    }

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

      // Group notes by subject
      const subjectMap: Record<string, { notes: number[], type: string }> = {}
      studentNotes.forEach(n => {
        const mat = n.evaluation.matiere || "Général"
        if (!subjectMap[mat]) {
          subjectMap[mat] = { notes: [], type: n.evaluation.type_eval }
        }
        subjectMap[mat].notes.push(Number(n.valeur))
      })

      const subjects = Object.keys(subjectMap).map(mat => {
        const list = subjectMap[mat].notes
        const avg = list.reduce((a, b) => a + b, 0) / list.length
        return {
          name: mat,
          coef: 2, // Standard coefficient
          notesCount: list.length,
          avg: Number(avg.toFixed(2)),
          feedback: avg >= 16 ? "Excellent travail. Très rigoureux." : 
                    avg >= 14 ? "Très bon travail. Continuez ainsi." : 
                    avg >= 12 ? "Bon travail dans l'ensemble." : 
                    avg >= 10 ? "Passable. Des efforts sont nécessaires." : 
                    "Insuffisant. Travail régulier exigé."
        }
      })

      const overallAvg = subjects.length > 0
        ? subjects.reduce((acc, s) => acc + s.avg, 0) / subjects.length
        : 0

      return {
        id: student.id,
        nom: student.nom,
        email: student.email,
        classNom: targetClass.nom,
        overallAvg: Number(overallAvg.toFixed(2)),
        totalAbsences: studentAbsences.length,
        subjects: subjects.length > 0 ? subjects : [
          { name: "Mathématiques", coef: 4, notesCount: 0, avg: 0, feedback: "Aucune note saisie" },
          { name: "Français", coef: 4, notesCount: 0, avg: 0, feedback: "Aucune note saisie" }
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
