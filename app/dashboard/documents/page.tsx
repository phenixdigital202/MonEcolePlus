import { cookies } from "next/headers"
import { getPrisma } from "@/lib/tenant-context"
import { DocumentsPortal } from "@/components/dashboard/documents-portal"
import { getCachedUser } from "@/lib/cached-queries"

export default async function DocumentsPage() {
  const prisma = await getPrisma()
  const cookieStore = await cookies()
  const userId = cookieStore.get("user_id")?.value

  if (!userId) return null

  const user = await getCachedUser(parseInt(userId))

  if (!user) return null

  let documentCounts = undefined
  if (user.role === 'student') {
    const res = await (await import("@/lib/student-actions")).getStudentAcademicData(user.id)
    if (res.success) documentCounts = (res.data as any).documentCounts
  }

  return (
    <DocumentsPortal 
      userRole={user.role} 
      studentName={user.role === 'student' ? user.nom : undefined}
      documentCounts={documentCounts}
    />
  )
}
