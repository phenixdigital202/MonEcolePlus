"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  MessageSquare, 
  Send, 
  History, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  AlertTriangle,
  Play,
  TrendingUp,
  Sliders,
  PhoneCall
} from "lucide-react"
import { toast } from "sonner"
import { getWhatsAppHistory, getWhatsAppStats, retryFailedWhatsAppMessages, sendSimulatedWhatsApp } from "@/lib/whatsapp-actions"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

const templates = [
  { id: "absence", name: "Absence", desc: "Notification de signalement d'absence", defaultMsg: "🔴 *MonÉcole+ | Notification d'Absence*\n\nBonjour, nous vous informons que l'élève *Abou Traoré* a été signalé absent le *25 Octobre 2026*.\n\nMerci de contacter l'administration de l'établissement au plus vite pour justifier cette absence." },
  { id: "retard", name: "Retard", desc: "Alerte ponctualité retard de cours", defaultMsg: "⚠️ *MonÉcole+ | Notification de Retard*\n\nBonjour, l'élève *Abou Traoré* a été signalé en retard de *15 minutes* le *25 Octobre 2026*.\n\nLa ponctualité est essentielle pour le bon déroulement des cours." },
  { id: "new_grade", name: "Nouvelle Note", desc: "Notification de note disponible", defaultMsg: "📝 *MonÉcole+ | Nouvelle Note*\n\nUne nouvelle note a été saisie pour *Abou Traoré* en *Mathématiques* :\n👉 *17.5 / 20*\n\nConnectez-vous pour consulter le détail de l'évaluation." },
  { id: "report_card", name: "Bulletin Disponible", desc: "Publication du bulletin trimestriel", defaultMsg: "📊 *MonÉcole+ | Bulletin Disponible*\n\nLe bulletin scolaire de *Abou Traoré* pour le *1er Trimestre* est disponible.\n👉 Moyenne générale : *16.20 / 20*\n\nLe PDF officiel est consultable depuis votre portail parent." },
  { id: "payment_received", name: "Paiement Validé", desc: "Reçu de paiement de scolarité", defaultMsg: "✅ *MonÉcole+ | Paiement Validé*\n\nNous confirmons la bonne réception de votre paiement de *150 000 CFA* pour : *Scolarité T1*.\nDate de validation : 25 Octobre 2026.\n\nMerci de votre confiance." },
  { id: "payment_due", name: "Échéance de Paiement", desc: "Rappel de scolarité en retard", defaultMsg: "🔔 *MonÉcole+ | Échéance de Paiement*\n\nRappel : Le règlement de *50 000 CFA* pour *Frais d'Examen* est attendu au plus tard le *30 Novembre 2026*.\n\nMerci de régulariser afin d'éviter toute suspension de service." },
  { id: "urgent_message", name: "Message Urgent", desc: "Alerte de sécurité ou fermeture", defaultMsg: "🚨 *MonÉcole+ | MESSAGE URGENT*\n\n*Alerte Météo*\n\nLes cours de l'après-midi sont suspendus en raison des intempéries. Sécurité maximale demandée." },
  { id: "meeting", name: "Invitation Réunion", desc: "Réunion parents-professeurs", defaultMsg: "📅 *MonÉcole+ | Invitation Réunion*\n\nVous êtes invité à la réunion :\n*Conseil de Classe Extraordinaire*\n\n🗓️ Date : *4 Novembre 2026 à 15h30*\n📍 Lieu : *Salle de conférence*\n\nVotre présence est vivement souhaitée." },
  { id: "announcement", name: "Nouvelle Annonce", desc: "Note d'information globale", defaultMsg: "📢 *MonÉcole+ | Nouvelle Annonce*\n\nUne nouvelle annonce importante est disponible :\n*Lancement du Club Robotique* (26 Octobre 2026)\n\nConsultez les détails sur la plateforme MonÉcole+." },
  { id: "support_ticket", name: "Support Ticket", desc: "Mise à jour ticket de support", defaultMsg: "🛠️ *MonÉcole+ | Support Technique*\n\nLe statut de votre ticket de support *#982* a été mis à jour.\n👉 Nouveau statut : *Résolu et Clôturé*\n\nMerci de consulter votre messagerie de support." }
]

export default function WhatsAppAdminPage() {
  const [history, setHistory] = useState<any[]>([])
  const [stats, setStats] = useState<any>({
    sentCount: 0,
    failedCount: 0,
    pendingCount: 0,
    totalCount: 0,
    deliveryRate: 100
  })
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0].id)
  const [customMsg, setCustomMsg] = useState(templates[0].defaultMsg)
  const [previewMsg, setPreviewMsg] = useState<any>(null)
  const [simulating, setSimulating] = useState(false)
  const [retrying, setRetrying] = useState(false)

  // Load history and stats from database
  async function loadData() {
    setLoading(true)
    const [historyRes, statsRes] = await Promise.all([
      getWhatsAppHistory(),
      getWhatsAppStats()
    ])
    if (historyRes.success && historyRes.data) {
      setHistory(historyRes.data)
    }
    if (statsRes.success && statsRes.data) {
      setStats(statsRes.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  // Sync default msg when template changes
  const handleTemplateChange = (val: string) => {
    setSelectedTemplate(val)
    const tpl = templates.find(t => t.id === val)
    if (tpl) {
      setCustomMsg(tpl.defaultMsg)
    }
  }

  // Handle simulated send
  async function handleSimulate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSimulating(true)
    const formData = new FormData(e.currentTarget)
    const res = await sendSimulatedWhatsApp(formData)
    if (res.success) {
      toast.success("Message WhatsApp simulé avec succès !")
      loadData()
    } else {
      toast.error(res.error || "Échec de l'envoi")
    }
    setSimulating(false)
  }

  // Handle retry dispatch
  async function handleRetryQueue() {
    setRetrying(true)
    const res = await retryFailedWhatsAppMessages()
    if (res.success) {
      toast.success(`${res.count} message(s) relancé(s) avec succès !`)
      loadData()
    } else {
      toast.error(res.error || "Erreur de relance")
    }
    setRetrying(false)
  }

  return (
    <>
      <DashboardHeader 
        title="Moteur de Notifications WhatsApp" 
        subtitle="Pilotez et configurez l'envoi de messages instantanés et d'alertes par WhatsApp"
      />
      
      <main className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        
        {/* Statistics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { name: "Total Messages", value: stats.totalCount, icon: MessageSquare, gradient: "from-blue-600 to-indigo-600" },
            { name: "Délivrés", value: stats.sentCount, icon: CheckCircle, gradient: "from-emerald-500 to-teal-600" },
            { name: "Échecs", value: stats.failedCount, icon: XCircle, gradient: "from-rose-500 to-red-600" },
            { name: "Taux de Délivrance", value: `${stats.deliveryRate}%`, icon: TrendingUp, gradient: "from-amber-500 to-orange-600" },
          ].map((stat, i) => (
            <Card key={i} className={`group relative overflow-hidden border-none bg-gradient-to-br ${stat.gradient} text-white shadow-xl hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 rounded-3xl`}>
              <div className="absolute top-0 right-0 -mr-6 -mt-6 h-24 w-24 rounded-full bg-white/10 blur-xl transition-all group-hover:scale-125" />
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="h-11 w-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <stat.icon className="h-5.5 w-5.5 text-white" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-black tracking-tight">{stat.value}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/85 mt-1">{stat.name}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* Send Simulator */}
          <Card className="lg:col-span-1 border-none shadow-xl bg-white rounded-3xl overflow-hidden">
            <CardHeader className="bg-primary/5 border-b pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                <Play className="h-4.5 w-4.5 text-primary" />
                Console de Simulation
              </CardTitle>
              <CardDescription className="text-xs">Envoyer un message de test personnalisé</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSimulate} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Téléphone (Format international)</label>
                  <Input 
                    type="text" 
                    name="to" 
                    placeholder="e.g. +2250700000000" 
                    required 
                    className="rounded-xl border-slate-200 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Déclencheur / Modèle</label>
                  <Select name="templateName" value={selectedTemplate} onValueChange={handleTemplateChange}>
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

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase flex justify-between">
                    <span>Message personnalisé</span>
                    <span className="text-[10px] text-slate-400 font-medium lowercase">Prend le pas sur le template</span>
                  </label>
                  <Textarea 
                    name="customMessage" 
                    value={customMsg}
                    onChange={(e) => setCustomMsg(e.target.value)}
                    rows={6}
                    placeholder="Éditez le contenu ici..." 
                    className="rounded-xl border-slate-200 text-xs font-mono"
                  />
                </div>

                <Button type="submit" disabled={simulating} className="w-full h-10 rounded-xl bg-emerald-600 text-white font-bold text-xs gap-2 mt-2 hover:bg-emerald-700">
                  <Send className="h-4 w-4" />
                  {simulating ? "Transmission..." : "Envoyer par WhatsApp"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Configuration Previewer */}
          <Card className="lg:col-span-2 border-none shadow-xl bg-white rounded-3xl overflow-hidden">
            <CardHeader className="bg-primary/5 border-b pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                <Sliders className="h-4.5 w-4.5 text-primary" />
                Aperçu et Structure de Message
              </CardTitle>
              <CardDescription className="text-xs">Sélectionnez et éditez la structure textuelle de vos messages</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {templates.map((tpl) => (
                  <div key={tpl.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:shadow-md transition-all flex items-start justify-between gap-3 group">
                    <div>
                      <h4 className="font-bold text-xs text-slate-800">{tpl.name}</h4>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">{tpl.desc}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setPreviewMsg(tpl)}
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
                <CardTitle className="text-base font-bold text-slate-800">Historique des Messages WhatsApp</CardTitle>
                <CardDescription className="text-xs">Journal des messages envoyés par le système</CardDescription>
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
                onClick={loadData} 
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
                    <th className="py-3.5 px-6">Déclencheur</th>
                    <th className="py-3.5 px-6">Message</th>
                    <th className="py-3.5 px-6">Statut</th>
                    <th className="py-3.5 px-6">Date</th>
                    <th className="py-3.5 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                        Chargement des messages...
                      </td>
                    </tr>
                  ) : history.length > 0 ? (
                    history.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-6 font-bold flex items-center gap-1.5">
                          <PhoneCall className="h-3 w-3 text-slate-400" />
                          {log.to.replace("whatsapp:", "")}
                        </td>
                        <td className="py-3.5 px-6">
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                            {log.templateName}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-slate-500 font-medium truncate max-w-[280px]">
                          {log.message}
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
                            <p className="text-[9px] text-rose-500/80 font-medium mt-0.5 max-w-[150px] truncate">
                              {log.errorMessage}
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 px-6 text-slate-400 font-medium">
                          {new Date(log.sentAt).toLocaleString("fr")}
                        </td>
                        <td className="py-3.5 px-6 text-center">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-primary hover:bg-primary/10 rounded-xl"
                            onClick={() => setPreviewMsg({ name: `Destinataire: ${log.to}`, defaultMsg: log.message })}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                        Aucun message WhatsApp envoyé pour le moment.
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
      <Dialog open={!!previewMsg} onOpenChange={(open) => !open && setPreviewMsg(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 overflow-hidden flex flex-col">
          {previewMsg && (
            <div className="flex flex-col space-y-4">
              <DialogHeader>
                <DialogTitle className="text-base font-bold text-slate-800">{previewMsg.name}</DialogTitle>
              </DialogHeader>
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100 whitespace-pre-wrap font-sans text-xs text-slate-800 leading-relaxed relative">
                <div className="absolute top-2 right-2 text-[8px] font-black uppercase text-emerald-600/50 bg-white px-2 py-0.5 rounded border border-emerald-100">
                  Rendu WhatsApp
                </div>
                {previewMsg.defaultMsg}
              </div>
              <div className="flex justify-end pt-2">
                <Button onClick={() => setPreviewMsg(null)} className="rounded-xl text-xs font-bold bg-primary text-white">
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
