"use server"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Building2, 
  Users, 
  GraduationCap, 
  CreditCard,
  Server,
  Shield,
  TicketCheck,
  Settings,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Zap,
  HardDrive,
  Activity,
  Crown
} from "lucide-react"
import { getSaasStats, getTarifPlans, getTickets } from "@/lib/saas-admin-actions"
import { cookies } from "next/headers"

export default async function SuperAdminPage() {
  const cookieStore = await cookies()
  const userRole = cookieStore.get("user_role")?.value
  
  if (userRole !== "super_admin") {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-center space-y-4">
        <Shield className="h-16 w-16 text-destructive animate-pulse" />
        <h1 className="text-2xl font-black text-white">Accès Refusé (403 Forbidden)</h1>
        <p className="text-[#a1a1aa] max-w-md">Cet espace est réservé exclusivement à la direction de Phénix Digital CI.</p>
        <Button variant="destructive" asChild>
          <a href="/dashboard">Retour au Dashboard Établissement</a>
        </Button>
      </div>
    )
  }

  const [statsRes, plansRes, ticketsRes] = await Promise.all([
    getSaasStats(),
    getTarifPlans(),
    getTickets(),
  ])

  const stats = statsRes.data
  const plans = plansRes.data
  const tickets = ticketsRes.data

  const statCards = [
    { label: "Écoles actives", value: stats.totalEcoles.toString(), icon: Building2, color: "text-[#6366f1]", bg: "bg-[#6366f1]/10" },
    { label: "MRR", value: stats.mrr, icon: CreditCard, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "ARR Estime", value: stats.arr, icon: TrendingUp, color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "Taux de Churn", value: stats.churn, icon: XCircle, color: "text-rose-400", bg: "bg-rose-500/10" },
    { label: "Stockage", value: stats.storageUsed, icon: HardDrive, color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "Uptime", value: stats.uptime, icon: Activity, color: "text-rose-400", bg: "bg-rose-500/10" },
  ]

  const modules = [
    { id: "notes", name: "Gestion des Notes", enabled: true },
    { id: "absences", name: "Suivi des Absences", enabled: true },
    { id: "paiements", name: "Paiements Mobile Money", enabled: true },
    { id: "compta", name: "Comptabilité ERP", enabled: true },
    { id: "messages", name: "Messagerie Interne", enabled: true },
    { id: "ia", name: "Insights IA", enabled: true },
    { id: "bibliotheque", name: "Bibliothèque Numérique", enabled: true },
    { id: "examens", name: "Gestion des Examens", enabled: true },
    { id: "whatsapp", name: "Notifications WhatsApp", enabled: false },
    { id: "sms", name: "Notifications SMS", enabled: false },
  ]

  return (
    <div className="p-8 space-y-8 bg-[#09090b] text-[#f4f4f5] min-h-screen">
      <div className="flex flex-col gap-1.5 border-b border-[#27272a] pb-6">
        <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
          Super Administration SaaS
        </h1>
        <p className="text-[#a1a1aa] text-sm">Gestion globale et monitoring en temps réel de MonÉcole+.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {statCards.map((stat) => (
          <Card key={stat.label} className="border-[#27272a] bg-[#18181b] text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xl font-black text-white">{stat.value}</p>
                  <p className="text-[10px] uppercase font-bold text-[#a1a1aa]">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Plans Tarifaires */}
        <Card className="border-[#27272a] bg-[#18181b] text-white">
          <CardHeader className="border-b border-[#27272a] pb-4">
            <CardTitle className="text-lg flex items-center gap-2 font-bold text-white">
              <Crown className="h-5 w-5 text-indigo-400" />
              Plans Tarifaires
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {plans.map((plan: any) => (
              <div key={plan.id} className="flex items-center justify-between p-4 rounded-xl border border-[#27272a] bg-[#09090b] hover:bg-[#18181b] transition-colors">
                <div>
                  <p className="font-bold text-white">{plan.name}</p>
                  <p className="text-xs text-[#a1a1aa]">
                    {plan.maxStudents === -1 ? "Illimité" : `${plan.maxStudents} élèves`} · {plan.maxTeachers === -1 ? "Illimité" : `${plan.maxTeachers} enseignants`}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {plan.features.slice(0, 3).map((f: string) => (
                      <span key={f} className="text-[9px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-bold">{f}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-white">{plan.price.toLocaleString("fr")} <span className="text-[10px] text-[#a1a1aa]">{plan.currency}/{plan.period}</span></p>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${plan.active ? "bg-emerald-500/10 text-emerald-400" : "bg-destructive/10 text-destructive"}`}>
                    {plan.active ? "Actif" : "Inactif"}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Tickets de Support */}
        <Card className="border-[#27272a] bg-[#18181b] text-white">
          <CardHeader className="border-b border-[#27272a] pb-4">
            <CardTitle className="text-lg flex items-center gap-2 font-bold text-white">
              <TicketCheck className="h-5 w-5 text-purple-400" />
              Tickets de Support
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {tickets.map((ticket: any) => (
              <div key={ticket.id} className="flex items-start gap-3 p-3 rounded-lg border border-[#27272a] bg-[#09090b] hover:bg-[#18181b] transition-colors">
                <div className={`h-8 w-8 rounded flex items-center justify-center flex-shrink-0 ${
                  ticket.statut === "ouvert" ? "bg-red-500/10" : 
                  ticket.statut === "en_cours" ? "bg-amber-500/10" : "bg-emerald-500/10"
                }`}>
                  {ticket.statut === "ouvert" ? <XCircle className="h-4 w-4 text-red-400" /> :
                   ticket.statut === "en_cours" ? <Clock className="h-4 w-4 text-amber-400" /> :
                   <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-white truncate">{ticket.sujet}</p>
                  <p className="text-xs text-[#a1a1aa]">{ticket.ecole} · {ticket.date}</p>
                </div>
                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                  ticket.priorite === "haute" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                  ticket.priorite === "moyenne" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {ticket.priorite}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Modules Activation */}
      <Card className="border-[#27272a] bg-[#18181b] text-white">
        <CardHeader className="border-b border-[#27272a] pb-4">
          <CardTitle className="text-lg flex items-center gap-2 font-bold text-white">
            <Settings className="h-5 w-5 text-amber-400" />
            Activation / Désactivation des Modules
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {modules.map((mod) => (
              <div key={mod.id} className="flex items-center justify-between p-3 rounded-xl border border-[#27272a] bg-[#09090b] hover:bg-[#18181b] transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded flex items-center justify-center ${mod.enabled ? "bg-emerald-500/10" : "bg-neutral-800"}`}>
                    {mod.enabled ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <XCircle className="h-4 w-4 text-neutral-500" />}
                  </div>
                  <span className="font-bold text-xs text-white">{mod.name}</span>
                </div>
                <Button variant={mod.enabled ? "destructive" : "default"} size="sm" className="h-8 text-xs font-bold">
                  {mod.enabled ? "Désactiver" : "Activer"}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monitoring */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-[#27272a] bg-[#18181b] text-white text-center">
          <CardContent className="p-6">
            <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-3">
              <Server className="h-7 w-7 text-indigo-400" />
            </div>
            <h3 className="font-bold text-white text-lg">Serveur</h3>
            <p className="text-xs text-[#a1a1aa] mt-1">Vercel Edge · Supabase PostgreSQL</p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-emerald-400">Opérationnel</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#27272a] bg-[#18181b] text-white text-center">
          <CardContent className="p-6">
            <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
              <Shield className="h-7 w-7 text-emerald-400" />
            </div>
            <h3 className="font-bold text-white text-lg">Sécurité</h3>
            <p className="text-xs text-[#a1a1aa] mt-1">RBAC · XSS · CSRF · Headers sécurisés</p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-emerald-400">Conforme</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#27272a] bg-[#18181b] text-white text-center">
          <CardContent className="p-6">
            <div className="h-14 w-14 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto mb-3">
              <Zap className="h-7 w-7 text-rose-400" />
            </div>
            <h3 className="font-bold text-white text-lg">Performance</h3>
            <p className="text-xs text-[#a1a1aa] mt-1">Turbopack · Edge Functions · Cache</p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-emerald-400">&lt; 1s chargement</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
