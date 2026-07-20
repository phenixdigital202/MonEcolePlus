export const dynamic = "force-dynamic"

import { getPrisma } from "@/lib/tenant-context"
import { AbsencesView } from "@/components/dashboard/absences-view"
import { cookies } from "next/headers"

export default async function AbsencesPage() {
  const prisma = await getPrisma()
  const cookieStore = await cookies()
  const userId = cookieStore.get("user_id")?.value

  if (!userId) return null

  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) }
  })

  if (!user) return null

  // Filter absences based on role
  let whereClause: any = {}
  let teacherClasses: { id: number; nom: string }[] = []

  if (user.role === 'student') {
    whereClause = { id_eleve: user.id }
  } else if (user.role === 'parent') {
    const parentLinks = await prisma.parentEleve.findMany({
      where: { id_parent: user.id },
      select: { id_eleve: true }
    })
    const childIds = parentLinks.map(link => link.id_eleve)
    whereClause = { id_eleve: { in: childIds } }
  } else if (user.role === 'teacher') {
    // Get all class IDs assigned to this teacher via schedules
    const schedules = await prisma.emploiDuTemps.findMany({
      where: { id_enseignant: user.id },
      select: { id_classe: true, classes: { select: { id: true, nom: true } } },
      distinct: ['id_classe']
    })
    const classIds = schedules.map(s => s.id_classe).filter(Boolean) as number[]
    teacherClasses = schedules
      .map(s => s.classes)
      .filter((c): c is { id: number; nom: string } => c !== null)

    // Get student IDs in those classes
    const inscriptions = await prisma.inscription.findMany({
      where: { id_classe: { in: classIds } },
      select: { id_eleve: true }
    })
    const studentIds = inscriptions.map(i => i.id_eleve)
    whereClause = { id_eleve: { in: studentIds } }
  }

  const absences = await prisma.absence.findMany({
    where: whereClause,
    include: {
      users: {
        include: {
          inscriptions: {
            include: {
              classe: true
            }
          }
        }
      }
    },
    orderBy: { date_absence: 'desc' }
  })

  const stats = {
    total: absences.length,
    justified: absences.filter(a => a.statut === "justifie").length,
    unjustified: absences.filter(a => a.statut === "non_justifie").length,
    pending: absences.filter(a => a.statut === "en_attente").length,
  }

  // Formatting data for the client component
  const initialAbsences = absences.map(a => ({
    id: a.id,
    student: a.users.nom,
    class: a.users.inscriptions[0]?.classe.nom || "N/A",
    date: a.date_absence.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
    reason: a.motif || "Non communiquée",
    status: a.statut || "en_attente",
    duration: "1 jour"
  }))

  const serializedAbsences = JSON.parse(JSON.stringify(initialAbsences))
  const serializedTeacherClasses = JSON.parse(JSON.stringify(teacherClasses))

  return <AbsencesView initialAbsences={serializedAbsences} stats={stats} userRole={user.role} teacherClasses={serializedTeacherClasses} />
}
