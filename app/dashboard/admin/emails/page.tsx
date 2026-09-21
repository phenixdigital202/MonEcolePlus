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
import { getEmailHistory, retryFailedEmails, sendSimulatedEmail, testSmtpConnectionAction } from "@/lib/email-actions"
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

function getTemplatePreviewHtml(templateId: string, templateName: string) {
  const primaryColor = "#3b82f6"
  const schoolName = "MonÉcole+ Groupe Scolaire"
  const dateStr = new Date().toLocaleDateString("fr-FR")

  let contentHtml = ""

  switch (templateId) {
    case "new_grade":
      contentHtml = `
        <h2 style="color:#1e293b;margin-top:0;">Nouvelle Note Publiée</h2>
        <p>Bonjour M./Mme Bamba,</p>
        <p>Une nouvelle note a été enregistrée pour votre enfant <strong>Bamba Judith</strong> :</p>
        <div style="background:#f8fafc;padding:16px;border-left:4px solid #3b82f6;margin:16px 0;border-radius:8px;">
          <p style="margin:4px 0;"><strong>Discipline :</strong> Mathématiques</p>
          <p style="margin:4px 0;"><strong>Évaluation :</strong> Devoir de Synthèse N°2</p>
          <p style="margin:4px 0;"><strong>Note obtenue :</strong> <span style="font-size:20px;font-weight:bold;color:#10b981;">16.5 / 20</span></p>
          <p style="margin:4px 0;"><strong>Moyenne de la classe :</strong> 12.4 / 20</p>
          <p style="margin:4px 0;"><strong>Appréciation :</strong> Excellent travail, poursuivez ainsi !</p>
        </div>
        <p>Connectez-vous sur votre espace parent MonÉcole+ pour consulter le détail des notes.</p>
      `
      break
    case "new_absence":
      contentHtml = `
        <h2 style="color:#e11d48;margin-top:0;">Notification d'Absence</h2>
        <p>Bonjour M./Mme Bamba,</p>
        <p>Nous vous informons de l'absence suivante enregistrée au nom de votre enfant <strong>Bamba Judith</strong> :</p>
        <div style="background:#fff1f2;padding:16px;border-left:4px solid #f43f5e;margin:16px 0;border-radius:8px;">
          <p style="margin:4px 0;"><strong>Date d'absence :</strong> ${dateStr}</p>
          <p style="margin:4px 0;"><strong>Créneau :</strong> Matinée (08h00 - 12h00)</p>
          <p style="margin:4px 0;"><strong>Motif / Statut :</strong> <span style="color:#e11d48;font-weight:bold;">Non Justifiée</span></p>
        </div>
        <p>Merci de contacter le bureau de la vie scolaire ou de transmettre un justificatif depuis votre portail.</p>
      `
      break
    case "payment_received":
      contentHtml = `
        <h2 style="color:#059669;margin-top:0;">Reçu de Paiement - Scolarité</h2>
        <p>Bonjour M./Mme Bamba,</p>
        <p>Nous vous confirmons la bonne réception de votre versement pour la scolarité :</p>
        <div style="background:#ecfdf5;padding:16px;border-left:4px solid #10b981;margin:16px 0;border-radius:8px;">
          <p style="margin:4px 0;"><strong>Référence Reçu :</strong> REC-2026-8892</p>
          <p style="margin:4px 0;"><strong>Montant payé :</strong> <span style="font-size:18px;font-weight:bold;color:#059669;">150 000 FCFA</span></p>
          <p style="margin:4px 0;"><strong>Mode de paiement :</strong> Mobile Money (Orange Money)</p>
          <p style="margin:4px 0;"><strong>Tranche concernée :</strong> 2ème Tranche 2025-2026</p>
        </div>
        <p>Le reçu officiel au format PDF est téléchargeable dans votre espace comptabilité.</p>
      `
      break
    case "late_payment":
      contentHtml = `
        <h2 style="color:#d97706;margin-top:0;">Rappel de Scolarité en Retard</h2>
        <p>Bonjour M./Mme Bamba,</p>
        <p>Sauf erreur ou omission de notre part, l'échéance de scolarité suivante est arrivée à terme :</p>
        <div style="background:#fffbeb;padding:16px;border-left:4px solid #f59e0b;margin:16px 0;border-radius:8px;">
          <p style="margin:4px 0;"><strong>Élève concerné :</strong> Bamba Judith (Terminale A)</p>
          <p style="margin:4px 0;"><strong>Échéance :</strong> 2ème Tranche Scolarité</p>
          <p style="margin:4px 0;"><strong>Solde restant dû :</strong> <span style="font-size:18px;font-weight:bold;color:#b45309;">75 000 FCFA</span></p>
        </div>
        <p>Nous vous prions de bien vouloir régulariser ce règlement dans les plus brefs délais.</p>
      `
      break
    case "report_card":
      contentHtml = `
        <h2 style="color:#3b82f6;margin-top:0;">Publication du Bulletin Trimestriel</h2>
        <p>Bonjour M./Mme Bamba,</p>
        <p>Le bulletin de notes du <strong>1er Trimestre 2025-2026</strong> de l'élève <strong>Bamba Judith</strong> est désormais disponible en ligne.</p>
        <div style="background:#eff6ff;padding:16px;border-left:4px solid #3b82f6;margin:16px 0;border-radius:8px;">
          <p style="margin:4px 0;"><strong>Moyenne Trimestrielle :</strong> <span style="font-size:18px;font-weight:bold;color:#2563eb;">15.42 / 20</span></p>
          <p style="margin:4px 0;"><strong>Rang :</strong> 3ème / 42 élèves</p>
          <p style="margin:4px 0;"><strong>Tableau d'Honneur :</strong> Accordé avec Félicitations du Conseil</p>
        </div>
        <p>Vous pouvez consulter et imprimer le bulletin sécurisé directement sur la plateforme MonÉcole+.</p>
      `
      break
    case "admin_message":
      contentHtml = `
        <h2 style="color:#1e293b;margin-top:0;">Information Importante de l'Établissement</h2>
        <p>Chers parents et élèves,</p>
        <p>Nous vous informons de l'organisation des épreuves d'Examens Blancs qui se tiendront du 15 au 18 avril 2026.</p>
        <div style="background:#f8fafc;padding:16px;border-left:4px solid #64748b;margin:16px 0;border-radius:8px;">
          <p style="margin:4px 0;"><strong>Sujet :</strong> Horaires et convocations d'examens</p>
          <p style="margin:4px 0;">Les élèves sont priés de se présenter munis de leur convocation officielle et pièce d'identité.</p>
        </div>
        <p>La Direction reste à votre entière disposition pour tout renseignement complémentaire.</p>
      `
      break
    case "meeting":
      contentHtml = `
        <h2 style="color:#6366f1;margin-top:0;">Invitation : Réunion Parents-Professeurs</h2>
        <p>Bonjour M./Mme Bamba,</p>
        <p>Vous êtes cordialement invité(e) à la réunion bilan trimestrielle des parents d'élèves :</p>
        <div style="background:#f5f3ff;padding:16px;border-left:4px solid #6366f1;margin:16px 0;border-radius:8px;">
          <p style="margin:4px 0;"><strong>Date & Heure :</strong> Samedi 28 Février 2026 à 09h00</p>
          <p style="margin:4px 0;"><strong>Lieu :</strong> Grande Salle de Conférence MonÉcole+</p>
          <p style="margin:4px 0;"><strong>Ordre du jour :</strong> Bilan académique & orientation des élèves</p>
        </div>
        <p>Votre présence est vivement souhaitée.</p>
      `
      break
    case "convocation":
      contentHtml = `
        <h2 style="color:#e11d48;margin-top:0;">Convocation Officielle à la Direction</h2>
        <p>Bonjour M./Mme Bamba,</p>
        <p>Vous êtes prié(e) de bien vouloir vous présenter au bureau de la Direction de l'établissement :</p>
        <div style="background:#fff1f2;padding:16px;border-left:4px solid #e11d48;margin:16px 0;border-radius:8px;">
          <p style="margin:4px 0;"><strong>Motif :</strong> Entretien de suivi pédagogique</p>
          <p style="margin:4px 0;"><strong>Date :</strong> Mardi 24 Février à 10h30</p>
          <p style="margin:4px 0;"><strong>Intervenant :</strong> Chef d'Établissement & Professeur Principal</p>
        </div>
        <p>En cas d'empêchement majeur, merci d'avertir le secrétariat par téléphone.</p>
      `
      break
    case "new_enrollment":
      contentHtml = `
        <h2 style="color:#059669;margin-top:0;">Confirmation d'Inscription</h2>
        <p>Bonjour M./Mme Bamba,</p>
        <p>Nous avons le plaisir de vous confirmer l'affectation et l'inscription définitive de votre enfant :</p>
        <div style="background:#ecfdf5;padding:16px;border-left:4px solid #059669;margin:16px 0;border-radius:8px;">
          <p style="margin:4px 0;"><strong>Élève :</strong> Bamba Judith</p>
          <p style="margin:4px 0;"><strong>Classe affectée :</strong> Terminale A1</p>
          <p style="margin:4px 0;"><strong>Matricule :</strong> MAT-2026-0941</p>
          <p style="margin:4px 0;"><strong>Année Scolaire :</strong> 2025-2026</p>
        </div>
        <p>Bienvenue au sein de notre communauté éducative !</p>
      `
      break
    case "forgot_password":
      contentHtml = `
        <h2 style="color:#2563eb;margin-top:0;">Réinitialisation de votre Mot de Passe</h2>
        <p>Bonjour,</p>
        <p>Vous avez demandé la réinitialisation de votre mot de passe pour accéder au portail MonÉcole+.</p>
        <div style="text-align:center;margin:24px 0;">
          <a href="#" style="background:#2563eb;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">Réinitialiser mon mot de passe</a>
        </div>
        <p style="font-size:12px;color:#64748b;">Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email en toute sécurité.</p>
      `
      break
    case "welcome":
      contentHtml = `
        <h2 style="color:#3b82f6;margin-top:0;">Bienvenue sur MonÉcole+ !</h2>
        <p>Bonjour M./Mme Bamba,</p>
        <p>Votre compte utilisateur sur la plateforme MonÉcole+ a été créé avec succès.</p>
        <div style="background:#eff6ff;padding:16px;border-left:4px solid #3b82f6;margin:16px 0;border-radius:8px;">
          <p style="margin:4px 0;"><strong>Identifiant (Email) :</strong> parent.bamba@ecole.ci</p>
          <p style="margin:4px 0;"><strong>Rôle :</strong> Espace Parent</p>
          <p style="margin:4px 0;"><strong>Accès :</strong> Consultations des notes, absences, reçus et messages</p>
        </div>
        <p>Découvrez dès à présent vos services de suivi en ligne.</p>
      `
      break
    case "verification":
      contentHtml = `
        <h2 style="color:#7c3aed;margin-top:0;">Vérification de votre Adresse Email</h2>
        <p>Bonjour,</p>
        <p>Veuillez utiliser le code de vérification ci-dessous pour valider la création de votre compte :</p>
        <div style="background:#f5f3ff;padding:20px;text-align:center;border-radius:12px;margin:20px 0;">
          <span style="font-size:32px;font-weight:bold;letter-spacing:6px;color:#7c3aed;">849 - 206</span>
        </div>
        <p style="font-size:12px;color:#64748b;">Ce code expire dans 15 minutes.</p>
      `
      break
    default:
      contentHtml = `
        <h2 style="color:#3b82f6;margin-top:0;">${templateName}</h2>
        <p>Ceci est un aperçu officiel du modèle d'email <strong>${templateName}</strong>.</p>
      `
  }

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <title>${templateName}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #334155;">
      <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;">
        <div style="background-color: #1e293b; padding: 20px 24px; text-align: left; border-bottom: 3px solid ${primaryColor};">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.5px;">MonÉcole<span style="color: ${primaryColor};">+</span></h1>
          <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 11px; text-transform: uppercase; font-weight: 600;">${schoolName}</p>
        </div>
        <div style="padding: 28px 24px; line-height: 1.6; font-size: 14px;">
          ${contentHtml}
        </div>
        <div style="background-color: #f8fafc; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
          <p style="margin: 0;">© 2026 MonÉcole+ Groupe Scolaire | Système de Notifications Automatisées</p>
          <p style="margin: 4px 0 0 0;">Document certifié et horodaté le ${dateStr}</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export default function EmailsAdminPage() {
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0].id)
  const [previewDoc, setPreviewDoc] = useState<any>(null)
  const [simulating, setSimulating] = useState(false)
  const [retrying, setRetrying] = useState(false)

  const [testingConnection, setTestingConnection] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)
  const [testEmail, setTestEmail] = useState("")

  async function handleTestSmtp(e: React.FormEvent) {
    e.preventDefault()
    if (!testEmail) return
    setTestingConnection(true)
    setTestResult(null)
    try {
      const res = await testSmtpConnectionAction(testEmail)
      setTestResult(res)
      if (res.success) {
        toast.success("Diagnostic SMTP réussi ! Un email de test a été transmis.")
        loadHistory()
      } else {
        toast.error(res.error || "Échec du test de connexion SMTP")
      }
    } catch (err: any) {
      setTestResult({ success: false, error: err.message || String(err) })
    } finally {
      setTestingConnection(false)
    }
  }

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
        <div className="grid gap-6 lg:grid-cols-4">
          
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

          {/* Diagnostic SMTP */}
          <Card className="lg:col-span-1 border-none shadow-xl bg-white rounded-3xl overflow-hidden">
            <CardHeader className="bg-primary/5 border-b pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                <Settings className="h-4.5 w-4.5 text-primary" />
                Diagnostic SMTP en Direct
              </CardTitle>
              <CardDescription className="text-xs">Valider la connexion réseau SMTP réelle</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleTestSmtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Email destinataire test</label>
                  <Input 
                    type="email" 
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="e.g. admin@ecole.com" 
                    required 
                    className="rounded-xl border-slate-200 text-xs"
                  />
                </div>

                <Button type="submit" disabled={testingConnection} className="w-full h-10 rounded-xl bg-indigo-600 text-white font-bold text-xs gap-2 mt-2 hover:bg-indigo-700">
                  <RefreshCw className={`h-4 w-4 ${testingConnection ? "animate-spin" : ""}`} />
                  Tester SMTP
                </Button>
              </form>

              {testResult && (
                <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Statut SMTP</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${testResult.success ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                      {testResult.success ? "Connecté (OK)" : "Erreur Connexion"}
                    </span>
                  </div>
                  {testResult.messageId && (
                    <pre className="text-[9px] font-mono text-slate-700 bg-white p-3 rounded-xl border border-slate-100 max-h-[120px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
                      Message-ID: {testResult.messageId}
                    </pre>
                  )}
                  {testResult.error && (
                    <p className="text-[10px] text-rose-500 font-medium leading-normal whitespace-pre-wrap">{testResult.error}</p>
                  )}
                </div>
              )}
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
                      onClick={() => setPreviewDoc({ ...tpl, html: getTemplatePreviewHtml(tpl.id, tpl.name) })}
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
                            onClick={() => setPreviewDoc({ name: log.subject, html: log.body || getTemplatePreviewHtml(log.templateName, log.subject) })}
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
