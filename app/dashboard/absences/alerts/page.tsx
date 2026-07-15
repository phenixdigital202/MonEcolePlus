import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, CheckCircle, AlertTriangle } from "lucide-react"
import { getPrisma, getCurrentTenant } from "@/lib/tenant-context"
import { AlertConfigCard } from "./alert-config-card"

export default async function AbsencesAlertsPage() {
  const prisma = await getPrisma()
  const school = await getCurrentTenant()
  
  // Get critical absences (unjustified)
  const criticalAbsences = await prisma.absence.findMany({
    where: { statut: 'non_justifie' },
    include: {
      users: {
        include: {
          inscriptions: {
            include: {
              classe: true
            }
          }
        }
      }
    },
    orderBy: { date_absence: 'desc' },
    take: 10
  })

  return (
    <>
      <DashboardHeader 
        title="Alertes Automatiques" 
        subtitle="Notifications envoyées automatiquement aux parents en cas d'absence"
      />
      <main className="p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Dernières alertes critiques (Non justifiées)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {criticalAbsences.map((abs, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{abs.users.nom}</p>
                        <p className="text-xs text-muted-foreground">
                          {abs.users.inscriptions[0]?.classe.nom || "N/A"} • SMS + Email envoyé
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-foreground">
                        {new Date(abs.date_absence).toLocaleDateString('fr-FR')}
                      </p>
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-500 font-medium">
                        <CheckCircle className="h-3 w-3" />
                        Délivré
                      </span>
                    </div>
                  </div>
                ))}
                {criticalAbsences.length === 0 && (
                  <div className="text-center py-10">
                    <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
                    <p className="text-slate-400">Aucune alerte critique en cours.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <AlertConfigCard 
            initialSmsEnabled={school?.sms_alerts_enabled ?? true}
            initialEmailEnabled={school?.email_alerts_enabled ?? true}
          />
        </div>
      </main>
    </>
  )
}
