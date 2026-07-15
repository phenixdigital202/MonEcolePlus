import { getClasses, getScheduleData } from "@/lib/schedule-actions"
import { ScheduleDndView } from "@/components/dashboard/schedule-dnd-view"
import { cookies } from "next/headers"
import { getPrisma } from "@/lib/tenant-context"
import { notFound } from "next/navigation"

export default async function ScheduleEditPage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string }>
}) {
  const { classId: rawClassId } = await searchParams
  const prisma = await getPrisma()
  const cookieStore = await cookies()
  const userId = cookieStore.get("user_id")?.value
  
  if (!userId) return null

  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) }
  })

  if (!user || user.role !== 'admin') {
    return (
      <div className="p-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Accès Refusé</h2>
        <p className="text-slate-500">Seuls les administrateurs peuvent modifier l&apos;emploi du temps via Drag & Drop.</p>
      </div>
    )
  }

  const classes = await getClasses()
  const classId = rawClassId ? parseInt(rawClassId) : (classes[0]?.id || 0)
  
  if (classes.length === 0) {
    return (
        <div className="p-20 text-center">
          <h2 className="text-2xl font-bold text-slate-800">Aucune classe trouvée</h2>
          <p className="text-slate-500">Veuillez d&apos;abord créer des classes.</p>
        </div>
      )
  }

  const schedule = await getScheduleData(classId)

  return (
    <ScheduleDndView 
      initialClasses={classes.map(c => ({ id: c.id, nom: c.nom }))}
      initialSchedule={schedule}
      selectedClassId={classId}
    />
  )
}
