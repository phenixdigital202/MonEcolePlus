import { DashboardHeader } from "@/components/dashboard/header"
import { getClasses } from "@/lib/schedule-actions"
import { ClassicGradesInput } from "@/components/dashboard/classic-grades-input"
import { getPrisma } from "@/lib/tenant-context"
import { cookies } from "next/headers"
import { getStudentAcademicData } from "@/lib/student-actions"
import { StudentGradebook } from "@/components/dashboard/student-gradebook"

export default async function GradesPage() {
  const prisma = await getPrisma()
  const cookieStore = await cookies()
  const userId = cookieStore.get("user_id")?.value
  
  if (!userId) return null

  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) }
  })

  if (!user) return null

  // If student, show personal gradebook
  if (user.role === 'student') {
    const academicResult = await getStudentAcademicData(user.id)
    const studentData = academicResult.success ? academicResult.data : null

    return (
      <div className="flex flex-col h-full">
        <DashboardHeader 
          title="Mon Carnet de Notes" 
          subtitle="Consultez vos résultats académiques et votre progression"
        />
        <main className="p-6">
          {studentData ? (
            <StudentGradebook data={studentData} />
          ) : (
            <div className="p-12 text-center text-muted-foreground">
              Erreur lors du chargement de vos notes.
            </div>
          )}
        </main>
      </div>
    )
  }

  // Teacher/Admin View
  const classes = await getClasses()
  
  const subjects = [
    "Mathématiques",
    "Français",
    "Anglais",
    "Physique-Chimie",
    "SVT",
    "Histoire-Géographie",
    "EPS",
    "Arts Plastiques",
    "Musique",
    "Informatique"
  ]

  const totalNotes = await prisma.notes.count()
  const classAverageResult = await prisma.notes.aggregate({
    _avg: { valeur: true }
  })
  const classAvg = Number(classAverageResult._avg.valeur) || 0

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader 
        title="Saisie des Notes" 
        subtitle="Entrez les résultats académiques par classe et évaluation"
      />
      
      <main className="p-6">
        <ClassicGradesInput 
          classes={classes.map(c => ({ id: c.id, nom: c.nom }))}
          subjects={subjects}
          globalStats={{
            average: classAvg,
            count: totalNotes
          }}
        />
      </main>
    </div>
  )
}
