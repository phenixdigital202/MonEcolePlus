import { getClasses, getTeachers, getScheduleData } from "@/lib/schedule-actions"
import { ScheduleView } from "@/components/dashboard/schedule-view"
import { cookies } from "next/headers"
import { getPrisma } from "@/lib/tenant-context"
import { getCachedUser } from "@/lib/cached-queries"

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string; teacherId?: string }>
}) {
  const { classId: rawClassId, teacherId: rawTeacherId } = await searchParams
  const prisma = await getPrisma()
  const cookieStore = await cookies()
  const userId = cookieStore.get("user_id")?.value
  
  if (!userId) return null

  const cachedUser = await getCachedUser(parseInt(userId))
  if (!cachedUser) return null

  // Fetch full user with inscriptions from tenant DB using resolved local ID
  const user = await prisma.user.findUnique({
    where: { id: cachedUser.id },
    include: {
      inscriptions: true
    }
  })

  if (!user) return null

  const classes = await getClasses()
  const teachers = await getTeachers()
  
  // If student, force filter to their class. If teacher or teacherId specified, query their specific entries.
  let classId: number
  let isReadOnly = false
  let schedule = []
  let activeTeacher: any = null

  if (user.role === 'student') {
    isReadOnly = true
    const activeInscription = user.inscriptions?.find((i: any) => i.statut === 'active') || user.inscriptions?.[0]
    classId = activeInscription?.id_classe || 0
    schedule = classId ? await getScheduleData(classId) : []
  } else if (user.role === 'teacher') {
    isReadOnly = true
    classId = 0
    schedule = await prisma.emploiDuTemps.findMany({
      where: { id_enseignant: user.id },
      include: {
        user: true,
        classe: true
      }
    })
  } else if (rawTeacherId) {
    const tId = parseInt(rawTeacherId)
    isReadOnly = true
    classId = 0
    activeTeacher = await prisma.user.findUnique({ where: { id: tId } })
    schedule = await prisma.emploiDuTemps.findMany({
      where: { id_enseignant: tId },
      include: {
        user: true,
        classe: true
      }
    })
  } else {
    classId = rawClassId ? parseInt(rawClassId) : (classes[0]?.id || 0)
    schedule = await getScheduleData(classId)
  }

  const displayedClasses = user.role === 'student'
    ? classes.filter(c => c.id === classId)
    : classes

  return (
    <ScheduleView 
      initialClasses={displayedClasses.map(c => ({ id: c.id, nom: c.nom }))}
      initialTeachers={teachers.map(t => ({ id: t.id, nom: t.nom }))}
      initialSchedule={JSON.parse(JSON.stringify(schedule))}
      initialClassId={classId.toString()}
      isReadOnly={isReadOnly}
      userRole={rawTeacherId ? "teacher" : user.role}
    />
  )
}
