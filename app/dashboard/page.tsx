import { Metadata } from "next"
import { DashboardHeader } from "@/components/dashboard/header"
import { 
  Users as UsersIcon, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  FileText,
  MessageSquare
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getPrisma } from "@/lib/tenant-context"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getStudentAcademicData } from "@/lib/student-actions"
import { getTeacherDashboardData } from "@/lib/teacher-actions"
import { AdminOverview } from "@/components/dashboard/admin-overview"

export const metadata: Metadata = {
  title: "Tableau de bord | MonÉcole+",
  description: "Gérez votre établissement scolaire avec MonÉcole+",
}

export default async function DashboardPage() {
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

  // Handle Parent redirection
  if (user.role === 'parent') {
    redirect("/dashboard/parent")
  }

  // Fetch real data totals
  const [studentCount, teacherCount, classCount, revenueData] = await Promise.all([
    prisma.user.count({ where: { role: 'student' } }),
    prisma.user.count({ where: { role: 'teacher' } }),
    prisma.class.count(),
    prisma.paiement.aggregate({
      _sum: { montant: true },
      where: { status: 'paye' }
    })
  ])

  const totalRevenue = revenueData._sum.montant ? Number(revenueData._sum.montant).toLocaleString() + " FCFA" : "0 FCFA"

  // Fetch chart data (Real payments by day/month)
  const recentPayments = await prisma.paiement.findMany({
    where: { status: 'paye' },
    take: 20,
    orderBy: { date_paiement: 'desc' },
    select: { montant: true, date_paiement: true, type: true }
  })

  // Format data for charts (simplified for now, could be grouped by month)
  const financeChartData = recentPayments.map(p => ({
    name: new Date(p.date_paiement).toLocaleDateString('fr-FR', { weekday: 'short' }),
    revenue: Number(p.montant),
    target: 200000 // Mock target for comparison
  })).reverse()

  // Fetch real AI insights
  const dbInsights = await prisma.ai_insights.findMany({
    where: { id_utilisateur: user.id },
    take: 3,
    orderBy: { created_at: 'desc' }
  })

  // Fetch metadata for shortcuts if admin
  let shortcutData = null
  if (user.role === 'admin') {
    const res = await (await import("@/lib/admin-shortcut-actions")).getShortcutMetaData()
    if (res.success) shortcutData = res.data
  }

  // Fetch student specific data if role is student
  let studentData = null
  if (user.role === 'student') {
    const result = await getStudentAcademicData(user.id)
    if (result.success) studentData = result.data
  }

  // Fetch teacher specific data if role is teacher
  let teacherData: any = null
  if (user.role === 'teacher') {
    const result = await getTeacherDashboardData(user.id)
    if (result.success) {
      teacherData = result.data
      if (user.matiere) teacherData.teacherSubject = user.matiere
    }
  }

  let displayTitle = "Tableau de bord"
  let displaySubtitle = ""

  if (user.role === 'admin') {
    displaySubtitle = `Voici un aperçu analytique de votre établissement en temps réel.`
  } else if (user.role === 'teacher') {
    const todayCount = teacherData?.todayCoursesCount || 0
    displaySubtitle = todayCount > 0
      ? `Vous avez ${todayCount} cours prévu${todayCount > 1 ? 's' : ''} pour aujourd'hui.`
      : `Aucun cours prévu pour aujourd'hui.`
  } else if (user.role === 'student') {
    displaySubtitle = `Ton prochain cours : ${studentData?.schedule[0]?.subject || "Aucun cours prévu"}.`
  }

  return (
    <div className="flex flex-col min-h-full bg-slate-50/30">
      <DashboardHeader 
        title={displayTitle} 
        subtitle={displaySubtitle}
      />
      
      <main className="p-4 md:p-8">
        {user.role === 'admin' ? (
          <AdminOverview 
            stats={{
              students: studentCount,
              teachers: teacherCount,
              classes: classCount,
              revenue: totalRevenue
            }} 
            shortcutData={shortcutData}
            adminId={user.id}
            chartData={{
              finance: financeChartData.length > 0 ? financeChartData : null,
              insights: dbInsights.length > 0 ? dbInsights : null
            }}
          />
        ) : (
          /* Render Student/Teacher Views */
          <div className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
               {(user.role === 'teacher' ? [
                  { name: "Mes Classes", value: String(teacherData?.classCount || 0), icon: UsersIcon },
                  { name: "Élèves Total", value: String(teacherData?.totalStudents || 0), icon: UsersIcon },
                  { name: "Heures Hebdo", value: `${teacherData?.weeklyHours || 0}h`, icon: Calendar },
                  { name: "Présence", value: `${teacherData?.attendanceRate || 0}%`, icon: TrendingUp },
               ] : [
                  { name: "Moyenne", value: `${studentData?.globalAverage || "0.0"}/20`, icon: TrendingUp },
                  { name: "Rang", value: `${studentData?.rank || "0"}ème`, icon: UsersIcon },
                  { name: "Absences", value: studentData?.absences.toString() || "0", icon: Clock },
                  { name: "Badges", value: "12", icon: Sparkles },
               ]).map((stat, i) => (
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
                  {user.role === 'teacher' && teacherData?.nextClass && (
                    <Card className="border-primary/20 bg-primary/5">
                      <CardHeader><CardTitle className="text-lg">Prochain cours : Faire l&apos;appel</CardTitle></CardHeader>
                      <CardContent className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-primary">{teacherData.nextClass.className} - {teacherData.nextClass.matiere}</p>
                          <p className="text-sm text-muted-foreground">
                            {teacherData.nextClass.salle} • {teacherData.nextClass.minutesUntil > 0 
                              ? `Début dans ${teacherData.nextClass.minutesUntil} min` 
                              : `À ${teacherData.nextClass.startTimeFormatted}`}
                          </p>
                        </div>
                        <Button asChild><Link href="/dashboard/absences">Faire l&apos;appel</Link></Button>
                      </CardContent>
                    </Card>
                  )}
                  {user.role === 'teacher' && !teacherData?.nextClass && (
                    <Card className="border-muted bg-muted/30">
                      <CardContent className="p-6 text-center">
                        <p className="text-muted-foreground">Aucun cours à venir pour aujourd&apos;hui.</p>
                      </CardContent>
                    </Card>
                  )}
                  {user.role === 'teacher' && teacherData?.todaySchedule && teacherData.todaySchedule.length > 0 && (
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
                  {user.role === 'student' && (
                    <Card>
                      <CardHeader><CardTitle className="text-lg">Dernières Notes</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        {studentData?.recentGrades.map((n: any, i: number) => (
                           <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 transition-colors hover:bg-muted/60">
                              <div><p className="font-medium text-sm">{n.subject}</p><p className="text-[10px] text-muted-foreground">{n.date}</p></div>
                              <span className="font-black text-primary">{n.value}/20</span>
                           </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
               </div>
               <div className="space-y-6">
                  <Card>
                    <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" /> Agenda</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      {user.role === 'teacher' && teacherData?.upcomingAgenda && teacherData.upcomingAgenda.length > 0 ? (
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
                  {user.role === 'teacher' && (teacherData?.unreadMessages || 0) > 0 && (
                    <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/30">
                      <CardContent className="p-4 flex items-center gap-3">
                        <MessageSquare className="h-5 w-5 text-blue-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{teacherData.unreadMessages} message{teacherData.unreadMessages > 1 ? 's' : ''} non lu{teacherData.unreadMessages > 1 ? 's' : ''}</p>
                        </div>
                        <Button variant="ghost" size="sm" asChild><Link href="/dashboard/messages">Voir</Link></Button>
                      </CardContent>
                    </Card>
                  )}
                  <Card>
                    <CardHeader><CardTitle className="text-lg">Actions Rapides</CardTitle></CardHeader>
                    <CardContent className="grid gap-2">
                       <Button variant="outline" className="w-full justify-start" asChild><Link href="/dashboard/absences">Marquer les absences</Link></Button>
                       <Button variant="outline" className="w-full justify-start" asChild><Link href="/dashboard/grades">Saisir des notes</Link></Button>
                       <Button variant="outline" className="w-full justify-start" asChild><Link href="/dashboard/messages">Messagerie</Link></Button>
                       <Button variant="outline" className="w-full justify-start" asChild><Link href="/dashboard/settings">Mon Profil</Link></Button>
                    </CardContent>
                  </Card>
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

