import { cookies } from "next/headers"
import { getPrisma } from "@/lib/tenant-context"
import { redirect } from "next/navigation"
import { AdminSchoolPortal } from "@/components/dashboard/admin-school-portal"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function AdminSchoolPage() {
  const cookieStore = await cookies()
  const userId = cookieStore.get("user_id")?.value

  if (!userId) {
    redirect("/login")
  }

  const prisma = await getPrisma()

  // 1. Fetch current user role & verify permissions
  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) }
  })

  if (!user || user.role !== "admin") {
    // block access for teachers, students and parents
    redirect("/dashboard")
  }

  // 2. Fetch current tenant school data
  const schoolData = await prisma.ecole.findFirst()

  // 3. Fetch real statistics from database
  const [studentsCount, teachersCount, parentsCount, classesCount, schoolYears] = await Promise.all([
    prisma.user.count({ where: { role: "student" } }),
    prisma.user.count({ where: { role: "teacher" } }),
    prisma.user.count({ where: { role: "parent" } }),
    prisma.class.count(),
    prisma.schoolYear.findMany({ orderBy: { startDate: "desc" } })
  ])

  const stats = {
    students: studentsCount,
    teachers: teachersCount,
    parents: parentsCount,
    classes: classesCount
  }

  return (
    <div className="flex flex-col min-h-full bg-slate-50/30 p-4 md:p-8">
      <AdminSchoolPortal 
        schoolData={schoolData ? JSON.parse(JSON.stringify(schoolData)) : null} 
        stats={stats} 
        schoolYears={JSON.parse(JSON.stringify(schoolYears))}
      />
    </div>
  )
}
