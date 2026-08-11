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
  let schoolData = null
  let stats = { students: 0, teachers: 0, parents: 0, classes: 0 }
  let schoolYears: any[] = []

  try {
    schoolData = await prisma.ecole.findFirst()

    // 3. Fetch real statistics from database
    const [studentsCount, teachersCount, parentsCount, classesCount, years] = await Promise.all([
      prisma.user.count({ where: { role: "student" } }),
      prisma.user.count({ where: { role: "teacher" } }),
      prisma.user.count({ where: { role: "parent" } }),
      prisma.class.count(),
      prisma.schoolYear.findMany({ orderBy: { startDate: "desc" } })
    ])

    stats = {
      students: studentsCount,
      teachers: teachersCount,
      parents: parentsCount,
      classes: classesCount
    }
    schoolYears = years
  } catch (error) {
    console.error("[AdminSchoolPage] Error loading settings page details:", error)
    return (
      <div className="flex flex-col min-h-full items-center justify-center p-8 bg-slate-50/30">
        <div className="max-w-md w-full p-6 bg-white border border-slate-200 rounded-3xl shadow-xl text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800">Impossible de charger la configuration</h2>
          <p className="text-sm text-slate-500">
            Une erreur de communication avec le serveur de base de données est survenue. Veuillez vérifier votre connexion ou réessayez dans quelques instants.
          </p>
          <a href="/dashboard/admin/school" className="inline-flex justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-indigo-700 active:scale-95 transition-transform duration-200">
            Réessayer
          </a>
        </div>
      </div>
    )
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
