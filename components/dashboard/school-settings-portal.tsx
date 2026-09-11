"use client"

import { useState, useRef } from "react"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  Upload, 
  Save, 
  CheckCircle2, 
  ImageIcon,
  Sparkles,
  Loader2,
  ShieldCheck,
  Globe,
  MessageSquare,
  AlertCircle,
  FileCheck,
  Trash2
} from "lucide-react"

import { useRouter } from "next/navigation"
import { compressImage } from "@/lib/image-utils"
import { 
  updateSchoolSettingsAction, 
  updateSchoolLogoAction, 
  updateSchoolCachetAction, 
  deleteSchoolCachetAction 
} from "@/lib/school-actions"

interface SchoolSettingsPortalProps {
  userRole: string
  schoolData?: any
}

export function SchoolSettingsPortal({ userRole, schoolData }: SchoolSettingsPortalProps) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  const logoInputRef = useRef<HTMLInputElement>(null)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [logoMsg, setLogoMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Official Stamp (Cachet) states
  const cachetInputRef = useRef<HTMLInputElement>(null)
  const [isUploadingCachet, setIsUploadingCachet] = useState(false)
  const [cachetMsg, setCachetMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const isAdmin = userRole?.toLowerCase() === "admin" || userRole?.toLowerCase() === "super_admin" || userRole?.toLowerCase() === "superadmin"
  
  // Fallback data if DB is empty
  const data = schoolData || {
    nom: "Groupe Scolaire Excellence",
    directeur: "M. Ibrahim Diallo",
    adresse: "Quartier Residentiel, Rue 12, BP 450, Conakry",
    telephone: "+224 620 00 00 00",
    email: "contact@excellence.gn",
    website: "www.excellence.gn",
    logo_url: null,
    cachet_url: null,
    smtp_host: "",
    smtp_port: 587,
    smtp_user: "",
    smtp_pass: "",
    whatsapp_access_token: "",
    whatsapp_phone_number_id: ""
  }

  // Form states
  const [nom, setNom] = useState(data.nom || "")
  const [directeur, setDirecteur] = useState(data.directeur || "")
  const [adresse, setAdresse] = useState(data.adresse || "")
  const [telephone, setTelephone] = useState(data.telephone || "")
  const [email, setEmail] = useState(data.email || "")
  const [website, setWebsite] = useState(data.website || "")
  const [logoUrl, setLogoUrl] = useState<string | null>(data.logo_url || null)
  const [cachetUrl, setCachetUrl] = useState<string | null>(data.cachet_url || null)

  const [smtpHost, setSmtpHost] = useState(data.smtp_host || "")
  const [smtpPort, setSmtpPort] = useState(data.smtp_port || 587)
  const [smtpUser, setSmtpUser] = useState(data.smtp_user || "")
  const [smtpPass, setSmtpPass] = useState(data.smtp_pass || "")

  const initialWaToken = data.whatsapp_access_token 
    ? `${data.whatsapp_access_token.substring(0, 4)}***${data.whatsapp_access_token.substring(data.whatsapp_access_token.length - 4)}` 
    : ""
  const [waToken, setWaToken] = useState(initialWaToken)
  const [waPhoneId, setWaPhoneId] = useState(data.whatsapp_phone_number_id || "")

  const handleSave = async () => {
    setIsPending(true)
    setSuccess(false)
    setErrorMsg(null)

    const result = await updateSchoolSettingsAction({
      nom,
      directeur,
      adresse,
      telephone,
      email,
      website,
      smtp_host: smtpHost,
      smtp_port: Number(smtpPort),
      smtp_user: smtpUser,
      smtp_pass: smtpPass,
      whatsapp_access_token: waToken,
      whatsapp_phone_number_id: waPhoneId
    })
    
    if (result.success) {
      setSuccess(true)
      router.refresh()
      setTimeout(() => setSuccess(false), 4000)
    } else {
      setErrorMsg(result.error || "Erreur lors de l'enregistrement.")
    }
    setIsPending(false)
  }

  const handleLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingLogo(true)
    setLogoMsg(null)

    try {
      const base64Data = await compressImage(file, 500, 0.85)
      const result = await updateSchoolLogoAction(base64Data)

      if (result.success && result.logo_url) {
        setLogoUrl(result.logo_url)
        setLogoMsg({ type: "success", text: "Logo mis à jour !" })
        router.refresh()
      } else {
        setLogoMsg({ type: "error", text: result.error || "Échec du téléversement." })
      }
    } catch (err) {
      setLogoMsg({ type: "error", text: "Erreur lors du traitement du logo." })
    } finally {
      setIsUploadingLogo(false)
    }
  }

  // Stamp / Cachet handlers
  const handleCachetSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingCachet(true)
    setCachetMsg(null)

    try {
      const base64Data = await compressImage(file, 600, 0.85)
      const result = await updateSchoolCachetAction(base64Data)

      if (result.success && result.cachet_url) {
        setCachetUrl(result.cachet_url)
        setCachetMsg({ type: "success", text: "Cachet officiel mis à jour avec succès !" })
        router.refresh()
      } else {
        setCachetMsg({ type: "error", text: result.error || "Échec du téléversement du cachet." })
      }
    } catch (err) {
      setCachetMsg({ type: "error", text: "Erreur lors du traitement du cachet." })
    } finally {
      setIsUploadingCachet(false)
    }
  }

  const handleDeleteCachet = async () => {
    setIsUploadingCachet(true)
    setCachetMsg(null)
    const result = await deleteSchoolCachetAction()
    if (result.success) {
      setCachetUrl(null)
      setCachetMsg({ type: "success", text: "Cachet supprimé." })
      router.refresh()
    } else {
      setCachetMsg({ type: "error", text: result.error || "Erreur lors de la suppression." })
    }
    setIsUploadingCachet(false)
  }

  return (
    <>
      <DashboardHeader 
        title={isAdmin ? "Paramètres de l'Établissement" : "Fiche de l'Établissement"} 
        subtitle={isAdmin 
          ? "Configurez l'identité visuelle et les informations officielles de votre école" 
          : "Informations officielles et contacts de votre établissement scolaire"}
      />
      
      <main className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            {/* Base Info */}
            <Card className="border-primary/20 shadow-xl overflow-hidden">
              <CardHeader className="bg-primary/5 border-b">
                <CardTitle className="text-lg flex items-center gap-2 text-primary">
                  <Building2 className="h-5 w-5" />
                  Identité de l'École
                </CardTitle>
                <CardDescription>
                  {isAdmin 
                    ? "Ces informations apparaîtront sur tous les documents officiels." 
                    : "Coordonnées officielles de l'établissement."}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase font-bold text-muted-foreground flex items-center gap-2">
                       <ShieldCheck className="h-3 w-3" /> Nom Officiel
                    </Label>
                    {isAdmin ? (
                      <Input id="school-name-input" value={nom} onChange={(e) => setNom(e.target.value)} className="border-primary/10" />
                    ) : (
                      <div className="p-3 rounded-lg bg-muted/30 font-bold text-lg text-primary">{nom}</div>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase font-bold text-muted-foreground flex items-center gap-2">
                       <User className="h-3 w-3" /> Directeur Général
                    </Label>
                    {isAdmin ? (
                      <Input value={directeur} onChange={(e) => setDirecteur(e.target.value)} className="border-primary/10" />
                    ) : (
                      <div className="p-3 rounded-lg bg-muted text-foreground font-medium">{directeur}</div>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs uppercase font-bold text-muted-foreground flex items-center gap-2">
                     <MapPin className="h-3 w-3" /> Adresse du Siège
                  </Label>
                  {isAdmin ? (
                    <Input value={adresse} onChange={(e) => setAdresse(e.target.value)} className="border-primary/10" />
                  ) : (
                    <div className="p-3 rounded-lg bg-muted text-foreground">{adresse}</div>
                  )}
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase font-bold text-muted-foreground flex items-center gap-2">
                       <Phone className="h-3 w-3" /> Standard Téléphonique
                    </Label>
                    {isAdmin ? (
                      <Input value={telephone} onChange={(e) => setTelephone(e.target.value)} className="border-primary/10" />
                    ) : (
                      <div className="p-3 rounded-lg bg-muted text-foreground font-mono">{telephone}</div>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase font-bold text-muted-foreground flex items-center gap-2">
                       <Mail className="h-3 w-3" /> Email Officiel
                    </Label>
                    {isAdmin ? (
                      <Input value={email} onChange={(e) => setEmail(e.target.value)} className="border-primary/10" />
                    ) : (
                      <div className="p-3 rounded-lg bg-muted text-foreground font-medium underline decoration-primary/20">{email}</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Configuration SMTP */}
            <Card className="border-primary/20 shadow-xl overflow-hidden">
              <CardHeader className="bg-primary/5 border-b">
                <CardTitle className="text-lg flex items-center gap-2 text-primary">
                  <Mail className="h-5 w-5" />
                  Moteur SMTP Décentralisé (Gmail, OVH, Hostinger)
                </CardTitle>
                <CardDescription>
                  Configurez vos propres serveurs de messagerie pour l'envoi des reçus, bulletins, et notifications.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase font-bold text-muted-foreground">Serveur SMTP Host / Serveur</Label>
                    {isAdmin ? (
                      <Input value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} placeholder="smtp.hostinger.com" className="border-primary/10" />
                    ) : (
                      <div className="p-3 rounded-lg bg-muted text-foreground font-mono">{smtpHost || "Non configuré"}</div>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase font-bold text-muted-foreground">Port SMTP</Label>
                    {isAdmin ? (
                      <Input type="number" value={smtpPort} onChange={(e) => setSmtpPort(Number(e.target.value))} placeholder="587" className="border-primary/10" />
                    ) : (
                      <div className="p-3 rounded-lg bg-muted text-foreground font-mono">{smtpPort}</div>
                    )}
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase font-bold text-muted-foreground">Utilisateur / Adresse Email SMTP</Label>
                    {isAdmin ? (
                      <Input value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} placeholder="ecole@mondomaine.ci" className="border-primary/10" />
                    ) : (
                      <div className="p-3 rounded-lg bg-muted text-foreground">{smtpUser || "Non configuré"}</div>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase font-bold text-muted-foreground">Mot de passe SMTP</Label>
                    {isAdmin ? (
                      <Input type="password" value={smtpPass} onChange={(e) => setSmtpPass(e.target.value)} placeholder="••••••••••••" className="border-primary/10" />
                    ) : (
                      <div className="p-3 rounded-lg bg-muted text-foreground">••••••••••••</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Configuration Meta WhatsApp */}
            <Card className="border-primary/20 shadow-xl overflow-hidden">
              <CardHeader className="bg-primary/5 border-b">
                <CardTitle className="text-lg flex items-center gap-2 text-primary">
                  <MessageSquare className="h-5 w-5" />
                  Meta WhatsApp Cloud API (Commercial)
                </CardTitle>
                <CardDescription>
                  Configurez vos accès officiels WhatsApp Cloud pour envoyer des alertes instantanées de paiement et d'absence.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase font-bold text-muted-foreground">Jeton d'accès permanent Meta (Access Token)</Label>
                  {isAdmin ? (
                    <Input value={waToken} onChange={(e) => setWaToken(e.target.value)} placeholder="EAAG..." className="border-primary/10" />
                  ) : (
                    <div className="p-3 rounded-lg bg-muted text-foreground truncate">{waToken ? "••••••••••••" : "Non configuré"}</div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs uppercase font-bold text-muted-foreground">Identifiant du numéro de téléphone (Phone Number ID)</Label>
                  {isAdmin ? (
                    <Input value={waPhoneId} onChange={(e) => setWaPhoneId(e.target.value)} placeholder="1059..." className="border-primary/10" />
                  ) : (
                    <div className="p-3 rounded-lg bg-muted text-foreground font-mono">{waPhoneId || "Non configuré"}</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Cachet Officiel de l'Établissement */}
            <Card className="border-emerald-500/20 shadow-xl overflow-hidden">
              <CardHeader className="bg-emerald-500/5 border-b">
                <CardTitle className="text-lg flex items-center gap-2 text-emerald-700">
                  <FileCheck className="h-5 w-5" />
                  Cachet Officiel de l'Établissement
                </CardTitle>
                <CardDescription>
                  Ce cachet officiel sera apposé sur les bulletins, certificats et documents administratifs générés.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <input
                  type="file"
                  ref={cachetInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleCachetSelect}
                />

                <div className="flex flex-col sm:flex-row items-center gap-6 p-4 border rounded-2xl bg-slate-50/50">
                  <div className="h-32 w-32 rounded-2xl border-2 border-dashed border-emerald-500/30 flex items-center justify-center relative bg-white overflow-hidden p-2 shrink-0 shadow-sm">
                    {cachetUrl ? (
                      <img src={cachetUrl} alt="Cachet Officiel" className="w-full h-full object-contain" />
                    ) : (
                      <div className="text-center p-2 text-muted-foreground">
                        <FileCheck className="h-8 w-8 mx-auto opacity-30 text-emerald-600 mb-1" />
                        <span className="text-[10px] font-bold uppercase tracking-wider block">Aucun cachet</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <h4 className="font-bold text-sm text-slate-800">Cachet Numérique de l'École</h4>
                    <p className="text-xs text-muted-foreground">
                      Format recommandé : PNG à fond transparent (ex: 600x600 px).
                    </p>

                    {cachetMsg && (
                      <div className={`text-xs flex items-center justify-center sm:justify-start gap-1 font-medium ${cachetMsg.type === "success" ? "text-emerald-600" : "text-destructive"}`}>
                        {cachetMsg.type === "success" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                        {cachetMsg.text}
                      </div>
                    )}

                    {isAdmin && (
                      <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-2">
                        <Button 
                          type="button" 
                          size="sm" 
                          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                          onClick={() => cachetInputRef.current?.click()}
                          disabled={isUploadingCachet}
                        >
                          {isUploadingCachet ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Upload className="h-3.5 w-3.5 mr-1.5" />}
                          {cachetUrl ? "Remplacer le cachet" : "Téléverser le cachet"}
                        </Button>

                        {cachetUrl && (
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            className="text-destructive border-destructive/20 hover:bg-destructive/10 rounded-xl text-xs font-bold"
                            onClick={handleDeleteCachet}
                            disabled={isUploadingCachet}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Supprimer
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <Card className="border-primary/20 shadow-xl overflow-hidden">
               <CardHeader className="bg-muted/50 border-b p-4">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-primary" /> Logo Institutionnel
                  </CardTitle>
               </CardHeader>
               <CardContent className="p-6 flex flex-col items-center gap-6">
                  <input
                    type="file"
                    ref={logoInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoSelect}
                  />

                  <div className="h-40 w-40 rounded-3xl bg-muted border-2 border-dashed border-primary/20 flex items-center justify-center relative group overflow-hidden p-2">
                     {logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="w-full h-full object-contain rounded-2xl" />
                     ) : (
                        <Building2 className="h-12 w-12 text-primary/20" />
                     )}
                     
                     {isAdmin && (
                        <div className="absolute inset-0 bg-primary/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <Button 
                              variant="secondary" 
                              size="sm"
                              onClick={() => logoInputRef.current?.click()}
                              disabled={isUploadingLogo}
                           >
                              {isUploadingLogo ? <Loader2 className="h-4 w-4 animate-spin" /> : "Uploader Logo"}
                           </Button>
                        </div>
                     )}
                  </div>

                  {logoMsg && (
                    <div className={`text-xs flex items-center gap-1 font-medium ${logoMsg.type === "success" ? "text-emerald-600" : "text-destructive"}`}>
                      {logoMsg.type === "success" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                      {logoMsg.text}
                    </div>
                  )}

                  <div className="w-full space-y-3">
                     <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
                        <Globe className="h-4 w-4" />
                        {website || data.website}
                     </div>
                  </div>
               </CardContent>
            </Card>

            {isAdmin && (
               <div className="sticky top-24 space-y-3">
                  {success && (
                    <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3 text-sm font-bold">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      Paramètres enregistrés avec succès !
                    </div>
                  )}
                  {errorMsg && (
                    <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-2xl p-4 flex items-center gap-3 text-sm font-bold">
                      <AlertCircle className="h-5 w-5" />
                      {errorMsg}
                    </div>
                  )}
                  <Button id="btn-save-school" type="button" size="lg" className="w-full h-14 text-lg shadow-lg shadow-primary/20 gap-2" onClick={handleSave} disabled={isPending}>
                    {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                    {isPending ? "Enregistrement..." : "Enregistrer Tout"}
                  </Button>
               </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
