"use client"

import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  Users, 
  GraduationCap, 
  School, 
  Settings, 
  Bell, 
  PieChart as PieChartIcon,
  TrendingUp,
  ShieldCheck,
  FileText,
  CreditCard
} from "lucide-react"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid
} from "recharts"

const schoolStats = [
  { label: "Total Éleves", value: "1,240", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
  { label: "Enseignants", value: "85", icon: GraduationCap, color: "text-purple-500", bg: "bg-purple-500/10" },
  { label: "Classes", value: "48", icon: School, color: "text-indigo-500", bg: "bg-indigo-500/10" },
  { label: "Taux de présence", value: "92%", icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" },
]

const financialData = [
  { month: "Jan", revenue: 45000 },
  { month: "Feb", revenue: 52000 },
  { month: "Mar", revenue: 48000 },
  { month: "Apr", revenue: 61000 },
  { month: "May", revenue: 55000 },
  { month: "Jun", revenue: 67000 },
]

export default function AdminDashboardPage() {
  return (
    <div className="flex-1 overflow-y-auto min-w-0">
      <DashboardHeader 
        title="Tableau de Bord Administrateur" 
        subtitle="Vue d'ensemble de votre établissement"
      />
      
      <main className="p-4 md:p-8 space-y-4 md:space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {schoolStats.map((stat) => (
            <Card key={stat.label} className="border-none shadow-sm bg-card/50 backdrop-blur-md">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bg}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
          {/* Revenue Chart */}
          <Card className="md:col-span-4 border-none shadow-sm bg-card/50 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-lg">Revenus Mensuels</CardTitle>
              <CardDescription>Aperçu des paiements de scolarité</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={financialData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                      tickFormatter={(value) => `${value / 1000}k`}
                    />
                    <Tooltip 
                      cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-background border border-border p-2 rounded-lg shadow-lg">
                              <p className="font-bold text-sm text-foreground">{`${payload[0].value} €`}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar 
                      dataKey="revenue" 
                      fill="hsl(var(--primary))" 
                      radius={[6, 6, 0, 0]}
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Notifications / Tasks */}
          <Card className="md:col-span-3 border-none shadow-sm bg-card/50 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-lg">Actions Requises</CardTitle>
              <CardDescription>Tâches administratives en attente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { title: "Préparer bulletins T3", time: "2 jours restants", icon: FileText, color: "text-amber-500" },
                { title: "Validation inscriptions", time: "15 dossiers", icon: ShieldCheck, color: "text-blue-500" },
                { title: "Point facturation", time: "À faire aujourd'hui", icon: CreditCard, color: "text-emerald-500" },
                { title: "Config. nouvelle année", time: "Optionnel", icon: Settings, color: "text-slate-500" },
              ].map((task, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className={`p-2 rounded-lg bg-background shadow-sm border border-border`}>
                    <task.icon className={`h-4 w-4 ${task.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    <p className="text-xs text-muted-foreground">{task.time}</p>
                  </div>
                  <Bell className="h-4 w-4 text-muted-foreground/30" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
