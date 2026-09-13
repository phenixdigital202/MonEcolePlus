'use server'

import { getPrisma } from './tenant-context'
import { revalidatePath } from 'next/cache'

/**
 * Updates the Head Teacher (Professeur Principal) for a class.
 */
export async function updateHeadTeacherAction(classId: number, teacherId: number | null) {
  try {
    const prisma = await getPrisma()

    // 1. Verify class exists in tenant
    const targetClass = await prisma.class.findUnique({
      where: { id: classId },
    })

    if (!targetClass) {
      return { success: false, error: 'Classe introuvable dans cet établissement.' }
    }

    // 2. If teacherId is provided, validate teacher in tenant DB
    if (teacherId !== null) {
      const teacher = await prisma.user.findUnique({
        where: { id: teacherId },
      })

      if (!teacher) {
        return { success: false, error: 'Enseignant introuvable.' }
      }

      if (teacher.role !== 'teacher') {
        return { success: false, error: "L'utilisateur sélectionné n'est pas un enseignant." }
      }
    }

    // 3. Update class head teacher
    await prisma.class.update({
      where: { id: classId },
      data: { id_professeur_principal: teacherId },
    })

    revalidatePath(`/dashboard/classes/${classId}`)
    return { success: true, message: 'Professeur principal mis à jour avec succès.' }
  } catch (error: any) {
    console.error('Error updating head teacher:', error)
    return { success: false, error: error?.message || 'Erreur lors de la mise à jour du professeur principal.' }
  }
}

/**
 * Fetches complete pedagogical details for a class:
 * - Class info with head teacher
 * - Configured class subjects & assigned teachers
 * - Allowed subjects for the level (LevelSubject)
 * - Teachers qualified for subjects (TeacherSubject)
 * - All tenant teachers
 */
export async function getClassPedagogyDetailsAction(classId: number) {
  try {
    const prisma = await getPrisma()

    const classData = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        professeurPrincipal: {
          select: { id: true, nom: true, email: true, role: true }
        },
        classSubjects: {
          include: {
            teachers: {
              include: {
                teacher: {
                  select: { id: true, nom: true, email: true }
                }
              }
            }
          },
          orderBy: [{ ordre: 'asc' }, { id: 'asc' }]
        },
        schoolLevel: {
          include: {
            levelSubjects: true
          }
        }
      }
    })

    if (!classData) {
      return { success: false, error: 'Classe introuvable.' }
    }

    // Get all tenant teachers
    const tenantTeachers = await prisma.user.findMany({
      where: { role: 'teacher' },
      select: { id: true, nom: true, email: true, matiere: true },
      orderBy: { nom: 'asc' }
    })

    // Get all teacher subject habilitations
    const teacherSubjects = await prisma.teacherSubject.findMany({
      select: { id_enseignant: true, matiere: true }
    })

    // Compute allowed level subjects
    let allowedSubjects: string[] = []
    if (classData.schoolLevel && classData.schoolLevel.levelSubjects.length > 0) {
      allowedSubjects = classData.schoolLevel.levelSubjects.map((ls: any) => ls.matiere)
    } else {
      // Fallback if no specific level subjects defined: gather distinct subjects from teacherSubjects or default set
      const fromTeachers = Array.from(new Set(teacherSubjects.map((ts: any) => ts.matiere)))
      const fromClassSubjects = classData.classSubjects.map((cs: any) => cs.matiere)
      allowedSubjects = Array.from(new Set([...fromTeachers, ...fromClassSubjects]))
    }

    return {
      success: true,
      data: {
        classData,
        tenantTeachers,
        teacherSubjects,
        allowedSubjects
      }
    }
  } catch (error: any) {
    console.error('Error fetching class pedagogy details:', error)
    return { success: false, error: error?.message || 'Erreur lors du chargement de la gestion pédagogique.' }
  }
}

/**
 * Adds a new subject to a class with coefficient and assigned teachers.
 */
export async function addClassSubjectAction(data: {
  classId: number
  matiere: string
  coefficient: number
  volume_horaire_hebdo?: number
  teacherIds: number[]
}) {
  try {
    const prisma = await getPrisma()
    const { classId, matiere, coefficient, volume_horaire_hebdo = 4, teacherIds } = data

    // 1. Validation: coefficient strictly positive
    if (!coefficient || coefficient <= 0) {
      return { success: false, error: 'Le coefficient doit être strictement supérieur à 0.' }
    }

    if (!matiere || !matiere.trim()) {
      return { success: false, error: 'Veuillez spécifier une matière.' }
    }

    // 2. Validate class exists in tenant
    const targetClass = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        schoolLevel: {
          include: { levelSubjects: true }
        }
      }
    })

    if (!targetClass) {
      return { success: false, error: 'Classe introuvable.' }
    }

    // 3. Validate level subject restriction if LevelSubjects configured
    if (targetClass.schoolLevel && targetClass.schoolLevel.levelSubjects.length > 0) {
      const allowed = targetClass.schoolLevel.levelSubjects.some(
        (ls: any) => ls.matiere.toLowerCase().trim() === matiere.toLowerCase().trim()
      )
      if (!allowed) {
        return { success: false, error: `La matière "${matiere}" n'est pas autorisée pour le niveau ${targetClass.niveau}.` }
      }
    }

    // 4. Validate subject uniqueness in class
    const existing = await prisma.classSubject.findUnique({
      where: {
        id_classe_matiere: {
          id_classe: classId,
          matiere: matiere.trim()
        }
      }
    })

    if (existing) {
      return { success: false, error: `La matière "${matiere}" est déjà associée à cette classe.` }
    }

    // 5. Validate assigned teachers are habilitated via TeacherSubject
    for (const teacherId of teacherIds) {
      const teacher = await prisma.user.findUnique({ where: { id: teacherId } })
      if (!teacher || teacher.role !== 'teacher') {
        return { success: false, error: `L'utilisateur ID ${teacherId} n'est pas un enseignant valide.` }
      }

      // Check teacher subject habilitation if TeacherSubject records exist for teacher
      const habilitated = await prisma.teacherSubject.findFirst({
        where: {
          id_enseignant: teacherId,
          matiere: { equals: matiere.trim(), mode: 'insensitive' }
        }
      })

      if (!habilitated) {
        // Fallback: check if user's main matiere field matches
        const mainMatiereMatch = teacher.matiere && teacher.matiere.toLowerCase().trim() === matiere.toLowerCase().trim()
        if (!mainMatiereMatch) {
          return {
            success: false,
            error: `L'enseignant ${teacher.nom} n'est pas habilité à enseigner ${matiere}.`
          }
        }
      }
    }

    // 6. Get max ordre to position at end
    const lastSubject = await prisma.classSubject.findFirst({
      where: { id_classe: classId },
      orderBy: { ordre: 'desc' }
    })
    const newOrdre = (lastSubject?.ordre || 0) + 1

    // 7. Create ClassSubject and ClassSubjectTeacher entries
    const classSubject = await prisma.classSubject.create({
      data: {
        id_classe: classId,
        matiere: matiere.trim(),
        coefficient: Number(coefficient),
        volume_horaire_hebdo: Number(volume_horaire_hebdo),
        ordre: newOrdre,
        teachers: {
          create: teacherIds.map((tId) => ({
            id_enseignant: tId
          }))
        }
      }
    })

    revalidatePath(`/dashboard/classes/${classId}`)
    return { success: true, message: 'Matière ajoutée à la classe avec succès.', data: classSubject }
  } catch (error: any) {
    console.error('Error adding class subject:', error)
    return { success: false, error: error?.message || "Erreur lors de l'ajout de la matière." }
  }
}

/**
 * Updates coefficient, volume horaire, and assigned teachers for an existing class subject.
 */
export async function updateClassSubjectAction(data: {
  classSubjectId: number
  coefficient: number
  volume_horaire_hebdo?: number
  teacherIds: number[]
}) {
  try {
    const prisma = await getPrisma()
    const { classSubjectId, coefficient, volume_horaire_hebdo = 4, teacherIds } = data

    if (!coefficient || coefficient <= 0) {
      return { success: false, error: 'Le coefficient doit être strictement supérieur à 0.' }
    }

    const classSubject = await prisma.classSubject.findUnique({
      where: { id: classSubjectId },
      include: { classe: true }
    })

    if (!classSubject) {
      return { success: false, error: 'Matière de classe introuvable.' }
    }

    // Validate teachers
    for (const teacherId of teacherIds) {
      const teacher = await prisma.user.findUnique({ where: { id: teacherId } })
      if (!teacher || teacher.role !== 'teacher') {
        return { success: false, error: `L'utilisateur ID ${teacherId} n'est pas un enseignant valide.` }
      }

      const habilitated = await prisma.teacherSubject.findFirst({
        where: {
          id_enseignant: teacherId,
          matiere: { equals: classSubject.matiere, mode: 'insensitive' }
        }
      })

      if (!habilitated) {
        const mainMatiereMatch = teacher.matiere && teacher.matiere.toLowerCase().trim() === classSubject.matiere.toLowerCase().trim()
        if (!mainMatiereMatch) {
          return {
            success: false,
            error: `L'enseignant ${teacher.nom} n'est pas habilité à enseigner ${classSubject.matiere}.`
          }
        }
      }
    }

    // Transaction to update classSubject and replace teachers
    await prisma.$transaction(async (tx) => {
      await tx.classSubject.update({
        where: { id: classSubjectId },
        data: {
          coefficient: Number(coefficient),
          volume_horaire_hebdo: Number(volume_horaire_hebdo)
        }
      })

      // Delete current assigned teachers
      await tx.classSubjectTeacher.deleteMany({
        where: { id_class_subject: classSubjectId }
      })

      // Re-create assigned teachers
      if (teacherIds.length > 0) {
        await tx.classSubjectTeacher.createMany({
          data: teacherIds.map((tId) => ({
            id_class_subject: classSubjectId,
            id_enseignant: tId
          }))
        })
      }
    })

    revalidatePath(`/dashboard/classes/${classSubject.id_classe}`)
    return { success: true, message: 'Matière de classe mise à jour avec succès.' }
  } catch (error: any) {
    console.error('Error updating class subject:', error)
    return { success: false, error: error?.message || 'Erreur lors de la modification de la matière.' }
  }
}

/**
 * Removes a subject configuration from a class.
 * Past evaluations and notes are preserved.
 */
export async function deleteClassSubjectAction(classSubjectId: number) {
  try {
    const prisma = await getPrisma()

    const classSubject = await prisma.classSubject.findUnique({
      where: { id: classSubjectId }
    })

    if (!classSubject) {
      return { success: false, error: 'Matière de classe introuvable.' }
    }

    const classId = classSubject.id_classe

    await prisma.classSubject.delete({
      where: { id: classSubjectId }
    })

    revalidatePath(`/dashboard/classes/${classId}`)
    return { success: true, message: 'Matière retirée de la classe avec succès.' }
  } catch (error: any) {
    console.error('Error deleting class subject:', error)
    return { success: false, error: error?.message || 'Erreur lors de la suppression de la matière.' }
  }
}
