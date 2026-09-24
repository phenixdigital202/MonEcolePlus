import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"
export const revalidate = 0
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Users, 
  BookOpen, 
  UserCircle
} from "lucide-react"
import { getPrisma } from "@/lib/tenant-context"
import { ClassesList } from "@/components/dashboard/classes-list"
import { ClassActionsHeader } from "@/components/dashboard/class-actions-header"
import { sortClasses } from "@/lib/utils"

export default async function ClassesPage() {
  const cookieStore = await cookies()
  const userId = cookieStore.get("user_id")?.value

  if (!userId) {
    redirect("/login")
  }

  const prisma = await getPrisma()
  const { getCachedUser } = require("@/lib/cached-queries")
  const user = await getCachedUser(parseInt(userId))
 
  if (!user) {
    redirect("/login")
  }

  const isTeacher = user.role === 'teacher'

  const teacherFilter = isTeacher ? {
    OR: [
      { id_professeur_principal: user.id },
      { emploisDuTemps: { some: { id_enseignant: user.id } } },
      { classSubjects: { some: { teachers: { some: { id_enseignant: user.id } } } } }
    ]
  } : undefined

  // Parallelize independent DB queries for maximum render performance
  const [classes, totalStudents, totalTeachers, allNotes, tenantTeachers] = await Promise.all([
    prisma.class.findMany({
      where: teacherFilter,
      include: {
        professeurPrincipal: {
          select: { id: true, nom: true, email: true }
        },
        classSubjects: {
          select: { id: true, matiere: true }
        },
        _count: {
          select: { 
            inscriptions: true,
            emploisDuTemps: true,
            classSubjects: true
          }
        },
        emploisDuTemps: {
          select: { 
            matiere: true,
            user: { select: { nom: true } }
          }
        },
        evaluations: {
          select: {
            notes: {
              select: { valeur: true }
            }
          }
        }
      }
    }),
    isTeacher 
      ? prisma.inscription.count({ 
          where: { 
            classe: teacherFilter
          } 
        })
      : prisma.user.count({ where: { role: 'student' } }),
    prisma.user.count({ where: { role: 'teacher' } }),
    prisma.note.aggregate({
      _avg: { valeur: true }
    }),
    prisma.user.findMany({
      where: { role: 'teacher' },
      select: { id: true, nom: true },
      orderBy: { nom: 'asc' }
    })
  ])

  // Aggregating stats
  const allClasses = classes.length
  
  // Calculate average
  const globalAverage = allNotes._avg.valeur ? Number(allNotes._avg.valeur).toFixed(1) : "N/A"

  const formattedClasses = classes.map(c => {
    // Unique subjects count from classSubjects AND emploisDuTemps
    const subjectSet = new Set<string>()
    if (c.classSubjects) {
      c.classSubjects.forEach(cs => {
        if (cs.matiere && cs.matiere.trim()) {
          subjectSet.add(cs.matiere.trim())
        }
      })
    }
    if (c.emploisDuTemps) {
      c.emploisDuTemps.forEach(e => {
        if (e.matiere && e.matiere.trim()) {
          subjectSet.add(e.matiere.trim())
        }
      })
    }
    const uniqueSubjects = subjectSet.size

    // Determine Head Teacher (Professeur principal)
    // Priority: 1. Assigned professeurPrincipal, 2. First schedule teacher, 3. "Non assigné"
    const headTeacherName = c.professeurPrincipal?.nom || c.emploisDuTemps[0]?.user?.nom || "Non assigné"
    
    // Calculate class average
    const classNotes = c.evaluations.flatMap(e => e.notes.map(n => Number(n.valeur)))
    const classAvg = classNotes.length > 0 
      ? (classNotes.reduce((a, b) => a + b, 0) / classNotes.length).toFixed(1) 
      : 0

    return {
      id: c.id,
      name: c.nom,
      level: c.niveau,
      students: c._count.inscriptions,
      teacher: headTeacherName,
      teacherId: c.professeurPrincipal?.id || null,
      subjects: uniqueSubjects,
      average: Number(classAvg)
    }
  })

  const sortedClasses = sortClasses(formattedClasses)

  return (
    <>
      <ClassActionsHeader userRole={user.role} />
      
      <main className="p-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card className="border-primary/10 bg-primary/5">
            <CardContent className="p-4 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{allClasses}</p>
                  <p className="text-sm text-muted-foreground">Classes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-emerald-500/10 bg-emerald-500/5">
            <CardContent className="p-4 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Users className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalStudents}</p>
                  <p className="text-sm text-muted-foreground">Élèves</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-amber-500/10 bg-amber-500/5">
            <CardContent className="p-4 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <UserCircle className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground truncate max-w-[150px]">
                    {isTeacher ? (user.matiere || "N/A") : totalTeachers}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isTeacher ? "Matière" : "Enseignants"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-blue-500/10 bg-blue-500/5">
            <CardContent className="p-4 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{globalAverage}</p>
                  <p className="text-sm text-muted-foreground">
                    {isTeacher ? "Moyenne Classes" : "Moyenne Générale"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Classes List */}
        <ClassesList initialClasses={sortedClasses} teachersList={tenantTeachers} userRole={user.role} />
      </main>
    </>
  )
}
