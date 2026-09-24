import { getPrisma } from "@/lib/tenant-context"
import { getClasses } from "@/lib/grades-actions"
import { GradesListView } from "@/components/dashboard/grades-list-view"

// Default coefficient mapping for common subjects
const DEFAULT_COEFFICIENTS: Record<string, number> = {
  "mathématiques": 4,
  "français": 4,
  "anglais": 3,
  "physique-chimie": 3,
  "svt": 2,
  "histoire-géographie": 2,
  "eps": 1,
  "arts plastiques": 1,
  "musique": 1,
  "informatique": 2,
  "philosophie": 3,
  "sciences physiques": 3,
}

import { cookies } from "next/headers"

export default async function GradesListPage() {
  const prisma = await getPrisma()
  const cookieStore = await cookies()
  const userId = cookieStore.get("user_id")?.value

  let notesWhere: any = undefined

  if (userId) {
    const { getCachedUser } = require("@/lib/cached-queries")
    const user = await getCachedUser(parseInt(userId))

    if (user && user.role === 'teacher') {
      const teacherClasses = await prisma.class.findMany({
        where: {
          OR: [
            { id_professeur_principal: user.id },
            { emploisDuTemps: { some: { id_enseignant: user.id } } },
            { classSubjects: { some: { teachers: { some: { id_enseignant: user.id } } } } }
          ]
        },
        select: { id: true }
      })
      const teacherClassIds = teacherClasses.map(c => c.id)

      const [dbScheduleSubjs, classSubjectTeacherRows, teacherSubjects] = await Promise.all([
        prisma.emploiDuTemps.findMany({
          where: { id_enseignant: user.id },
          select: { matiere: true },
          distinct: ['matiere']
        }),
        prisma.classSubjectTeacher.findMany({
          where: { id_enseignant: user.id },
          select: { classSubject: { select: { matiere: true } } }
        }),
        prisma.teacherSubject.findMany({
          where: { id_enseignant: user.id },
          select: { matiere: true }
        })
      ])

      const subjects = new Set<string>()
      if (user.matiere) subjects.add(user.matiere.trim())
      dbScheduleSubjs.forEach(s => { if (s.matiere) subjects.add(s.matiere.trim()) })
      classSubjectTeacherRows.forEach(cst => { if (cst.classSubject?.matiere) subjects.add(cst.classSubject.matiere.trim()) })
      teacherSubjects.forEach(ts => { if (ts.matiere) subjects.add(ts.matiere.trim()) })

      const subjectArray = Array.from(subjects)

      notesWhere = {
        evaluation: {
          id_classe: { in: teacherClassIds.length > 0 ? teacherClassIds : [-1] },
          ...(subjectArray.length > 0 ? { matiere: { in: subjectArray } } : {})
        }
      }
    }
  }

  const [notes, classes] = await Promise.all([
    prisma.note.findMany({
      where: notesWhere,
      include: {
        user: true,
        evaluation: {
          include: {
            classe: {
              include: {
                emploisDuTemps: {
                  include: {
                    user: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { evaluation: { date_eval: 'desc' } }
    }),
    getClasses()
  ])

  // Attach coefficients and teacher names on the server
  const serializedNotes = notes.map(n => {
    // Find teacher
    const subject = n.evaluation?.matiere
    const classEmplois = n.evaluation?.classe?.emploisDuTemps || []
    const matchEmp = classEmplois.find((emp: any) => emp.matiere.toLowerCase() === subject?.toLowerCase())
    const teacherName = matchEmp?.user?.nom || "Non assigné"

    // Find coefficient from default mapping
    const coefficient = (subject ? DEFAULT_COEFFICIENTS[subject.toLowerCase()] : undefined) || 2

    // Class average for this evaluation
    const evalNotes = notes.filter(o => o.id_evaluation === n.id_evaluation)
    const avg = evalNotes.reduce((sum, o) => sum + Number(o.valeur), 0) / (evalNotes.length || 1)

    return {
      ...n,
      teacherName,
      coefficient,
      classAverage: Number(avg.toFixed(2))
    }
  })

  const finalSerializedNotes = JSON.parse(JSON.stringify(serializedNotes))

  return <GradesListView initialNotes={finalSerializedNotes} classes={classes} />
}
