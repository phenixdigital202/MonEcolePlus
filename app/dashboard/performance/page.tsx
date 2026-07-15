import { cookies } from "next/headers"
import { getPrisma } from "@/lib/tenant-context"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { getGamificationStats, getLeaderboard } from "@/lib/gamification-actions"
import { GamificationDashboard } from "@/components/dashboard/gamification-dashboard"

export default async function PerformancePage() {
  const prisma = await getPrisma()
  const cookieStore = await cookies()
  const userId = cookieStore.get("user_id")?.value

  if (!userId) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
    include: {
      inscriptions: true
    }
  })

  if (!user || user.role !== 'student') {
    // For now, only students see the full game dashboard
    return (
      <div className="p-12 text-center text-muted-foreground">
        La gamification est réservée aux comptes élèves.
      </div>
    )
  }

  const classId = user.inscriptions[0]?.id_classe
  if (!classId) return <div>Non inscrit dans une classe</div>

  // Fetch stats and leaderboard in parallel
  const [statsResult, leaderboardResult] = await Promise.all([
    getGamificationStats(user.id),
    getLeaderboard(classId)
  ])

  if (!statsResult.success) {
    return <div>Erreur lors du chargement des statistiques.</div>
  }

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      <DashboardHeader 
        title="Performance & Badges" 
        subtitle="Suivez votre progression, gagnez des badges et atteignez le sommet du classement !"
      />
      
      <main className="p-6">
        <GamificationDashboard 
          stats={statsResult.data as any} 
          leaderboard={leaderboardResult.data as any} 
          currentUserId={user.id}
        />
      </main>
    </div>
  )
}
