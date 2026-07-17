import { cookies } from "next/headers"
import { redirect } from "next/navigation"
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

export default async function ClassesPage() {
  const cookieStore = await cookies()
  const userId = cookieStore.get("user_id")?.value

  if (!userId) {
    redirect("/login")
  }

  const prisma = await getPrisma()
  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) }
  })

  if (!user) {
    redirect("/login")
  }

  const isTeacher = user.role === 'teacher'

  // Fetch classes from the database, filtering if the user is a teacher
  const classes = await prisma.class.findMany({
    where: isTeacher ? {
      emplois_du_temps: {
        some: {
          id_enseignant: user.id
        }
      }
    } : undefined,
    include: {
      _count: {
        select: { 
          inscriptions: true,
          emplois_du_temps: true 
        }
      },
      emplois_du_temps: {
        select: { 
          matiere: true,
          users: { select: { nom: true } }
        }
      },
      evaluations: {
        include: {
          notes: {
            select: { valeur: true }
          }
        }
      }
    }
  })

  // Aggregating stats
  const allClasses = classes.length
  
  let totalStudents = 0
  if (isTeacher) {
    totalStudents = await prisma.inscription.count({
      where: { id_classe: { in: classes.map(c => c.id) } }
    })
  } else {
    totalStudents = await prisma.user.count({ where: { role: 'student' } })
  }

  const totalTeachers = await prisma.user.count({ where: { role: 'teacher' } })

  // Calculate average
  let globalAverage = "N/A"
  if (isTeacher) {
    const classIds = classes.map(c => c.id)
    if (classIds.length > 0) {
      const allNotes = await prisma.notes.aggregate({
        where: {
          evaluations: {
            id_classe: { in: classIds }
          }
        },
        _avg: { valeur: true }
      })
      globalAverage = allNotes._avg.valeur ? Number(allNotes._avg.valeur).toFixed(1) : "N/A"
    }
  } else {
    const allNotes = await prisma.notes.aggregate({
      _avg: { valeur: true }
    })
    globalAverage = allNotes._avg.valeur ? Number(allNotes._avg.valeur).toFixed(1) : "N/A"
  }

  const formattedClasses = classes.map(c => {
    // Unique subjects count
    const uniqueSubjects = new Set(c.emplois_du_temps.map(e => e.matiere)).size
    
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
      teacher: c.emplois_du_temps[0]?.users.nom || "Non assigné",
      subjects: uniqueSubjects,
      average: Number(classAvg)
    }
  })

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
        <ClassesList initialClasses={formattedClasses} userRole={user.role} />
      </main>
    </>
  )
}
