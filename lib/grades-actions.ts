"use server"

import { getPrisma } from "@/lib/tenant-context"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

export async function saveGrades(evaluationId: number, grades: { studentId: number, value: number, comment?: string }[]) {
  try {
    const prisma = await getPrisma()

    // Validate grades: must be numbers between 0 and 20
    const validGrades = grades.filter(g => typeof g.value === 'number' && !isNaN(g.value) && g.value >= 0 && g.value <= 20)
    
    if (validGrades.length === 0) {
      return { success: false, error: "Aucune note valide (entre 0 et 20) à enregistrer." }
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

export async function getEvaluationsByClass(classId: number) {
  const prisma = await getPrisma()
  const cookieStore = await cookies()
  const userId = cookieStore.get("user_id")?.value
  
  if (!userId) {
    return []
  }

  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) }
  })

  if (!user) {
    return []
  }

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

    return await prisma.evaluation.findMany({
      where: {
        id_classe: classId,
        matiere: { in: Array.from(subjects) }
      },
      orderBy: { date_eval: 'desc' }
    })
  }

  return await prisma.evaluation.findMany({
    where: { id_classe: classId },
    orderBy: { date_eval: 'desc' }
  })
}

export async function getGradesByEvaluation(evaluationId: number) {
  const prisma = await getPrisma()
  return await prisma.note.findMany({
    where: { id_evaluation: evaluationId }
  })
}

export async function getStudentsByClass(classId: number) {
  const prisma = await getPrisma()
  const inscriptions = await prisma.inscription.findMany({
    where: { id_classe: classId },
    include: { user: true }
  })
  return inscriptions.map(i => i.user)
}

export async function getClasses() {
  const prisma = await getPrisma()
  return await prisma.class.findMany({
    orderBy: { nom: 'asc' }
  })
}
