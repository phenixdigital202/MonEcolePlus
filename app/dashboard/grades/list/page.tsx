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

export default async function GradesListPage() {
  const prisma = await getPrisma()

  const [notes, classes] = await Promise.all([
    prisma.note.findMany({
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
