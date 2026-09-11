"use server"

import { getPrisma } from "@/lib/tenant-context"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { validateGradeEntry } from "@/lib/pedagogical-constraints-engine"

export async function saveGrades(evaluationId: number, grades: { studentId: number, value: number, comment?: string }[]) {
  try {
    const prisma = await getPrisma()

    // Validate each grade with pedagogical constraints engine
    for (const g of grades) {
      const validation = await validateGradeEntry({
        studentId: g.studentId,
        evaluationId: evaluationId,
        value: g.value
      })
      if (!validation.valid) {
        const blockingMsg = validation.violations.find(v => v.severity === "BLOCKING")?.message
        return { success: false, error: blockingMsg || "Note invalide selon le barème ou la période." }
      }
    }

    const validGrades = grades.filter(g => typeof g.value === 'number' && !isNaN(g.value))
    
    if (validGrades.length === 0) {
      return { success: false, error: "Aucune note valide à enregistrer." }
    }

    const studentIds = validGrades.map(g => g.studentId)
    
    // Execute atomic transaction to replace/insert notes safely
    await prisma.$transaction([
      prisma.note.deleteMany({
        where: {
          id_evaluation: evaluationId,
          id_eleve: { in: studentIds }
        }
      }),
      prisma.note.createMany({
        data: validGrades.map(g => ({
          id_evaluation: evaluationId,
          id_eleve: g.studentId,
          valeur: g.value.toString(),
          commentaire: g.comment || null
        }))
      })
    ])

    revalidatePath("/dashboard/grades")
    revalidatePath("/dashboard/grades/list")
    return { success: true }
  } catch (error: any) {
    console.error("Error saving grades:", error)
    return { success: false, error: error?.message || "Erreur lors de la sauvegarde des notes" }
  }
}

export async function deleteGradeAction(noteId: number) {
  try {
    const prisma = await getPrisma()
    await prisma.note.delete({
      where: { id: noteId }
    })
    revalidatePath("/dashboard/grades")
    revalidatePath("/dashboard/grades/list")
    return { success: true }
  } catch (error: any) {
    console.error("Error deleting grade:", error)
    return { success: false, error: "Erreur lors de la suppression de la note" }
  }
}

export async function updateGradeAction(noteId: number, value: number, comment?: string) {
  try {
    if (isNaN(value) || value < 0 || value > 20) {
      return { success: false, error: "La note doit être comprise entre 0 et 20." }
    }

    const prisma = await getPrisma()
    await prisma.note.update({
      where: { id: noteId },
      data: {
        valeur: value.toString(),
        commentaire: comment !== undefined ? comment : undefined
      }
    })
    revalidatePath("/dashboard/grades")
    revalidatePath("/dashboard/grades/list")
    return { success: true }
  } catch (error: any) {
    console.error("Error updating grade:", error)
    return { success: false, error: "Erreur lors de la mise à jour de la note" }
  }
}

export async function createEvaluationAction(data: { 
  id_classe: number, 
  matiere: string, 
  date_eval: string, 
  type_eval?: 'devoir' | 'examen' | 'controle',
  periode?: string 
}) {
  try {
    if (!data.id_classe) {
      return { success: false, error: "Veuillez sélectionner une classe." }
    }
    if (!data.matiere) {
      return { success: false, error: "Veuillez spécifier une matière." }
    }

    const prisma = await getPrisma()
    const evaluation = await prisma.evaluation.create({
      data: {
        id_classe: data.id_classe,
        matiere: data.matiere,
        date_eval: new Date(data.date_eval),
        type_eval: data.type_eval || 'devoir',
        periode: data.periode || 'Trimestre 1'
      },
      include: {
        classe: true,
        _count: {
          select: { notes: true }
        }
      }
    })
    revalidatePath("/dashboard/grades")
    revalidatePath("/dashboard/grades/evaluations")
    return { success: true, evaluation }
  } catch (error: any) {
    console.error("Error creating evaluation:", error)
    return { success: false, error: error?.message || "Erreur lors de la création de l'évaluation" }
  }
}

export async function updateEvaluationAction(id: number, data: { 
  matiere: string, 
  date_eval: string, 
  type_eval?: 'devoir' | 'examen' | 'controle',
  periode?: string 
}) {
  try {
    const prisma = await getPrisma()
    const evaluation = await prisma.evaluation.update({
      where: { id },
      data: {
        matiere: data.matiere,
        date_eval: new Date(data.date_eval),
        type_eval: data.type_eval || 'devoir',
        periode: data.periode || 'Trimestre 1'
      },
      include: {
        classe: true,
        _count: {
          select: { notes: true }
        }
      }
    })
    revalidatePath("/dashboard/grades")
    revalidatePath("/dashboard/grades/evaluations")
    return { success: true, evaluation }
  } catch (error: any) {
    console.error("Error updating evaluation:", error)
    return { success: false, error: "Erreur lors de la modification de l'évaluation" }
  }
}

export async function deleteEvaluationAction(id: number) {
  try {
    const prisma = await getPrisma()
    
    // Check if notes exist
    const notesCount = await prisma.note.count({
      where: { id_evaluation: id }
    })
    
    if (notesCount > 0) {
      return { success: false, error: "Impossible de supprimer une évaluation qui contient déjà des notes." }
    }

    await prisma.evaluation.delete({
      where: { id }
    })
    
    revalidatePath("/dashboard/grades")
    revalidatePath("/dashboard/grades/evaluations")
    return { success: true }
  } catch (error: any) {
    console.error("Error deleting evaluation:", error)
    return { success: false, error: "Erreur lors de la suppression de l'évaluation" }
  }
}

export async function getEvaluationsByClass(classId: number, options?: { forEntryOnly?: boolean }) {
  const prisma = await getPrisma()
  const cookieStore = await cookies()
  const userId = cookieStore.get("user_id")?.value
  
  if (!userId) {
    return []
  }

  const { getCachedUser } = require("@/lib/cached-queries")
  const user = await getCachedUser(parseInt(userId))

  if (!user) {
    return []
  }

  let baseWhere: any = { id_classe: classId }

  if (user.role === 'teacher') {
    const dbSubjects = await prisma.emploiDuTemps.findMany({
      where: { id_enseignant: user.id },
      select: { matiere: true },
      distinct: ['matiere']
    })
    
    const subjects = new Set<string>()
    if (user.matiere) subjects.add(user.matiere)
    dbSubjects.forEach(s => {
      if (s.matiere) subjects.add(s.matiere)
    })

    if (subjects.size > 0) {
      baseWhere.matiere = { in: Array.from(subjects) }
    }
  }

  const evaluations = await prisma.evaluation.findMany({
    where: baseWhere,
    include: {
      classe: true,
      notes: { select: { id_eleve: true, valeur: true } }
    },
    orderBy: { date_eval: 'desc' }
  })

  // Count active students in class to evaluate entry status
  const activeStudents = await getStudentsByClass(classId)
  const totalActive = activeStudents.length

  const enrichedEvaluations = evaluations.map(e => {
    const notesCount = e.notes.length
    let entryStatus: 'a_saisir' | 'saisie_incomplete' | 'saisie_complete' = 'a_saisir'
    if (notesCount === 0) {
      entryStatus = 'a_saisir'
    } else if (totalActive > 0 && notesCount >= totalActive) {
      entryStatus = 'saisie_complete'
    } else {
      entryStatus = 'saisie_incomplete'
    }
    return {
      ...e,
      totalActiveStudents: totalActive,
      notesCount,
      entryStatus,
      isFullyCompleted: totalActive > 0 && notesCount >= totalActive
    }
  })

  if (options?.forEntryOnly) {
    const available = enrichedEvaluations.filter(e => !e.isFullyCompleted)
    // If all evaluations are fully completed, return all evaluations so dropdown doesn't become empty
    return available.length > 0 ? available : enrichedEvaluations
  }

  return enrichedEvaluations
}

export async function getEnrichedEvaluationsAction() {
  const prisma = await getPrisma()
  const evaluations = await prisma.evaluation.findMany({
    include: {
      classe: true,
      notes: { select: { id_eleve: true, valeur: true } }
    },
    orderBy: { date_eval: 'desc' }
  })

  // Get student count per class
  const classIds = Array.from(new Set(evaluations.map(e => e.id_classe).filter(Boolean)))
  const studentCountMap = new Map<number, number>()
  
  for (const cid of classIds) {
    const stds = await getStudentsByClass(cid)
    studentCountMap.set(cid, stds.length)
  }

  return evaluations.map(e => {
    const totalActive = studentCountMap.get(e.id_classe) || 0
    const notesCount = e.notes.length
    const isFullyCompleted = totalActive > 0 && notesCount >= totalActive
    return {
      ...e,
      totalActiveStudents: totalActive,
      notesCount,
      isFullyCompleted,
      _count: { notes: notesCount }
    }
  })
}

export async function getGradesByEvaluation(evaluationId: number) {
  const prisma = await getPrisma()
  return await prisma.note.findMany({
    where: { id_evaluation: evaluationId }
  })
}

export async function getStudentsByClass(classId: number) {
  if (!classId || isNaN(classId)) return []
  const prisma = await getPrisma()
  
  // Find active school year if configured
  const activeSchoolYear = await prisma.schoolYear.findFirst({
    where: { status: "ACTIVE" }
  })

  let inscriptions: any[] = []

  if (activeSchoolYear) {
    inscriptions = await prisma.inscription.findMany({
      where: {
        id_classe: classId,
        statut: 'active',
        user: { role: 'student' },
        OR: [
          { id_annee_scolaire: activeSchoolYear.id },
          { annee_scolaire: activeSchoolYear.label }
        ]
      },
      include: { user: true },
      orderBy: { user: { nom: 'asc' } }
    })
  }

  // Fallback 1: Active inscriptions for this class regardless of school year string
  if (inscriptions.length === 0) {
    inscriptions = await prisma.inscription.findMany({
      where: { id_classe: classId, statut: 'active', user: { role: 'student' } },
      include: { user: true },
      orderBy: { user: { nom: 'asc' } }
    })
  }

  // Fallback 2: Any inscriptions for this class where user role is student
  if (inscriptions.length === 0) {
    inscriptions = await prisma.inscription.findMany({
      where: { id_classe: classId, user: { role: 'student' } },
      include: { user: true },
      orderBy: { user: { nom: 'asc' } }
    })
  }

  // Fallback 3: Any inscriptions for this class
  if (inscriptions.length === 0) {
    inscriptions = await prisma.inscription.findMany({
      where: { id_classe: classId },
      include: { user: true },
      orderBy: { user: { nom: 'asc' } }
    })
  }

  // Deduplicate by student user id
  const studentMap = new Map<number, any>()
  inscriptions.forEach(i => {
    if (i.user && !studentMap.has(i.user.id)) {
      studentMap.set(i.user.id, i.user)
    }
  })

  return Array.from(studentMap.values())
}

export async function getClasses() {
  const prisma = await getPrisma()
  return await prisma.class.findMany({
    orderBy: { nom: 'asc' }
  })
}
