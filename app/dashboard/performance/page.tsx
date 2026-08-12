import { cookies } from "next/headers"
import { getPrisma } from "@/lib/tenant-context"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { getGamificationStats, getLeaderboard } from "@/lib/gamification-actions"
import { GamificationDashboard } from "@/components/dashboard/gamification-dashboard"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Star, AlertTriangle, Users, Target } from "lucide-react"

export default async function PerformancePage() {
  const prisma = await getPrisma()
  const cookieStore = await cookies()
  const userId = cookieStore.get("user_id")?.value

  if (!userId) {
    redirect("/login")
  }

  const { getCachedUser } = require("@/lib/cached-queries")
  const cachedUser = await getCachedUser(parseInt(userId))

  if (!cachedUser) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: cachedUser.id },
    include: {
      inscriptions: true
    }
  })

  if (!user) {
    redirect("/login")
  }

  // If teacher, render teacher-specific class performance view
  if (user.role === 'teacher') {
    // 1. Get classes taught by teacher
    const schedules = await prisma.emploiDuTemps.findMany({
      where: { id_enseignant: user.id },
      include: {
        classe: {
          include: {
            inscriptions: {
              include: {
                user: {
                  include: {
                    notes: {
                      include: {
                        evaluation: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      distinct: ['id_classe']
    })
    
    // Get distinct subjects taught by teacher
    const dbSubjects = await prisma.emploiDuTemps.findMany({
      where: { id_enseignant: user.id },
      select: { matiere: true },
      distinct: ['matiere']
    })
    const subjects = dbSubjects.map(s => s.matiere).filter(Boolean) as string[]

    const classPerformanceList = await Promise.all(
      schedules.map(async (sched) => {
        const classe = sched.classe
        if (!classe) return null

        // Get inscriptions in this class
        const inscriptions = await prisma.inscription.findMany({
          where: { id_classe: classe.id },
          include: {
            user: {
              include: {
                notes: {
                  where: {
                    evaluation: {
                      id_classe: classe.id,
                      matiere: { in: subjects }
                    }
                  }
                }
              }
            }
          }
        })

        const studentAverages = inscriptions.map(ins => {
          const studentNotes = ins.user.notes.map(n => Number(n.valeur))
          const avg = studentNotes.length > 0
            ? studentNotes.reduce((a, b) => a + b, 0) / studentNotes.length
            : null
          return {
            id: ins.user.id,
            nom: ins.user.nom,
            average: avg
          }
        }).filter(s => s.average !== null) as { id: number; nom: string; average: number }[]

        const classNotes = studentAverages.map(s => s.average)
        const classAvg = classNotes.length > 0
          ? classNotes.reduce((a, b) => a + b, 0) / classNotes.length
          : 0

        const topStudents = [...studentAverages]
          .sort((a, b) => b.average - a.average)
          .slice(0, 3)

        const strugglingStudents = [...studentAverages]
          .filter(s => s.average < 10)
          .sort((a, b) => a.average - b.average)
          .slice(0, 3)

        const distribution = {
          excellent: studentAverages.filter(s => s.average >= 16).length,
          good: studentAverages.filter(s => s.average >= 12 && s.average < 16).length,
          pass: studentAverages.filter(s => s.average >= 10 && s.average < 12).length,
          struggling: studentAverages.filter(s => s.average < 10).length,
        }

        return {
          classId: classe.id,
          className: classe.nom,
          classLevel: classe.niveau,
          classAverage: classAvg,
          studentCount: inscriptions.length,
          topStudents,
          strugglingStudents,
          distribution
        }
      })
    )

    const filteredClassPerformance = classPerformanceList.filter(Boolean) as any[]

    return (
      <div className="flex flex-col h-full bg-slate-50/50">
        <DashboardHeader 
          title="Performance Académique" 
          subtitle="Analysez les résultats de vos classes et identifiez les élèves à soutenir."
        />
        <main className="p-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredClassPerformance.length === 0 ? (
              <Card className="col-span-full border-dashed p-12 text-center text-muted-foreground">
                Aucune classe ou évaluation enregistrée pour le moment.
              </Card>
            ) : (
              filteredClassPerformance.map((item) => (
                <Card key={item.classId} className="hover:shadow-lg transition-all duration-300 rounded-3xl border-primary/10 bg-white">
                  <CardHeader className="border-b pb-4 bg-primary/5 rounded-t-3xl">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-lg font-black text-slate-800">{item.className}</CardTitle>
                        <CardDescription className="text-xs font-bold text-primary/70 uppercase">{item.classLevel}</CardDescription>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                        {item.studentCount} élèves
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    {/* Class Average Big Stat */}
                    <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border">
                      <span className="text-sm font-bold text-slate-500">Moyenne de classe</span>
                      <span className={`text-2xl font-black ${item.classAverage >= 14 ? 'text-emerald-600' : item.classAverage >= 10 ? 'text-primary' : 'text-rose-600'}`}>
                        {item.classAverage > 0 ? `${item.classAverage.toFixed(1)}/20` : '—'}
                      </span>
                    </div>

                    {/* Distribution chart */}
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Répartition des moyennes</p>
                      <div className="space-y-1.5 text-xs font-semibold">
                        <div className="flex justify-between">
                          <span>Excellente (≥16)</span>
                          <span>{item.distribution.excellent} élève(s)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Bien (12 - 16)</span>
                          <span>{item.distribution.good} élève(s)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Moyen (10 - 12)</span>
                          <span>{item.distribution.pass} élève(s)</span>
                        </div>
                        <div className="flex justify-between text-rose-600">
                          <span>Difficulté (&lt;10)</span>
                          <span>{item.distribution.struggling} élève(s)</span>
                        </div>
                      </div>
                    </div>

                    {/* Top Students */}
                    {item.topStudents.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                          <Star className="h-3 w-3 fill-current" /> Major(s) de classe
                        </p>
                        <div className="space-y-1">
                          {item.topStudents.map((st: any, idx: number) => (
                            <div key={st.id} className="flex justify-between text-xs py-1 border-b border-dashed last:border-0">
                              <span className="font-semibold">{idx + 1}. {st.nom}</span>
                              <span className="font-bold text-emerald-600">{st.average.toFixed(1)}/20</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Struggling Students */}
                    {item.strugglingStudents.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> Élèves à soutenir
                        </p>
                        <div className="space-y-1">
                          {item.strugglingStudents.map((st: any) => (
                            <div key={st.id} className="flex justify-between text-xs py-1 border-b border-dashed last:border-0">
                              <span className="font-semibold text-rose-900">{st.nom}</span>
                              <span className="font-bold text-rose-600">{st.average.toFixed(1)}/20</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </main>
      </div>
    )
  }

  // Existing student performance view
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
