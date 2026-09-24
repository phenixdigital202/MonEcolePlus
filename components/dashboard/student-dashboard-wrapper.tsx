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
      <div role="alert" className="p-6 border rounded-2xl bg-destructive/10 text-destructive text-center space-y-2 no-print print:hidden no-print-system-alert">
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
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white shadow-xl shadow-indigo-500/20 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-10 -mt-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="relative z-10">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">{studentData.studentName}</h2>
          <p className="text-blue-100/90 text-sm font-medium mt-1">Classe: <span className="font-bold text-white bg-white/15 px-2.5 py-0.5 rounded-lg ml-1">{studentData.className}</span> ({studentData.level})</p>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <div className="bg-white/15 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/20 text-center shadow-sm">
            <p className="text-[10px] uppercase font-black tracking-wider text-blue-200">Moyenne Générale</p>
            <p className="text-2xl font-black text-white">{studentData.globalAverage} <span className="text-xs font-semibold text-blue-200">/ 20</span></p>
          </div>
          <div className="bg-white/15 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/20 text-center shadow-sm">
            <p className="text-[10px] uppercase font-black tracking-wider text-blue-200">Rang Classe</p>
            <p className="text-2xl font-black text-white">{formattedRank} <span className="text-xs font-semibold text-blue-200">/ {studentData.totalStudents}</span></p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { name: "Moyenne Générale", value: `${studentData.globalAverage} / 20`, icon: TrendingUp, gradient: "from-blue-600 to-indigo-600" },
          { name: "Rang Classe", value: `${formattedRank} sur ${studentData.totalStudents}`, icon: UsersIcon, gradient: "from-purple-600 to-pink-600" },
          { name: "Absences", value: `${studentData.absences} heure${studentData.absences > 1 ? 's' : ''}`, icon: Clock, gradient: "from-rose-500 to-orange-600" },
          { name: "Documents", value: `${studentData.documentCounts.certificates + studentData.documentCounts.reports} récents`, icon: Sparkles, gradient: "from-emerald-500 to-teal-600" },
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
                <p className="text-2xl font-black tracking-tight">{stat.value}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-white/85 mt-1">{stat.name}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Grades Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200/80 shadow-sm hover:shadow-md transition-all bg-white/90 backdrop-blur-md rounded-3xl">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Dernières Évaluations & Notes
                </CardTitle>
                <Button variant="ghost" size="sm" asChild className="text-xs text-blue-600 font-bold hover:bg-blue-50" prefetch={true}>
                  <Link href="/dashboard/grades">Voir tout</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {studentData.recentGrades && studentData.recentGrades.length > 0 ? (
                <div className="space-y-3">
                  {studentData.recentGrades.map((n: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/80 border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all">
                      <div>
                        <p className="font-bold text-sm text-slate-900">{n.subject}</p>
                        <p className="text-xs text-slate-500 font-medium">{n.date}</p>
                      </div>
                      <span className="text-base font-black text-blue-600 bg-blue-50 border border-blue-100 px-3.5 py-1.5 rounded-xl">
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
          <Card className="border-slate-200/80 shadow-sm hover:shadow-md transition-all bg-white/90 backdrop-blur-md rounded-3xl">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900">Raccourcis Élève</CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid gap-3">
              <Button variant="outline" className="w-full justify-start h-12 rounded-2xl border-slate-200/80 font-bold text-xs gap-3 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 shadow-sm transition-all" asChild prefetch={true}>
                <Link href="/dashboard/grades"><BookOpen className="h-4.5 w-4.5 text-blue-600" /> Consulter mes notes</Link>
              </Button>
              <Button variant="outline" className="w-full justify-start h-12 rounded-2xl border-slate-200/80 font-bold text-xs gap-3 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 shadow-sm transition-all" asChild prefetch={true}>
                <Link href="/dashboard/schedule"><Calendar className="h-4.5 w-4.5 text-purple-600" /> Mon Emploi du temps</Link>
              </Button>
              <Button variant="outline" className="w-full justify-start h-12 rounded-2xl border-slate-200/80 font-bold text-xs gap-3 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 shadow-sm transition-all" asChild prefetch={true}>
                <Link href="/dashboard/documents"><Sparkles className="h-4.5 w-4.5 text-emerald-600" /> Bulletins & Certificats</Link>
              </Button>
              <Button variant="outline" className="w-full justify-start h-12 rounded-2xl border-slate-200/80 font-bold text-xs gap-3 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 shadow-sm transition-all" asChild prefetch={true}>
                <Link href="/dashboard/messages"><MessageSquare className="h-4.5 w-4.5 text-amber-600" /> Contacter l&apos;Administration</Link>
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
