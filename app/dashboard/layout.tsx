import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getPrisma } from "@/lib/tenant-context"
import { SidebarWrapper } from "@/components/dashboard/sidebar-wrapper"

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

  const prisma = await getPrisma()

  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
    include: {
      ecole: true
    }
  })

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
