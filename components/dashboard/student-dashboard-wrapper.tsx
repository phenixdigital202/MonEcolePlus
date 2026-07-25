import { Suspense } from "react"
import { getStudentAcademicData } from "@/lib/student-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users as UsersIcon, Calendar, TrendingUp, Clock, Sparkles, BookOpen, MessageSquare } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

async function StudentDataFetcher({ studentId }: { studentId: number }) {
  const result = await getStudentAcademicData(studentId)
  if (!result.success || !result.data) {
    return (
      <div className="p-6 border rounded-2xl bg-destructive/10 text-destructive text-center space-y-2">
        <h3 className="font-bold text-lg">Données de l&apos;élève indisponibles</h3>
        <p className="text-sm text-muted-foreground">{result.error || "Une erreur s'est produite lors du chargement."}</p>
      </div>
    )
  }

  const studentData = result.data
  const formattedRank = studentData.rank === 1 ? "1er" : `${studentData.rank}ème`

  return (
    <div className="grid gap-6 animate-in fade-in duration-500">
      {/* Student Banner Info */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black">{studentData.studentName}</h2>
          <p className="text-blue-100 text-sm">Classe: <span className="font-bold">{studentData.className}</span> ({studentData.level})</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 text-center">
            <p className="text-[10px] uppercase font-bold text-blue-200">Moyenne Générale</p>
            <p className="text-xl font-black">{studentData.globalAverage} / 20</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 text-center">
            <p className="text-[10px] uppercase font-bold text-blue-200">Rang Classe</p>
            <p className="text-xl font-black">{formattedRank} <span className="text-xs font-normal text-blue-200">/ {studentData.totalStudents}</span></p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { name: "Moyenne Général", value: `${studentData.globalAverage} / 20`, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
          { name: "Rang Classe", value: `${formattedRank} sur ${studentData.totalStudents}`, icon: UsersIcon, color: "text-purple-600", bg: "bg-purple-50" },
          { name: "Absences", value: `${studentData.absences} heure${studentData.absences > 1 ? 's' : ''}`, icon: Clock, color: "text-rose-600", bg: "bg-rose-50" },
          { name: "Documents", value: `${studentData.documentCounts.certificates + studentData.documentCounts.reports} récents`, icon: Sparkles, color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map((stat, i) => (
          <Card key={i} className="hover:shadow-lg transition-all duration-300 border-none bg-white/70 backdrop-blur-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`h-12 w-12 rounded-2xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-black text-slate-800">{stat.value}</p>
                <p className="text-xs font-bold uppercase text-slate-500 tracking-wider mt-1">{stat.name}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Grades Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-xl bg-white/70 backdrop-blur-md">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  Dernières Évaluations & Notes
                </CardTitle>
                <Button variant="ghost" size="sm" asChild className="text-xs text-blue-600 font-bold" prefetch={true}>
                  <Link href="/dashboard/grades">Voir tout</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {studentData.recentGrades && studentData.recentGrades.length > 0 ? (
                <div className="space-y-3">
                  {studentData.recentGrades.map((n: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all">
                      <div>
                        <p className="font-bold text-sm text-slate-800">{n.subject}</p>
                        <p className="text-xs text-slate-400 font-medium">{n.date}</p>
                      </div>
                      <span className="text-lg font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-xl">
                        {n.value} / {n.bareme}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <BookOpen className="h-10 w-10 mx-auto text-slate-300" />
                  <p className="text-sm font-medium">Aucune note enregistrée pour le moment.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Shortcuts & Actions */}
        <div className="space-y-6">
          <Card className="border-none shadow-xl bg-white/70 backdrop-blur-md">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-lg font-bold">Raccourcis Élève</CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid gap-3">
              <Button variant="outline" className="w-full justify-start h-12 rounded-2xl border-slate-200 font-bold gap-3 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200" asChild prefetch={true}>
                <Link href="/dashboard/grades"><BookOpen className="h-5 w-5 text-blue-500" /> Consulter mes notes</Link>
              </Button>
              <Button variant="outline" className="w-full justify-start h-12 rounded-2xl border-slate-200 font-bold gap-3 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200" asChild prefetch={true}>
                <Link href="/dashboard/schedule"><Calendar className="h-5 w-5 text-purple-500" /> Mon Emploi du temps</Link>
              </Button>
              <Button variant="outline" className="w-full justify-start h-12 rounded-2xl border-slate-200 font-bold gap-3 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200" asChild prefetch={true}>
                <Link href="/dashboard/documents"><Sparkles className="h-5 w-5 text-emerald-500" /> Bulletins & Certificats</Link>
              </Button>
              <Button variant="outline" className="w-full justify-start h-12 rounded-2xl border-slate-200 font-bold gap-3 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200" asChild prefetch={true}>
                <Link href="/dashboard/messages"><MessageSquare className="h-5 w-5 text-amber-500" /> Contacter l&apos;Administration</Link>
              </Button>
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
        <Skeleton className="h-32 w-full rounded-3xl" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Skeleton className="h-[350px] w-full rounded-3xl" />
          </div>
          <div>
            <Skeleton className="h-[350px] w-full rounded-3xl" />
          </div>
        </div>
      </div>
    }>
      <StudentDataFetcher studentId={studentId} />
    </Suspense>
  )
}
