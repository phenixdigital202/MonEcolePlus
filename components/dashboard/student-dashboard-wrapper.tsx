import { Suspense } from "react"
import { getStudentAcademicData } from "@/lib/student-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users as UsersIcon, Calendar, TrendingUp, Clock, Sparkles } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

async function StudentDataFetcher({ studentId }: { studentId: number }) {
  const result = await getStudentAcademicData(studentId)
  if (!result.success || !result.data) {
    return <div className="p-4 bg-destructive/10 text-destructive rounded-lg">Erreur lors du chargement des données.</div>
  }

  const studentData = result.data

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { name: "Moyenne", value: `${studentData.globalAverage || "0.0"}/20`, icon: TrendingUp },
          { name: "Rang", value: `${studentData.rank || "0"}ème`, icon: UsersIcon },
          { name: "Absences", value: studentData.absences.toString() || "0", icon: Clock },
          { name: "Badges", value: "12", icon: Sparkles },
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
          <Card>
            <CardHeader><CardTitle className="text-lg">Dernières Notes</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {studentData.recentGrades.map((n: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 transition-colors hover:bg-muted/60">
                    <div><p className="font-medium text-sm">{n.subject}</p><p className="text-[10px] text-muted-foreground">{n.date}</p></div>
                    <span className="font-black text-primary">{n.value}/20</span>
                  </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Actions Rapides</CardTitle></CardHeader>
            <CardContent className="grid gap-2">
                <Button variant="outline" className="w-full justify-start" asChild prefetch={true}><Link href="/dashboard/grades">Mes notes</Link></Button>
                <Button variant="outline" className="w-full justify-start" asChild prefetch={true}><Link href="/dashboard/schedule">Mon emploi du temps</Link></Button>
                <Button variant="outline" className="w-full justify-start" asChild prefetch={true}><Link href="/dashboard/messages">Messagerie</Link></Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export function StudentDashboardWrapper({ studentId }: { studentId: number }) {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-[400px] w-full rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </div>
    }>
      <StudentDataFetcher studentId={studentId} />
    </Suspense>
  )
}
