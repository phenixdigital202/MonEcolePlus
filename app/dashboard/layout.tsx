import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getPrisma } from "@/lib/tenant-context"
import { SidebarWrapper } from "@/components/dashboard/sidebar-wrapper"
import { logError } from "@/lib/logger"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const userId = cookieStore.get("user_id")?.value

  if (!userId) {
    redirect("/login")
  }

  let user = null

  try {
    const prisma = await getPrisma()
    user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: { ecole: true }
    })
  } catch (error) {
    logError(error, { action: "DashboardLayout_findUser", userId })
  }

  if (!user) {
    redirect("/login")
  }

  return (
    <SidebarWrapper 
      userRole={user.role} 
      userName={user.nom} 
      schoolName={user.ecole?.nom || "Mon Établissement"}
      userPoints={user.points}
      userLevel={user.niveau}
    >
      {children}
    </SidebarWrapper>
  )
}
