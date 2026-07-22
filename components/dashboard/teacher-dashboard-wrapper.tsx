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
    return <div className="p-4 bg-destructive/10 text-destructive rounded-lg">Erreur lors du chargement des données.</div>
  }

  const teacherData = result.data
  if (matiere) teacherData.teacherSubject = matiere

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { name: "Mes Classes", value: String(teacherData.classCount || 0), icon: UsersIcon },
          { name: "Élèves Total", value: String(teacherData.totalStudents || 0), icon: UsersIcon },
          { name: "Heures Hebdo", value: `${teacherData.weeklyHours || 0}h`, icon: Calendar },
          { name: "Présence", value: `${teacherData.attendanceRate || 0}%`, icon: TrendingUp },
        ].map((stat, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.name}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {teacherData.nextClass && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader><CardTitle className="text-lg">Prochain cours : Faire l&apos;appel</CardTitle></CardHeader>
              <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-primary">{teacherData.nextClass.className} - {teacherData.nextClass.matiere}</p>
                  <p className="text-sm text-muted-foreground">
                    {teacherData.nextClass.salle} • {teacherData.nextClass.minutesUntil > 0 
                      ? `Début dans ${teacherData.nextClass.minutesUntil} min` 
                      : `À ${teacherData.nextClass.startTimeFormatted}`}
                  </p>
                </div>
                <Button asChild className="w-full sm:w-auto" prefetch={true}><Link href="/dashboard/absences">Faire l&apos;appel</Link></Button>
              </CardContent>
            </Card>
          )}
          {!teacherData.nextClass && (
            <Card className="border-muted bg-muted/30">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">Aucun cours à venir pour aujourd&apos;hui.</p>
              </CardContent>
            </Card>
          )}
          
          {teacherData.todaySchedule && teacherData.todaySchedule.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-lg">Emploi du temps du jour</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {teacherData.todaySchedule.map((course: any, i: number) => {
                  const start = new Date(course.heure_debut)
                  const end = new Date(course.heure_fin)
                  const startStr = `${String(start.getUTCHours()).padStart(2, '0')}:${String(start.getUTCMinutes()).padStart(2, '0')}`
                  const endStr = `${String(end.getUTCHours()).padStart(2, '0')}:${String(end.getUTCMinutes()).padStart(2, '0')}`
                  return (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="text-xs font-mono text-muted-foreground w-24">{startStr} - {endStr}</div>
                        <div>
                          <p className="font-medium text-sm">{course.matiere}</p>
                          <p className="text-xs text-muted-foreground">{course.className} • {course.salle}</p>
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
          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" /> Agenda</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {teacherData.upcomingAgenda && teacherData.upcomingAgenda.length > 0 ? (
                teacherData.upcomingAgenda.map((e: any, i: number) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <div>
                      <p className="text-sm font-medium">{e.matiere} - {e.className}</p>
                      <p className="text-xs text-muted-foreground">{e.jour} à {e.heureFormatted} • {e.salle}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Aucun cours à venir.</p>
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
                <Button variant="ghost" size="sm" asChild prefetch={true}><Link href="/dashboard/messages">Voir</Link></Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle className="text-lg">Actions Rapides</CardTitle></CardHeader>
            <CardContent className="grid gap-2">
                <Button variant="outline" className="w-full justify-start" asChild prefetch={true}><Link href="/dashboard/absences">Marquer les absences</Link></Button>
                <Button variant="outline" className="w-full justify-start" asChild prefetch={true}><Link href="/dashboard/grades">Saisir des notes</Link></Button>
                <Button variant="outline" className="w-full justify-start" asChild prefetch={true}><Link href="/dashboard/messages">Messagerie</Link></Button>
                <Button variant="outline" className="w-full justify-start" asChild prefetch={false}><Link href="/dashboard/settings">Mon Profil</Link></Button>
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
