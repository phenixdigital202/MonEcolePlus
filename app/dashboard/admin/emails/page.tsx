"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Mail, 
  Send, 
  History, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  Settings,
  Sparkles,
  AlertTriangle,
  Play
} from "lucide-react"
import { toast } from "sonner"
import { getEmailHistory, retryFailedEmails, sendSimulatedEmail } from "@/lib/email-actions"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

const templates = [
  { id: "new_grade", name: "Nouvelle Note", desc: "Notification de note disponible" },
  { id: "new_absence", name: "Nouvelle Absence", desc: "Notification de demi-journée d'absence" },
  { id: "payment_received", name: "Paiement Reçu", desc: "Reçu de paiement de scolarité" },
  { id: "late_payment", name: "Paiement en Retard", desc: "Rappel de scolarité en retard" },
  { id: "report_card", name: "Bulletin Disponible", desc: "Publication du bulletin trimestriel" },
  { id: "admin_message", name: "Message Administratif", desc: "Note d'information globale" },
  { id: "meeting", name: "Invitation Réunion", desc: "Réunion parents-professeurs" },
  { id: "convocation", name: "Convocation", desc: "Entretien obligatoire direction" },
  { id: "new_enrollment", name: "Nouvelle Inscription", desc: "Confirmation d'affectation de classe" },
  { id: "forgot_password", name: "Mot de passe oublié", desc: "Lien de réinitialisation" },
  { id: "welcome", name: "Email de Bienvenue", desc: "Création de compte réussie" },
  { id: "verification", name: "Email de Vérification", desc: "Code de validation d'inscription" }
]

export default function EmailsAdminPage() {
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0].id)
  const [previewDoc, setPreviewDoc] = useState<any>(null)
  const [simulating, setSimulating] = useState(false)
  const [retrying, setRetrying] = useState(false)

  // Load history from database
  async function loadHistory() {
    setLoading(true)
    const res = await getEmailHistory()
    if (res.success && res.data) {
      setHistory(res.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadHistory()
  }, [])

  // Handle simulated send
  async function handleSimulate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSimulating(true)
    const formData = new FormData(e.currentTarget)
    const res = await sendSimulatedEmail(formData)
    if (res.success) {
      toast.success("Simulation d'envoi exécutée avec succès !")
      loadHistory()
    } else {
      toast.error(res.error || "Échec de l'envoi")
    }
    setSimulating(false)
  }

  // Handle retry dispatch
  async function handleRetryQueue() {
    setRetrying(true)
    const res = await retryFailedEmails()
    if (res.success) {
      toast.success(`${res.count} email(s) relancé(s) avec succès !`)
      loadHistory()
    } else {
      toast.error(res.error || "Erreur de relance")
    }
    setRetrying(false)
  }

  return (
    <>
      <DashboardHeader 
        title="Portail de Notifications Email" 
        subtitle="Configurez, testez et auditez tous les envois automatiques d'emails de l'établissement"
      />
      
      <main className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        
        {/* Core Settings / Simulation Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* Send Simulation */}
          <Card className="lg:col-span-1 border-none shadow-xl bg-white rounded-3xl overflow-hidden">
            <CardHeader className="bg-primary/5 border-b pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                <Play className="h-4.5 w-4.5 text-primary" />
                Simulateur d&apos;Envoi
              </CardTitle>
              <CardDescription className="text-xs">Déclenchez manuellement un email de démonstration</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSimulate} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Destinataire (Email)</label>
                  <Input 
                    type="email" 
                    name="to" 
                    placeholder="parent@exemple.com" 
                    required 
                    className="rounded-xl border-slate-200 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Modèle d&apos;Email</label>
                  <Select name="templateName" value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger className="rounded-xl border-slate-200 text-xs bg-white">
                      <SelectValue placeholder="Sélectionnez un modèle" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((tpl) => (
                        <SelectItem key={tpl.id} value={tpl.id} className="text-xs">
                          {tpl.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" disabled={simulating} className="w-full h-10 rounded-xl bg-primary text-white font-bold text-xs gap-2 mt-2">
                  <Send className="h-4 w-4" />
                  {simulating ? "Envoi..." : "Déclencher l'envoi"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Template Manager */}
          <Card className="lg:col-span-2 border-none shadow-xl bg-white rounded-3xl overflow-hidden">
            <CardHeader className="bg-primary/5 border-b pb-4 flex flex-row items-center justify-between flex-wrap gap-2">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                  <Settings className="h-4.5 w-4.5 text-primary" />
                  Gestionnaire de Modèles
                </CardTitle>
                <CardDescription className="text-xs">Aperçu en direct de l&apos;intégration des modèles</CardDescription>
              </div>
              <Badge className="bg-primary/10 text-primary border-none font-bold text-[10px] uppercase">
                {templates.length} modèles actifs
              </Badge>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-4 md:grid-cols-2">
                {templates.map((tpl) => (
                  <div key={tpl.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:shadow-md transition-all flex items-start justify-between gap-3 group">
                    <div>
                      <h4 className="font-bold text-xs text-slate-800">{tpl.name}</h4>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">{tpl.desc}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setPreviewDoc(tpl)}
                      className="h-8 w-8 text-primary hover:bg-primary/10 rounded-xl group-hover:scale-105 transition-transform"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* History Log Table */}
        <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b pb-4 flex flex-row items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-base font-bold text-slate-800">Journal des Envois / Outbox</CardTitle>
                <CardDescription className="text-xs">Historique des notifications dispatchees</CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRetryQueue} 
                disabled={retrying}
                className="h-9 border-slate-200 hover:bg-primary/5 hover:text-primary rounded-xl font-bold text-xs gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${retrying ? 'animate-spin' : ''}`} />
                Relancer les échecs
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadHistory} 
                disabled={loading}
                className="h-9 border-slate-200 hover:bg-slate-50 rounded-xl font-bold text-xs"
              >
                Actualiser
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  <tr>
                    <th className="py-3.5 px-6">Destinataire</th>
                    <th className="py-3.5 px-6">Modèle / Sujet</th>
                    <th className="py-3.5 px-6">Statut</th>
                    <th className="py-3.5 px-6">Date d&apos;envoi</th>
                    <th className="py-3.5 px-6">Tentatives</th>
                    <th className="py-3.5 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                        Chargement de l&apos;historique...
                      </td>
                    </tr>
                  ) : history.length > 0 ? (
                    history.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-6 font-bold">{log.to}</td>
                        <td className="py-3.5 px-6">
                          <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/5 px-2 py-0.5 rounded-md mr-2">
                            {log.templateName}
                          </span>
                          <span className="text-slate-500 font-medium truncate max-w-[200px] inline-block align-middle">
                            {log.subject}
                          </span>
                        </td>
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-1.5">
                            {log.status === "sent" && <CheckCircle className="h-4 w-4 text-emerald-500" />}
                            {log.status === "failed" && <XCircle className="h-4 w-4 text-rose-500" />}
                            {log.status === "pending" && <Clock className="h-4 w-4 text-amber-500" />}
                            <span className={`text-[10px] font-black uppercase tracking-widest ${
                              log.status === "sent" ? "text-emerald-600" :
                              log.status === "failed" ? "text-rose-600" : "text-amber-600"
                            }`}>
                              {log.status}
                            </span>
                          </div>
                          {log.errorMessage && (
                            <p className="text-[9px] text-rose-500/80 font-medium mt-0.5 max-w-[200px] truncate">
                              {log.errorMessage}
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 px-6 text-slate-400 font-medium">
                          {new Date(log.sentAt).toLocaleString("fr")}
                        </td>
                        <td className="py-3.5 px-6 font-mono text-slate-500">{log.retryCount} / 3</td>
                        <td className="py-3.5 px-6 text-center">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-primary hover:bg-primary/10 rounded-xl"
                            onClick={() => setPreviewDoc({ name: log.subject, html: log.body })}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                        Aucun email envoyé pour le moment.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Preview Dialog */}
      <Dialog open={!!previewDoc} onOpenChange={(open) => !open && setPreviewDoc(null)}>
        <DialogContent className="sm:max-w-xl rounded-3xl p-6 overflow-hidden flex flex-col h-[85vh]">
          {previewDoc && (
            <div className="flex flex-col h-full space-y-4">
              <DialogHeader>
                <DialogTitle className="text-base font-bold text-slate-800">{previewDoc.name}</DialogTitle>
              </DialogHeader>
              <div className="flex-1 rounded-2xl border bg-slate-50 overflow-hidden relative">
                {previewDoc.html ? (
                  <iframe 
                    srcDoc={previewDoc.html}
                    className="absolute inset-0 w-full h-full border-none"
                    title="Email Preview"
                  />
                ) : (
                  <div className="p-8 text-center text-slate-400 space-y-2 mt-20">
                    <Mail className="h-12 w-12 mx-auto text-slate-300" />
                    <p className="font-bold">Aperçu indisponible</p>
                    <p className="text-xs">Modèle : {previewDoc.id}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end pt-2">
                <Button onClick={() => setPreviewDoc(null)} className="rounded-xl text-xs font-bold bg-primary text-white">
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
