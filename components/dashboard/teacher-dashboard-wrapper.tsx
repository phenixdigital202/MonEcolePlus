import { Suspense } from "react"
import { getTeacherDashboardData } from "@/lib/teacher-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users as UsersIcon, Calendar, TrendingUp, Clock, MessageSquare, Sparkles } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

async function TeacherDataFetcher({ teacherId, matiere }: { teacherId: number, matiere: string | null }) {
  const result = await getTeacherDashboardData(teacherId)
  if (!result.success || !result.data) {
    return <div role="alert" className="p-4 bg-destructive/10 text-destructive rounded-lg no-print print:hidden no-print-system-alert">Erreur lors du chargement des données.</div>
  }

  const teacherData = result.data
  if (matiere) teacherData.teacherSubject = matiere

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { name: "Mes Classes", value: String(teacherData.classCount || 0), icon: UsersIcon, gradient: "from-blue-600 to-indigo-600" },
          { name: "Élèves Total", value: String(teacherData.totalStudents || 0), icon: UsersIcon, gradient: "from-purple-600 to-pink-600" },
          { name: "Heures Hebdo", value: `${teacherData.weeklyHours || 0}h`, icon: Calendar, gradient: "from-emerald-500 to-teal-600" },
          { name: "Présence", value: `${teacherData.attendanceRate || 0}%`, icon: TrendingUp, gradient: "from-amber-500 to-orange-600" },
        ].map((stat, i) => (
          <Card key={i} className={`group relative overflow-hidden border-none bg-gradient-to-br ${stat.gradient} text-white shadow-xl hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 rounded-3xl`}>
            <div className="absolute top-0 right-0 -mr-6 -mt-6 h-24 w-24 rounded-full bg-white/10 blur-xl transition-all group-hover:scale-125" />
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div className="h-11 w-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <stat.icon className="h-5.5 w-5.5 text-white" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-black tracking-tight">{stat.value}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-white/85 mt-1">{stat.name}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {teacherData.nextClass && (
            <Card className="border-blue-200/80 bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-white backdrop-blur-md shadow-md rounded-3xl overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                    <Sparkles className="h-4.5 w-4.5" />
                  </div>
                  Prochain cours : Faire l&apos;appel
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                <div>
                  <p className="font-bold text-lg text-blue-900">{teacherData.nextClass.className} • <span className="text-blue-600">{teacherData.nextClass.matiere}</span></p>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    📍 {teacherData.nextClass.salle} • {teacherData.nextClass.minutesUntil > 0 
                      ? `Début dans ${teacherData.nextClass.minutesUntil} min` 
                      : `À ${teacherData.nextClass.startTimeFormatted}`}
                  </p>
                </div>
                <Button asChild className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 rounded-2xl px-6 font-bold text-xs" prefetch={true}>
                  <Link href="/dashboard/absences">Faire l&apos;appel</Link>
                </Button>
              </CardContent>
            </Card>
          )}
          {!teacherData.nextClass && (
            <Card className="border-slate-200/80 bg-white/80 backdrop-blur-md shadow-sm rounded-3xl">
              <CardContent className="p-6 text-center">
                <p className="text-slate-500 font-medium text-sm">Aucun cours à venir pour aujourd&apos;hui.</p>
              </CardContent>
            </Card>
          )}
          
          {teacherData.todaySchedule && teacherData.todaySchedule.length > 0 && (
            <Card className="border-slate-200/80 bg-white/90 backdrop-blur-md shadow-sm hover:shadow-md transition-all rounded-3xl">
              <CardHeader><CardTitle className="text-base font-bold text-slate-900">Emploi du temps du jour</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {teacherData.todaySchedule.map((course: any, i: number) => {
                  const start = new Date(course.heure_debut)
                  const end = new Date(course.heure_fin)
                  const startStr = `${String(start.getUTCHours()).padStart(2, '0')}:${String(start.getUTCMinutes()).padStart(2, '0')}`
                  const endStr = `${String(end.getUTCHours()).padStart(2, '0')}:${String(end.getUTCMinutes()).padStart(2, '0')}`
                  return (
                    <div key={i} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="text-xs font-mono font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-xl">{startStr} - {endStr}</div>
                        <div>
                          <p className="font-bold text-sm text-slate-900">{course.matiere}</p>
                          <p className="text-xs text-slate-500 font-medium">{course.className} • Salle {course.salle}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="border-slate-200/80 bg-white/90 backdrop-blur-md shadow-sm hover:shadow-md transition-all rounded-3xl">
            <CardHeader><CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2"><Calendar className="h-5 w-5 text-blue-600" /> Agenda Académique</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {teacherData.upcomingAgenda && teacherData.upcomingAgenda.length > 0 ? (
                teacherData.upcomingAgenda.map((e: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-slate-50 transition-all">
                    <div className="h-2.5 w-2.5 rounded-full bg-blue-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{e.matiere} - {e.className}</p>
                      <p className="text-[11px] text-slate-500 font-medium">{e.jour} à {e.heureFormatted} • {e.salle}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 font-medium">Aucun cours à venir dans l&apos;agenda.</p>
              )}
            </CardContent>
          </Card>
          
          {(teacherData.unreadMessages || 0) > 0 && (
            <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/30">
              <CardContent className="p-4 flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{teacherData.unreadMessages} message{teacherData.unreadMessages > 1 ? 's' : ''} non lu{teacherData.unreadMessages > 1 ? 's' : ''}</p>
                </div>
                <Button variant="ghost" size="sm" asChild><Link href="/dashboard/messages" prefetch={true}>Voir</Link></Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle className="text-lg">Actions Rapides</CardTitle></CardHeader>
            <CardContent className="grid gap-2">
                <Button variant="outline" className="w-full justify-start" asChild><Link href="/dashboard/absences" prefetch={true}>Marquer les absences</Link></Button>
                <Button variant="outline" className="w-full justify-start" asChild><Link href="/dashboard/grades" prefetch={true}>Saisir des notes</Link></Button>
                <Button variant="outline" className="w-full justify-start" asChild><Link href="/dashboard/messages" prefetch={true}>Messagerie</Link></Button>
                <Button variant="outline" className="w-full justify-start" asChild><Link href="/dashboard/settings" prefetch={false}>Mon Profil</Link></Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export function TeacherDashboardWrapper({ teacherId, matiere }: { teacherId: number, matiere: string | null }) {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        </div>
      </div>
    }>
      <TeacherDataFetcher teacherId={teacherId} matiere={matiere} />
    </Suspense>
  )
}
