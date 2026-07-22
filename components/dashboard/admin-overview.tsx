"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import dynamic from 'next/dynamic'

const AdminEnrollmentChart = dynamic(() => import('./admin-overview-charts').then(m => m.AdminEnrollmentChart), { ssr: false })
const AdminFinanceChart = dynamic(() => import('./admin-overview-charts').then(m => m.AdminFinanceChart), { ssr: false })
const AdminClassPieChart = dynamic(() => import('./admin-overview-charts').then(m => m.AdminClassPieChart), { ssr: false })
import { 
  Users, 
  TrendingUp, 
  CreditCard, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Sparkles
} from "lucide-react"

import { ManagementShortcuts } from "@/components/dashboard/management-shortcuts"

const inscriptionData = [
  { name: 'Jan', students: 45 },
  { name: 'Fév', students: 52 },
  { name: 'Mar', students: 48 },
  { name: 'Avr', students: 61 },
  { name: 'Mai', students: 55 },
  { name: 'Juin', students: 67 },
]

const financeData = [
  { name: 'Lun', revenue: 120000, target: 150000 },
  { name: 'Mar', revenue: 190000, target: 150000 },
  { name: 'Mer', revenue: 150000, target: 150000 },
  { name: 'Jeu', revenue: 210000, target: 150000 },
  { name: 'Ven', revenue: 180000, target: 150000 },
]

const classData = [
  { name: 'Primaire', value: 45, color: '#3b82f6' },
  { name: 'Collège', value: 30, color: '#8b5cf6' },
  { name: 'Lycée', value: 25, color: '#ec4899' },
]

interface AdminOverviewProps {
  stats: {
    students: number
    teachers: number
    classes: number
    revenue: string
  }
  shortcutData: any
  adminId: number
  chartData?: {
    finance: any[] | null
    insights: any[] | null
  }
}

export function AdminOverview({ stats, shortcutData, adminId, chartData }: AdminOverviewProps) {
  // Use real data if available, otherwise fallback to mock for demonstration
  const displayFinanceData = chartData?.finance || financeData
  const displayInsights = chartData?.insights?.map(ins => ({
    title: ins.type,
    msg: ins.message,
    color: ins.type.includes("financière") ? "bg-amber-500/20" : "bg-emerald-500/20"
  })) || [
    { title: "Détection précoce du décrochage", msg: "Le taux d'absence en 2nde C a augmenté de 15% cette semaine. Intervention recommandée.", color: "bg-rose-500/20" },
    { title: "Optimisation des ressources", msg: "Vos professeurs de langue sont sous-utilisés (charge 65%). Envisagez de nouveaux clubs.", color: "bg-emerald-500/20" },
    { title: "Prévision financière", msg: "Les tendances actuelles prévoient un surplus budgétaire de 5% pour le trimestre prochain.", color: "bg-amber-500/20" }
  ]

  return (
    <div className="space-y-4 md:space-y-8 animate-in fade-in duration-700">
      {/* Management Shortcuts Section */}
      <ManagementShortcuts data={shortcutData || { classes: [], teachers: [], students: [] }} adminId={adminId} />

      {/* Top Stats - Modern Glass Card Grid */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Effectif Total", value: stats.students, icon: Users, color: "blue", trend: "+12%" },
          { label: "Corps Enseignant", value: stats.teachers, icon: Sparkles, color: "purple", trend: "+3" },
          { label: "Classes Actives", value: stats.classes, icon: Activity, color: "emerald", trend: "Stable" },
          { label: "Revenus (Mensuel)", value: stats.revenue, icon: CreditCard, color: "amber", trend: "+15.2%" },
        ].map((item, i) => (
          <Card key={i} className="group relative overflow-hidden border-none bg-white/40 backdrop-blur-md shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className={`absolute top-0 right-0 -mr-4 -mt-4 h-24 w-24 rounded-full bg-${item.color}-500/10 blur-2xl group-hover:bg-${item.color}-500/20 transition-colors`} />
            <CardContent className="p-4 md:p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div className={`h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-${item.color}-500/10 flex items-center justify-center`}>
                  <item.icon className={`h-5 w-5 md:h-6 md:w-6 text-${item.color}-600`} />
                </div>
                <div className="flex items-center gap-1 text-[10px] md:text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 md:py-1 rounded-full">
                   <ArrowUpRight className="h-3 w-3" />
                   {item.trend}
                </div>
              </div>
              <div className="mt-3 md:mt-4">
                <p className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">{item.value}</p>
                <p className="text-[10px] font-bold uppercase text-slate-500 tracking-widest mt-1">{item.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
        {/* Enrollment Growth Chart */}
        <Card className="border-none shadow-xl bg-white/60 backdrop-blur-sm overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
               <div>
                  <CardTitle className="text-base md:text-lg font-bold flex items-center gap-2">
                     <TrendingUp className="h-5 w-5 text-blue-500" />
                     Croissance des Effectifs
                  </CardTitle>
                  <CardDescription className="text-xs">Nouveaux élèves inscrits par mois</CardDescription>
               </div>
               <div className="text-right">
                  <span className="text-xl md:text-2xl font-black text-blue-600">+24%</span>
                  <p className="text-[10px] uppercase font-bold text-slate-400 mt-1">Vs l&apos;an dernier</p>
               </div>
            </div>
          </CardHeader>
          <CardContent className="h-[250px] md:h-[300px] pt-4 px-1 md:px-6">
              <AdminEnrollmentChart data={inscriptionData} />
          </CardContent>
        </Card>

        {/* Financial Performance Chart */}
        <Card className="border-none shadow-xl bg-white/60 backdrop-blur-sm overflow-hidden">
          <CardHeader className="pb-2">
             <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base md:text-lg font-bold flex items-center gap-2">
                     <CreditCard className="h-5 w-5 text-purple-500" />
                     Performance Financière
                  </CardTitle>
                  <CardDescription className="text-xs">Recouvrement des frais de scolarité</CardDescription>
                </div>
                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                   <Target className="h-5 w-5 text-slate-400" />
                </div>
             </div>
          </CardHeader>
          <CardContent className="h-[250px] md:h-[300px] pt-4 px-1 md:px-6">
              <AdminFinanceChart data={displayFinanceData} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
         {/* Class Distribution Pie Chart */}
         <Card className="lg:col-span-1 border-none shadow-xl bg-white/60 backdrop-blur-sm">
            <CardHeader>
               <CardTitle className="text-lg font-bold">Répartition Effectifs</CardTitle>
               <CardDescription className="text-xs">Par cycle d&apos;enseignement</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px]">
               <AdminClassPieChart data={classData} />
               <div className="flex justify-center gap-4 mt-2">
                  {classData.map((item, i) => (
                     <div key={i} className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-[10px] font-bold uppercase text-slate-500">{item.name}</span>
                     </div>
                  ))}
               </div>
            </CardContent>
         </Card>

         {/* AI Insights Card (Enhanced) */}
         <Card className="lg:col-span-2 relative border-none shadow-2xl bg-gradient-to-br from-primary to-indigo-700 text-white overflow-hidden group">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-white/10 blur-3xl group-hover:scale-125 transition-transform duration-1000" />
            <CardHeader>
               <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                     <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                     <CardTitle className="text-lg">Analyses de l&apos;IA</CardTitle>
                     <CardDescription className="text-blue-100/70">Conseils stratégiques pour votre établissement</CardDescription>
                  </div>
               </div>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4 p-4 md:p-6">
               {displayInsights.map((insight, i) => (
                  <div key={i} className={`p-3 md:p-4 rounded-2xl ${insight.color} backdrop-blur-md border border-white/10 hover:bg-white/25 transition-colors cursor-default`}>
                     <p className="font-bold text-xs md:text-sm mb-1 uppercase tracking-wider">{insight.title}</p>
                     <p className="text-[11px] md:text-xs text-blue-50/80 leading-relaxed">{insight.msg}</p>
                  </div>
               ))}
            </CardContent>
         </Card>
      </div>
    </div>
  )
}
