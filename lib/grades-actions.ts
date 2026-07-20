"use server"

import { getPrisma } from "@/lib/tenant-context"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

export async function saveGrades(evaluationId: number, grades: { studentId: number, value: number, comment?: string }[]) {
  const prisma = await getPrisma()
  try {
    const studentIds = grades.map(g => g.studentId)
    
    // Using transaction for reliability
    await prisma.$transaction([
      prisma.note.deleteMany({
        where: {
          id_evaluation: evaluationId,
          id_eleve: { in: studentIds }
        }
      }),
      prisma.note.createMany({
        data: grades.map(g => ({
          id_evaluation: evaluationId,
          id_eleve: g.studentId,
          valeur: g.value.toString(), // Prisma Decimal fields often prefer strings or explicit Decimals
          commentaire: g.comment
        }))
      })
    ])

    revalidatePath("/dashboard/grades")
    return { success: true }
  } catch (error) {
    console.error("Error saving grades:", error)
    return { success: false, error: "Erreur lors de la sauvegarde" }
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
    const prisma = await getPrisma()
    const evaluation = await prisma.evaluation.create({
      data: {
        id_classe: data.id_classe,
        matiere: data.matiere,
        date_eval: new Date(data.date_eval),
        type_eval: data.type_eval || 'devoir',
        periode: data.periode || 'Trimestre 1'
      }
    })
    revalidatePath("/dashboard/grades")
    return { success: true, evaluation }
  } catch (error) {
    console.error("Error creating evaluation:", error)
    return { success: false, error: "Erreur lors de la création de l'évaluation" }
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
      }
    })
    revalidatePath("/dashboard/grades")
    revalidatePath("/dashboard/grades/evaluations")
    return { success: true, evaluation }
  } catch (error) {
    console.error("Error updating evaluation:", error)
    return { success: false, error: "Erreur lors de la modification de l'évaluation" }
  }
}

export async function deleteEvaluationAction(id: number) {
  try {
    const prisma = await getPrisma()
    
    // Check if there are notes associated
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
  } catch (error) {
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
    // Get all distinct subjects taught by this teacher
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
    include: { eleve: true }
  })
  return inscriptions.map(i => i.eleve)
}

export async function getClasses() {
  const prisma = await getPrisma()
  return await prisma.class.findMany({
    orderBy: { nom: 'asc' }
  })
}
