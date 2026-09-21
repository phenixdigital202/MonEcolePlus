"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar,
  Download,
  Filter,
  Loader2
} from "lucide-react"
import {
  Line,
  LineChart,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { getAnalyticsData } from "@/lib/admin-shortcut-actions"
import { toast } from "sonner"

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedClass, setSelectedClass] = useState<string>("all")
  const [selectedYear, setSelectedYear] = useState<string>("2025-2026")
  const [isExporting, setIsExporting] = useState<boolean>(false)

  const fetchData = async (cls: string, yr: string) => {
    setLoading(true)
    const res = await getAnalyticsData(cls, yr)
    if (res.success) {
      setData(res.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData(selectedClass, selectedYear)
  }, [selectedClass, selectedYear])

  const handleExportExcel = async () => {
    try {
      setIsExporting(true)
      toast.info("Génération du rapport Excel en cours...")
      const XLSX = await import("xlsx")
      
      const className = selectedClass === "all" 
        ? "Toutes_les_classes" 
        : data?.classes?.find((c: any) => c.id.toString() === selectedClass)?.nom || "Classe"

      const summaryData = [
        { Indicateur: "Moyenne Générale", Valeur: `${data?.globalAverage || 0} / 20` },
        { Indicateur: "Taux de Présence", Valeur: `${data?.attendanceRate || 0} %` },
        { Indicateur: "Taux de Réussite", Valeur: `${data?.successRate || 0} %` },
        { Indicateur: "Nombre d'Élèves Inscrits", Valeur: data?.totalStudents || 0 },
        { Indicateur: "Classe Sélectionnée", Valeur: className },
        { Indicateur: "Année Scolaire", Valeur: selectedYear },
        { Indicateur: "Date d'Exportation", Valeur: new Date().toLocaleDateString("fr-FR") }
      ]

      const subjectData = (data?.subjectAverages || []).map((s: any) => ({
        Discipline: s.subject,
        Moyenne: s.average,
        Statut: s.average >= 10 ? "Satisfaisant" : "Avis de soutien"
      }))

      const absenceData = (data?.absenceData || []).map((a: any) => ({
        Mois: a.month,
        "Absences Justifiées": a.justified,
        "Absences Non Justifiées": a.unjustified,
        Total: a.justified + a.unjustified
      }))

      const wb = XLSX.utils.book_new()
      
      const wsSummary = XLSX.utils.json_to_sheet(summaryData)
      const wsSubject = XLSX.utils.json_to_sheet(subjectData)
      const wsAbsence = XLSX.utils.json_to_sheet(absenceData)

      XLSX.utils.book_append_sheet(wb, wsSummary, "Résumé Général")
      XLSX.utils.book_append_sheet(wb, wsSubject, "Performances Matières")
      XLSX.utils.book_append_sheet(wb, wsAbsence, "Suivi Absences")

      const filename = `Rapport_Analytics_${className}_${selectedYear}_${new Date().toISOString().split("T")[0]}.xlsx`
      XLSX.writeFile(wb, filename)

      toast.success(`Rapport Excel téléversé (${filename}) avec succès !`)
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Erreur lors de la génération du fichier Excel.")
    } finally {
      setIsExporting(false)
    }
  }

  if (loading && !data) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  const performanceData = data?.performanceData || [
    { month: "Sept", average: 12.5, target: 14 },
    { month: "Oct", average: 13.1, target: 14 },
    { month: "Nov", average: 13.4, target: 14 },
    { month: "Dec", average: 13.8, target: 14 },
    { month: "Jan", average: 14.0, target: 14 },
    { month: "Fév", average: 14.2, target: 14 },
    { month: "Mars", average: 14.1, target: 14 },
    { month: "Avril", average: data?.globalAverage || 14.5, target: 14 },
  ]

  return (
    <>
      <DashboardHeader 
        title="Analytics" 
        subtitle="Visualisez les performances et tendances réelles"
      />
      
      <main className="p-6 animate-in fade-in duration-700">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-3">
            <select 
              value={selectedClass} 
              onChange={(e) => setSelectedClass(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              <option value="all">Toutes les classes</option>
              {data?.classes?.map((c: any) => (
                <option key={c.id} value={c.id}>{c.nom}</option>
              ))}
            </select>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              {(data?.schoolYears || ["2025-2026", "2024-2025"]).map((y: string) => (
                <option key={y} value={y}>Année {y}</option>
              ))}
            </select>
          </div>
          <Button 
            variant="outline" 
            onClick={handleExportExcel}
            disabled={isExporting}
            className="rounded-xl font-bold border-slate-200 shadow-sm hover:bg-slate-50 gap-2 text-slate-800"
          >
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4 text-primary" />}
            Exporter le rapport
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-chart-3/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-chart-3" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{data?.globalAverage || 0}</p>
                  <p className="text-sm text-muted-foreground">Moyenne générale</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{data?.attendanceRate || 0}%</p>
                  <p className="text-sm text-muted-foreground">Taux de présence</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-chart-1/10 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-chart-1" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{data?.successRate || 0}%</p>
                  <p className="text-sm text-muted-foreground">Taux de réussite</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-chart-2/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-chart-2" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{data?.totalStudents || 0}</p>
                  <p className="text-sm text-muted-foreground">Élèves inscrits</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Evolution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Évolution des performances</CardTitle>
              <CardDescription>Moyenne générale vs objectif</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  average: { label: "Moyenne", color: "hsl(var(--chart-1))" },
                  target: { label: "Objectif", color: "hsl(var(--chart-2))" },
                }}
                className="h-[300px] w-full"
              >
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis domain={[0, 20]} className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="average"
                    stroke="var(--color-average)"
                    fill="var(--color-average)"
                    fillOpacity={0.2}
                    name="Moyenne"
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="var(--color-target)"
                    strokeDasharray="5 5"
                    name="Objectif"
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Absences */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Suivi des absences</CardTitle>
              <CardDescription>Absences justifiées vs non justifiées (Réel)</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  justified: { label: "Justifiées", color: "hsl(var(--chart-3))" },
                  unjustified: { label: "Non justifiées", color: "hsl(var(--destructive))" },
                }}
                className="h-[300px] w-full"
              >
                <BarChart data={data?.absenceData || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="justified" fill="var(--color-justified)" name="Justifiées" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="unjustified" fill="var(--color-unjustified)" name="Non justifiées" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Subject Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance par matière</CardTitle>
              <CardDescription>Moyenne par discipline (Réel)</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  average: { label: "Moyenne", color: "hsl(var(--chart-1))" },
                }}
                className="h-[300px] w-full"
              >
                <BarChart data={data?.subjectAverages || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" domain={[0, 20]} className="text-xs" />
                  <YAxis dataKey="subject" type="category" className="text-xs" width={100} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="average" fill="var(--color-average)" name="Moyenne" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* KPI Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Résumé de l&apos;établissement</CardTitle>
              <CardDescription>Indicateurs clés de performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
               <div className="flex items-center justify-between p-4 rounded-xl bg-slate-100 dark:bg-slate-800/50">
                  <span className="font-medium">Total Élèves</span>
                  <span className="font-bold text-xl">{data?.totalStudents || 0}</span>
               </div>
               <div className="flex items-center justify-between p-4 rounded-xl bg-slate-100 dark:bg-slate-800/50">
                  <span className="font-medium">Moyenne Établissement</span>
                  <span className="font-bold text-xl text-primary">{data?.globalAverage || 0}/20</span>
               </div>
               <div className="flex items-center justify-between p-4 rounded-xl bg-slate-100 dark:bg-slate-800/50">
                  <span className="font-medium">Taux de Réussite</span>
                  <span className="font-bold text-xl text-emerald-600">{data?.successRate || 0}%</span>
               </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
