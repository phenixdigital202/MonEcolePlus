import { cookies } from "next/headers"
import { getCachedUser } from "@/lib/cached-queries"
import CertificatePageClient from "@/components/documents/certificate-client-portal"

export default async function CertificatePage() {
  const cookieStore = await cookies()
  const userId = cookieStore.get("user_id")?.value

  let user = null
  if (userId) {
    user = await getCachedUser(parseInt(userId))
  }

  return (
    <CertificatePageClient userRole={user?.role || "student"} />
  )
}
