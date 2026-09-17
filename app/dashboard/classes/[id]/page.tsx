import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  ArrowLeft,
  GraduationCap,
  Calendar,
  BookOpen,
  Award,
  MoreHorizontal,
  Mail,
  UserCheck
} from "lucide-react"
import { getPrisma } from "@/lib/tenant-context"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ClassDetailsView } from "@/components/dashboard/class-details-view"

export default async function ClassDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const classId = parseInt(id)
  
  if (isNaN(classId)) {
    notFound()
  }

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

  // Parallelize security check and class query for maximum speed
  const [isTeaching, classe] = await Promise.all([
    user.role === 'teacher'
      ? prisma.emploiDuTemps.findFirst({
          where: { id_classe: classId, id_enseignant: user.id },
          select: { id: true }
        })
      : Promise.resolve(true),
    prisma.class.findUnique({
      where: { id: classId },
      select: {
        id: true,
        nom: true,
        niveau: true,
        capacite: true,
        professeurPrincipal: {
          select: { id: true, nom: true, email: true, role: true }
        },
        inscriptions: {
          select: {
            id: true,
            id_eleve: true,
            user: {
              select: {
                id: true,
                nom: true,
                email: true,
                notes: {
                  where: { evaluation: { id_classe: classId } },
                  select: { valeur: true }
                }
              }
            }
          }
        },
        emploisDuTemps: {
          select: {
            id: true,
            matiere: true,
            salle: true,
            user: { select: { id: true, nom: true, email: true } }
          }
        },
        evaluations: {
          select: {
            id: true,
            notes: { select: { valeur: true } }
          }
        },
        _count: {
          select: { inscriptions: true }
        }
      }
    })
  ])

  if (user.role === 'teacher' && !isTeaching) {
    redirect("/dashboard/classes")
  }

  if (!classe) {
    notFound()
  }

  const studentIds = classe.inscriptions.map(i => i.id_eleve)
  const totalAbsences = studentIds.length > 0 
    ? await prisma.absence.count({
        where: { id_eleve: { in: studentIds } }
      })
    : 0

  const totalStudents = classe._count.inscriptions
  const attendanceRate = totalStudents > 0 ? Math.max(0, 100 - (totalAbsences / (totalStudents * 10)) * 100).toFixed(0) : "100"

  // Process student averages
  const enrichedInscriptions = classe.inscriptions.map(ins => {
    const studentUser = ins.user
    const grades = studentUser?.notes ? studentUser.notes.map(n => Number(n.valeur)) : []
    const avg = grades.length > 0 
      ? (grades.reduce((a, b) => a + b, 0) / grades.length).toFixed(1)
      : "N/A"
    
    return { 
      ...ins, 
      user: studentUser,
      eleve: studentUser || { id: ins.id_eleve, nom: "Élève Inconnu", email: "" },
      average: avg 
    }
  })

  // Calculate class average
  const classNotes = classe.evaluations.flatMap(e => e.notes.map(n => Number(n.valeur)))
  const classAvg = classNotes.length > 0 
    ? (classNotes.reduce((a, b) => a + b, 0) / classNotes.length).toFixed(1)
    : "N/A"

  const enrichedClasse = {
    ...classe,
    inscriptions: enrichedInscriptions,
    classAverage: classAvg,
    attendanceRate: attendanceRate
  }

  return <ClassDetailsView classe={enrichedClasse} classId={classId} userRole={user.role} />
}
