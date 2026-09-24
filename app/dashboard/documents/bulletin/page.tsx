import { cookies } from "next/headers"
import { getCachedUser } from "@/lib/cached-queries"
import BulletinClientPage from "@/components/documents/bulletin-client-page"

export default async function BulletinBatchPage({
  searchParams
}: {
  searchParams: Promise<{ classId?: string }>
}) {
  const cookieStore = await cookies()
  const userId = cookieStore.get("user_id")?.value
  const params = await searchParams

  let user = null
  if (userId) {
    user = await getCachedUser(parseInt(userId))
  }

  return (
    <BulletinClientPage 
      userRole={user?.role || "student"} 
      currentUser={user}
      initialClassId={params?.classId}
    />
  )
}
