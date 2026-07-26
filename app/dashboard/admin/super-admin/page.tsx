"use server"

import { DashboardHeader } from "@/components/dashboard/header"
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
  
  if (userRole !== "admin") {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Accès réservé à Phénix Digital CI</p>
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
    { label: "Écoles actives", value: stats.totalEcoles.toString(), icon: Building2, color: "text-primary", bg: "bg-primary/10" },
    { label: "Utilisateurs", value: stats.totalUsers.toLocaleString("fr"), icon: Users, color: "text-chart-3", bg: "bg-chart-3/10" },
    { label: "Élèves", value: stats.totalStudents.toLocaleString("fr"), icon: GraduationCap, color: "text-chart-4", bg: "bg-chart-4/10" },
    { label: "Paiements", value: stats.totalPaiements.toLocaleString("fr"), icon: CreditCard, color: "text-emerald-600", bg: "bg-emerald-100" },
    { label: "Stockage", value: stats.storageUsed, icon: HardDrive, color: "text-violet-600", bg: "bg-violet-100" },
    { label: "Uptime", value: stats.uptime, icon: Activity, color: "text-chart-3", bg: "bg-chart-3/10" },
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
    <>
      <DashboardHeader 
        title="Super Administration SaaS" 
        subtitle="Espace réservé à Phénix Digital CI — Gestion globale de la plateforme"
      />
      
      <main className="p-6 space-y-8">
        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {statCards.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Plans Tarifaires */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Crown className="h-5 w-5 text-chart-4" />
                Plans Tarifaires
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {plans.map((plan: any) => (
                <div key={plan.id} className="flex items-center justify-between p-4 rounded-xl border bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="font-semibold text-foreground">{plan.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {plan.maxStudents === -1 ? "Illimité" : `${plan.maxStudents} élèves`} · {plan.maxTeachers === -1 ? "Illimité" : `${plan.maxTeachers} enseignants`}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {plan.features.slice(0, 3).map((f: string) => (
                        <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{f}</span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-foreground">{plan.price.toLocaleString("fr")} <span className="text-xs text-muted-foreground">{plan.currency}/{plan.period}</span></p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${plan.active ? "bg-chart-3/10 text-chart-3" : "bg-destructive/10 text-destructive"}`}>
                      {plan.active ? "Actif" : "Inactif"}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Tickets de Support */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TicketCheck className="h-5 w-5 text-primary" />
                Tickets de Support
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tickets.map((ticket: any) => (
                <div key={ticket.id} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    ticket.statut === "ouvert" ? "bg-destructive/10" : 
                    ticket.statut === "en_cours" ? "bg-chart-4/10" : "bg-chart-3/10"
                  }`}>
                    {ticket.statut === "ouvert" ? <XCircle className="h-4 w-4 text-destructive" /> :
                     ticket.statut === "en_cours" ? <Clock className="h-4 w-4 text-chart-4" /> :
                     <CheckCircle2 className="h-4 w-4 text-chart-3" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{ticket.sujet}</p>
                    <p className="text-xs text-muted-foreground">{ticket.ecole} · {ticket.date}</p>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${
                    ticket.priorite === "haute" ? "bg-destructive/10 text-destructive" :
                    ticket.priorite === "moyenne" ? "bg-chart-4/10 text-chart-4" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {ticket.priorite}
                  </span>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-2" size="sm">
                Voir tous les tickets
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Modules Activation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5 text-chart-4" />
              Activation / Désactivation des Modules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {modules.map((mod) => (
                <div key={mod.id} className="flex items-center justify-between p-3 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${mod.enabled ? "bg-chart-3/10" : "bg-muted"}`}>
                      {mod.enabled ? <CheckCircle2 className="h-4 w-4 text-chart-3" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    <span className="font-medium text-sm text-foreground">{mod.name}</span>
                  </div>
                  <Button variant={mod.enabled ? "outline" : "default"} size="sm">
                    {mod.enabled ? "Désactiver" : "Activer"}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monitoring */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="h-14 w-14 rounded-2xl bg-chart-3/10 flex items-center justify-center mx-auto mb-3">
                <Server className="h-7 w-7 text-chart-3" />
              </div>
              <h3 className="font-semibold text-foreground text-lg">Serveur</h3>
              <p className="text-sm text-muted-foreground mt-1">Vercel Edge · Supabase PostgreSQL</p>
              <div className="mt-3 flex items-center justify-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-chart-3 animate-pulse" />
                <span className="text-xs font-bold text-chart-3">Opérationnel</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Shield className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-lg">Sécurité</h3>
              <p className="text-sm text-muted-foreground mt-1">RBAC · XSS · CSRF · Headers sécurisés</p>
              <div className="mt-3 flex items-center justify-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-chart-3 animate-pulse" />
                <span className="text-xs font-bold text-chart-3">Conforme</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="h-14 w-14 rounded-2xl bg-chart-4/10 flex items-center justify-center mx-auto mb-3">
                <Zap className="h-7 w-7 text-chart-4" />
              </div>
              <h3 className="font-semibold text-foreground text-lg">Performance</h3>
              <p className="text-sm text-muted-foreground mt-1">Turbopack · Edge Functions · Cache</p>
              <div className="mt-3 flex items-center justify-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-chart-3 animate-pulse" />
                <span className="text-xs font-bold text-chart-3">&lt; 1s chargement</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
