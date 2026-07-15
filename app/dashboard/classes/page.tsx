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
  const prisma = await getPrisma()
  // Fetch real classes from the database with more counts
  const classes = await prisma.class.findMany({
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

  // Aggregating global stats
  const totalStudents = await prisma.user.count({ where: { role: 'student' } })
  const totalTeachers = await prisma.user.count({ where: { role: 'teacher' } })
  const allClasses = classes.length

  // Calculate global average
  const allNotes = await prisma.notes.aggregate({
    _avg: { valeur: true }
  })
  const globalAverage = allNotes._avg.valeur ? Number(allNotes._avg.valeur).toFixed(1) : "N/A"

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
      <ClassActionsHeader />
      
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
                  <p className="text-2xl font-bold text-foreground">{totalTeachers}</p>
                  <p className="text-sm text-muted-foreground">Enseignants</p>
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
                  <p className="text-sm text-muted-foreground">Moyenne Générale</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Classes List */}
        <ClassesList initialClasses={formattedClasses} />
      </main>
    </>
  )
}
