import { getClasses, getTeachers, getScheduleData } from "@/lib/schedule-actions"
import { ScheduleView } from "@/components/dashboard/schedule-view"
import { cookies } from "next/headers"
import { getPrisma } from "@/lib/tenant-context"

export default async function SchedulePage({
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
    where: { id: parseInt(userId) },
    include: {
      inscriptions: true
    }
  })

  if (!user) return null

  const classes = await getClasses()
  const teachers = await getTeachers()
  
  // If student, force filter to their class
  let classId: number
  let isReadOnly = false

  if (user.role === 'student' && user.inscriptions[0]) {
    classId = user.inscriptions[0].id_classe
    isReadOnly = true
  } else {
    classId = rawClassId ? parseInt(rawClassId) : (classes[0]?.id || 0)
  }

  const schedule = await getScheduleData(classId)

  return (
    <ScheduleView 
      initialClasses={classes.map(c => ({ id: c.id, nom: c.nom }))}
      initialTeachers={teachers.map(t => ({ id: t.id, nom: t.nom }))}
      initialSchedule={schedule}
      initialClassId={classId.toString()}
      isReadOnly={isReadOnly}
    />
  )
}
