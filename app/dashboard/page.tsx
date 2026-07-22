import { Metadata } from "next"
import { DashboardHeader } from "@/components/dashboard/header"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getCachedUser } from "@/lib/cached-queries"
import { AdminDashboardWrapper } from "@/components/dashboard/admin-dashboard-wrapper"
import { TeacherDashboardWrapper } from "@/components/dashboard/teacher-dashboard-wrapper"
import { StudentDashboardWrapper } from "@/components/dashboard/student-dashboard-wrapper"

export const metadata: Metadata = {
  title: "Tableau de bord | MonÉcole+",
  description: "Gérez votre établissement scolaire avec MonÉcole+",
}

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const userId = cookieStore.get("user_id")?.value

  if (!userId) {
    redirect("/login")
  }

  // Uses React Cache to avoid multiple DB calls in the render tree
  const user = await getCachedUser(parseInt(userId))

  if (!user) {
    redirect("/login")
  }

  // Handle Parent redirection
  if (user.role === 'parent') {
    redirect("/dashboard/parent")
  }

  let displayTitle = "Tableau de bord"
  let displaySubtitle = ""

  if (user.role === 'admin') {
    displaySubtitle = `Voici un aperçu analytique de votre établissement en temps réel.`
  } else if (user.role === 'teacher') {
    displaySubtitle = `Bienvenue sur votre espace enseignant.`
  } else if (user.role === 'student') {
    displaySubtitle = `Bienvenue sur ton espace élève.`
  }

  return (
    <div className="flex flex-col min-h-full bg-slate-50/30 min-w-0">
      {/* Shell renders instantly */}
      <DashboardHeader 
        title={displayTitle} 
        subtitle={displaySubtitle}
      />
      
      <main className="p-4 md:p-8">
        {user.role === 'admin' && user.id_ecole && (
          <AdminDashboardWrapper adminId={user.id} ecoleId={user.id_ecole} />
        )}
        
        {user.role === 'teacher' && (
          <TeacherDashboardWrapper teacherId={user.id} matiere={user.matiere} />
        )}
        
        {user.role === 'student' && (
          <StudentDashboardWrapper studentId={user.id} />
        )}
      </main>
    </div>
  )
}
