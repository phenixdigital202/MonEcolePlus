export const dynamic = "force-dynamic";
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Sparkles, 
  AlertTriangle, 
  TrendingUp,
  TrendingDown,
  Users,
  Brain,
  Lightbulb,
  Target,
  RefreshCw,
  Clock,
  BookOpen,
  DollarSign,
  FileText,
  GraduationCap,
  BarChart3,
  Wallet,
  Activity,
  Award,
  AlertCircle
} from "lucide-react"
import { getPrisma } from "@/lib/tenant-context"
import { cookies } from "next/headers"
import { generateSchoolAIAnalysis } from "@/lib/ai-service"

import { getCachedUser } from "@/lib/cached-queries"

export default async function AIInsightsPage() {
  const prisma = await getPrisma()
  const cookieStore = await cookies()
  const userId = cookieStore.get("user_id")?.value

  if (!userId) return null

  const user = await getCachedUser(parseInt(userId))
  if (!user) return null

  const isTeacher = user.role === "teacher"

  // ── 1. Fetch AI Analysis ───────────────────────────────────────────────────
  const analysis = await generateSchoolAIAnalysis()

  // ── 2. Display Stats Configuration ─────────────────────────────────────────
  const displayStats = isTeacher
    ? [
        { label: "Santé Classe", value: `${analysis.healthIndex}%`, icon: Activity, color: "text-[#6366f1]", bg: "bg-[#6366f1]/10" },
        { label: "Assiduité", value: analysis.attendanceTrend.split("(")[0].trim(), icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" },
        { label: "Moyenne Classes", value: `${analysis.classAnalysis.comparison[0]?.avgGrade || 12}/20`, icon: Target, color: "text-emerald-400", bg: "bg-emerald-500/10" },
        { label: "Élèves à risque", value: analysis.atRiskStudents.length.toString(), icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
      ]
    : [
        { label: "Index de Santé", value: `${analysis.healthIndex}%`, icon: Activity, color: "text-[#6366f1]", bg: "bg-[#6366f1]/10" },
        { label: "Performance Globale", value: analysis.performanceTrend, icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
        { label: "Recouvrement", value: analysis.financeTrend, icon: Wallet, color: "text-indigo-400", bg: "bg-indigo-500/10" },
        { label: "Élèves en difficulté", value: analysis.atRiskStudents.length.toString(), icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
      ]

  return (
    <>
      <DashboardHeader 
        title="Insights IA & Analyses" 
        subtitle={isTeacher
          ? "Recommandations et prévisions scolaires pour vos classes"
          : "Tableau de bord prédictif et recommandations stratégiques IA"
        }
      />
      
      <main className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-4">
          {displayStats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-xl font-black text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* AI Executive Summary */}
        <Card className="border-indigo-500/20 bg-gradient-to-r from-indigo-500/5 to-purple-500/5">
          <CardContent className="p-6 flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0 border border-indigo-500/20">
              <Brain className="h-6 w-6 text-indigo-500" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-indigo-950 text-base">Synthèse Automatique IA</h3>
              <p className="text-sm text-indigo-900/80 leading-relaxed font-medium">{analysis.summary}</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Insights Panel */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Section 1: Analyse des Élèves */}
            <Card>
              <CardHeader className="border-b pb-4">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-500" />
                  Analyse des Élèves & Alertes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {analysis.atRiskStudents.map((student) => (
                    <div key={student.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{student.name}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">{student.class}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{student.reason}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-rose-600 block">Moyenne: {student.avgGrade}/20</span>
                        <span className="text-[10px] text-muted-foreground block">{student.absences} absences</span>
                      </div>
                    </div>
                  ))}
                  {analysis.atRiskStudents.length === 0 && (
                    <p className="p-6 text-center text-sm text-muted-foreground">Aucun élève en alerte actuellement.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Section 2: Analyse Financière (Admin only) */}
            {!isTeacher && (
              <Card>
                <CardHeader className="border-b pb-4">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-emerald-500" />
                    Analyse & Prévisions Financières
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
                      <span className="text-xs text-emerald-800 font-bold block mb-1">Paiements Reçus</span>
                      <p className="text-lg font-black text-emerald-700">{analysis.financeAnalysis.received.toLocaleString("fr")} FCFA</p>
                    </div>
                    <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100">
                      <span className="text-xs text-amber-800 font-bold block mb-1">Paiements en Retard</span>
                      <p className="text-lg font-black text-amber-700">{analysis.financeAnalysis.late.toLocaleString("fr")} FCFA</p>
                    </div>
                    <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100">
                      <span className="text-xs text-indigo-800 font-bold block mb-1">Prévision Recouvrement</span>
                      <p className="text-lg font-black text-indigo-700">{Math.round(analysis.financeAnalysis.forecast).toLocaleString("fr")} FCFA</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Section 3: Prédictions IA */}
            <Card>
              <CardHeader className="border-b pb-4">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-500" />
                  Modèles Prédictifs de Réussite Scolaire
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {analysis.predictions.map((pred, i) => (
                    <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="space-y-1">
                        <p className="font-bold text-sm text-slate-900">{pred.studentName}</p>
                        <p className="text-xs text-muted-foreground">Classement estimé : {pred.examPrediction}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-xs font-bold text-indigo-600 block">Réussite: {pred.successProbability}%</span>
                          <span className={`text-[10px] font-bold uppercase ${
                            pred.dropoutRisk === "élevé" ? "text-red-500" :
                            pred.dropoutRisk === "moyen" ? "text-amber-500" : "text-emerald-500"
                          }`}>Risque abandon: {pred.dropoutRisk}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Recommendations & Classes Comparison */}
          <div className="space-y-6">
            
            {/* Section 4: Recommandations IA */}
            <Card>
              <CardHeader className="border-b pb-4">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                  Recommandations Stratégiques
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase text-indigo-500 tracking-wider">Pédagogique</h4>
                  {analysis.recommendations.pedagogiques.map((rec, i) => (
                    <p key={i} className="text-xs text-slate-700 leading-relaxed font-medium">💡 {rec}</p>
                  ))}
                </div>
                <div className="space-y-2 pt-2 border-t">
                  <h4 className="text-xs font-black uppercase text-emerald-500 tracking-wider">Financier</h4>
                  {analysis.recommendations.financieres.map((rec, i) => (
                    <p key={i} className="text-xs text-slate-700 leading-relaxed font-medium">💡 {rec}</p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Section 5: Comparaison des Classes */}
            <Card>
              <CardHeader className="border-b pb-4">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-indigo-500" />
                  Performances des Classes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                    <span className="text-[10px] text-emerald-800 font-bold uppercase block">Top Performance</span>
                    <span className="text-sm font-extrabold text-emerald-900">{analysis.classAnalysis.best || "3ème"}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-100">
                    <span className="text-[10px] text-rose-800 font-bold uppercase block">En Difficulté</span>
                    <span className="text-sm font-extrabold text-rose-900">{analysis.classAnalysis.worst || "6ème"}</span>
                  </div>
                </div>
                <div className="space-y-2 pt-2 border-t">
                  {analysis.classAnalysis.comparison.map((c, i) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700">{c.name}</span>
                      <span className="text-slate-900 font-bold">Moy. {c.avgGrade}/20 ({c.attendanceRate}% assiduité)</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  )
}
