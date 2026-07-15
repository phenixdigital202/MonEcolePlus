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

  const prisma = await getPrisma()
  const classe = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      inscriptions: {
        include: {
          eleve: {
            include: {
              notes: {
                where: {
                  evaluations: { id_classe: classId }
                },
                select: { valeur: true }
              }
            }
          }
        }
      },
      emplois_du_temps: {
        include: {
          users: {
            select: { nom: true }
          }
        }
      },
      evaluations: {
        include: {
          notes: {
            select: { valeur: true }
          }
        }
      },
      _count: {
        select: { inscriptions: true }
      }
    }
  })

  if (!classe) {
    notFound()
  }

  // Calculate attendance (Real logic would sum total sessions vs absences)
  const totalStudents = classe._count.inscriptions
  const totalAbsences = await prisma.absence.count({
    where: {
      id_eleve: { in: classe.inscriptions.map(i => i.id_eleve) }
    }
  })
  
  // Mock attendance rate based on real absence count for realism
  const attendanceRate = totalStudents > 0 ? Math.max(0, 100 - (totalAbsences / (totalStudents * 10)) * 100).toFixed(0) : "100"

  // Process student averages
  const enrichedInscriptions = classe.inscriptions.map(ins => {
    const grades = ins.eleve.notes.map(n => Number(n.valeur))
    const avg = grades.length > 0 
      ? (grades.reduce((a, b) => a + b, 0) / grades.length).toFixed(1)
      : "N/A"
    
    return { ...ins, average: avg }
  })

  // Calculate class average
  const classNotes = enrichedInscriptions.filter(i => i.average !== "N/A").map(i => Number(i.average))
  const classAvg = classNotes.length > 0 
    ? (classNotes.reduce((a, b) => a + b, 0) / classNotes.length).toFixed(1)
    : "N/A"

  const enrichedClasse = {
    ...classe,
    inscriptions: enrichedInscriptions,
    classAverage: classAvg,
    attendanceRate: attendanceRate
  }

  return <ClassDetailsView classe={enrichedClasse} classId={classId} />
}
