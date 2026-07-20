import { cookies } from "next/headers"
import { getPrisma } from "@/lib/tenant-context"
import { redirect } from "next/navigation"
import { SchoolSettingsPortal } from "@/components/dashboard/school-settings-portal"

export default async function SchoolSettingsPage() {
  const prisma = await getPrisma()
  const cookieStore = await cookies()
  const userId = cookieStore.get("user_id")?.value

  if (!userId) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) }
  })

  if (!user) {
    redirect("/login")
  }

  // Fetch school data (will return null if empty, component handles fallback)
  const schoolData = await prisma.ecole.findFirst()

  return (
    <SchoolSettingsPortal 
      userRole={user.role} 
      schoolData={schoolData ? JSON.parse(JSON.stringify(schoolData)) : null}
    />
  )
}
