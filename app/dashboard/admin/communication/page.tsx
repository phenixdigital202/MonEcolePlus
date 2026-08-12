import { getPrisma } from "@/lib/tenant-context"
import { cookies } from "next/headers"
import { getCachedUser } from "@/lib/cached-queries"
import CommunicationCenterPage from "@/components/dashboard/communication-center"

export const dynamic = "force-dynamic"

export default async function CommunicationPage() {
  const prisma = await getPrisma()
  const cookieStore = await cookies()
  const userId = cookieStore.get("user_id")?.value

  if (!userId) return null

  const user = await getCachedUser(parseInt(userId))
  if (!user || user.role !== "admin") return null

  // Fetch real audience stats from tenant DB
  const [students, teachers, parents] = await Promise.all([
    prisma.user.count({ where: { role: "student" } }),
    prisma.user.count({ where: { role: "teacher" } }),
    prisma.user.count({ where: { role: "parent" } }),
  ])

  const audienceStats = {
    students,
    teachers,
    parents,
    total: students + teachers + parents,
  }

  return <CommunicationCenterPage audienceStats={audienceStats} />
}
