import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  Users, 
  GraduationCap, 
  School, 
  TrendingUp, 
  CreditCard
} from "lucide-react"
import { getPrisma } from "@/lib/tenant-context"
import { logError } from "@/lib/logger"

export default async function AdminDashboardPage() {
  let studentCount = 0
  let teacherCount = 0
  let classCount = 0
  let totalAbsences = 0
  let totalRevenue = 0
  let recentUsers: any[] = []

  try {
    const prisma = await getPrisma()
    const [sCount, tCount, cCount, absCount, revResult, rUsers] = await Promise.all([
      prisma.user.count({ where: { role: 'student' } }),
      prisma.user.count({ where: { role: 'teacher' } }),
      prisma.class.count(),
      prisma.absence.count(),
      prisma.paiement.aggregate({
        _sum: { montant: true },
        where: { status: 'paye' }
      }),
      prisma.user.findMany({
        orderBy: { created_at: 'desc' },
        take: 5,
        select: { id: true, nom: true, role: true, created_at: true }
      })
    ])

    studentCount = sCount
    teacherCount = tCount
    classCount = cCount
    totalAbsences = absCount
    totalRevenue = Number(revResult._sum.montant || 0)
    recentUsers = rUsers
  } catch (error) {
    logError(error, { action: "AdminDashboardPage_fetchData" })
  }

  const presenceRate = studentCount > 0 
    ? Math.min(100, Math.max(0, Math.round(100 - (totalAbsences / (studentCount * 5)) * 100))) 
    : 100

  const schoolStats = [
    { label: "Total Éleves", value: studentCount.toString(), icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Enseignants", value: teacherCount.toString(), icon: GraduationCap, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Classes Active", value: classCount.toString(), icon: School, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { label: "Taux de présence", value: `${presenceRate}%`, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  ]

  return (
    <div className="flex-1 overflow-y-auto min-w-0 p-4 md:p-8 space-y-6">
      <DashboardHeader 
        title="Tableau de Bord Administrateur" 
        subtitle="Vue d'ensemble en temps réel de votre établissement scolaire"
      />
      
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {schoolStats.map((stat) => (
          <Card key={stat.label} className="border-slate-200 shadow-sm bg-white rounded-3xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{stat.label}</p>
                  <h3 className="text-3xl font-black text-slate-900 mt-1">{stat.value}</h3>
                </div>
                <div className={`p-3.5 rounded-2xl ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        {/* Financial Summary Box */}
        <Card className="lg:col-span-4 border-slate-200 shadow-sm bg-white rounded-3xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Encaissements & Trésorerie</CardTitle>
            <CardDescription>Paiements réels comptabilisés dans Supabase</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Encaissé (Comptabilité)</p>
                <h2 className="text-3xl font-black text-emerald-600 mt-1">
                  {totalRevenue.toLocaleString("fr-FR")} FCFA
                </h2>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-emerald-600" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                <p className="text-xs text-slate-500 font-semibold">Taux de présence globale</p>
                <p className="text-xl font-bold text-primary mt-1">{presenceRate}%</p>
              </div>
              <div className="p-4 bg-purple-500/5 rounded-2xl border border-purple-500/10">
                <p className="text-xs text-slate-500 font-semibold">Absences comptabilisées</p>
                <p className="text-xl font-bold text-purple-600 mt-1">{totalAbsences} journées</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Registered Users */}
        <Card className="lg:col-span-3 border-slate-200 shadow-sm bg-white rounded-3xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Activité Récente</CardTitle>
            <CardDescription>Derniers utilisateurs enregistrés en base</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                  {u.nom ? u.nom.substring(0, 2).toUpperCase() : "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{u.nom}</p>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase">
                    {u.role === 'teacher' ? 'Professeur' : u.role === 'student' ? 'Élève' : u.role === 'parent' ? 'Parent' : 'Admin'}
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  {new Date(u.created_at).toLocaleDateString('fr-FR')}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
