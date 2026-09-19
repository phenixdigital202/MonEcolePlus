import { cookies } from "next/headers"
import { DocumentsPortal } from "@/components/dashboard/documents-portal"
import { getCachedUser } from "@/lib/cached-queries"
import { getDocumentsPortalDataAction } from "@/lib/documents-actions"

export default async function DocumentsPage() {
  const cookieStore = await cookies()
  const userId = cookieStore.get("user_id")?.value

  if (!userId) return null

  const user = await getCachedUser(parseInt(userId))

  if (!user) return null

  const portalRes = await getDocumentsPortalDataAction()
  const portalData = portalRes.data

  return (
    <DocumentsPortal 
      userRole={user.role} 
      studentName={user.role === 'student' ? user.nom : undefined}
      documentCounts={portalData.documentCounts}
      recentDocuments={portalData.recentDocuments}
    />
  )
}
