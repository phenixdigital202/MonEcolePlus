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
  const whereClause = user.role === 'student' ? { id_eleve: user.id } : {}

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

  return <AbsencesView initialAbsences={initialAbsences} stats={stats} userRole={user.role} />
}
