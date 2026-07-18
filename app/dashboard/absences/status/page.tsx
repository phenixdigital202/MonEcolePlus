export const dynamic = "force-dynamic"

import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAbsenceStats } from "@/lib/absences-actions"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts"
import { Users, AlertCircle, CheckCircle, Clock } from "lucide-react"

// Since this is a server component, we'll use a client component for charts if needed
// or just display data in a nice way. For now, let's make it a nice dashboard.

export default async function AbsencesStatusPage() {
  const result = await getAbsenceStats()
  const stats = result.success ? result.stats : { total: 0, byStatus: [], dailyAbsences: [] }

  const statusMap: Record<string, string> = {
    justifie: "Justifiées",
    non_justifie: "Non justifiées",
    en_attente: "En attente"
  }

  const COLORS = ['#10b981', '#ef4444', '#f59e0b']

  return (
    <>
      <DashboardHeader
        title="Statistiques des Absences"
        subtitle="Analyse détaillée de l'assiduité des élèves"
      />
      <main className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-primary/5 border-primary/10">
            <CardContent className="p-4">
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Total Absences</p>
              <p className="text-2xl font-black text-slate-800">{stats.total}</p>
            </CardContent>
          </Card>
          {stats.byStatus.map((s: any, i: number) => (
            <Card key={i} className="bg-slate-50 border-slate-200">
              <CardContent className="p-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                  {statusMap[s.statut as string] || s.statut}
                </p>
                <p className="text-2xl font-black text-slate-800">{s._count}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="rounded-3xl border-none shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                Répartition par Statut
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              {/* Note: Recharts needs a client component. I'll display a nice list for now or a CSS chart */}
              <div className="w-full space-y-4">
                {stats.byStatus.map((s: any, i: number) => {
                  const percentage = stats.total > 0 ? Math.round((s._count / stats.total) * 100) : 0
                  const color = s.statut === 'justifie' ? 'bg-emerald-500' : s.statut === 'non_justifie' ? 'bg-red-500' : 'bg-amber-500'
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-slate-600">{statusMap[s.statut as string] || s.statut}</span>
                        <span className="font-bold">{percentage}% ({s._count})</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${color}`} style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-none shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Dernières Absences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.dailyAbsences.slice(0, 5).map((a: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">Élève ID: {a.id_eleve || 'N/A'}</p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {new Date(a.date_absence).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold uppercase">
                      <AlertCircle className="h-3 w-3" />
                      Non Justifié
                    </div>
                  </div>
                ))}
                {stats.dailyAbsences.length === 0 && (
                  <p className="text-center py-10 text-slate-400 italic">Aucune donnée récente.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
