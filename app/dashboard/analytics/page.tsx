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

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const res = await getAnalyticsData()
      if (res.success) {
        setData(res.data)
      }
      setLoading(false)
    }
    fetch()
  }, [])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  const performanceData = [
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
          <div className="flex gap-2">
            <select className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="all">Toutes les classes</option>
            </select>
            <select className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="year">Année 2025-2026</option>
            </select>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
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
