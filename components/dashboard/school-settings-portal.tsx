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
  AlertCircle
} from "lucide-react"

import { updateSchoolSettingsAction, updateSchoolLogoAction } from "@/lib/school-actions"

interface SchoolSettingsPortalProps {
  userRole: string
  schoolData?: any
}

export function SchoolSettingsPortal({ userRole, schoolData }: SchoolSettingsPortalProps) {
  const [isPending, setIsPending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  const logoInputRef = useRef<HTMLInputElement>(null)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [logoMsg, setLogoMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

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
      setTimeout(() => setSuccess(false), 4000)
    } else {
      setErrorMsg(result.error || "Erreur lors de l'enregistrement.")
    }
    setIsPending(false)
  }

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) { // 5MB max
      setLogoMsg({ type: "error", text: "Le fichier ne doit pas dépasser 5 Mo." })
      return
    }

    setIsUploadingLogo(true)
    setLogoMsg(null)

    const reader = new FileReader()
    reader.onload = async () => {
      const base64Data = reader.result as string
      const result = await updateSchoolLogoAction(base64Data)

      if (result.success && result.logo_url) {
        setLogoUrl(result.logo_url)
        setLogoMsg({ type: "success", text: "Logo mis à jour !" })
      } else {
        setLogoMsg({ type: "error", text: result.error || "Échec du téléversement." })
      }
      setIsUploadingLogo(false)
    }

    reader.onerror = () => {
      setLogoMsg({ type: "error", text: "Erreur de lecture du fichier." })
      setIsUploadingLogo(false)
    }

    reader.readAsDataURL(file)
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

            {/* Signature & Authentication */}
            <Card className="border-emerald-500/20 shadow-xl overflow-hidden">
              <CardHeader className="bg-emerald-500/5 border-b">
                <CardTitle className="text-lg flex items-center gap-2 text-emerald-700">
                  <Sparkles className="h-5 w-5" />
                  Validation & Authenticité
                </CardTitle>
                <CardDescription>
                  {isAdmin ? "Gérez les éléments de sécurité des documents." : "Aperçu des éléments d'authentification officielle."}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                 {isAdmin ? (
                   <div className="p-8 border-2 border-dashed border-emerald-500/20 rounded-xl flex flex-col items-center gap-2 text-center text-muted-foreground">
                      <Upload className="h-10 w-10 opacity-20" />
                      <p className="text-sm">Cachet numérique certifié conforme</p>
                      <div className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full">Automatique</div>
                   </div>
                 ) : (
                   <div className="flex flex-col md:flex-row items-center gap-8 justify-between p-4 px-8 border rounded-2xl bg-white/50 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2">
                         <div className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded uppercase tracking-tighter">Certifié</div>
                      </div>
                      <div className="text-center md:text-left">
                        <p className="text-2xl italic font-serif text-emerald-950 mb-1">{directeur || data.directeur}</p>
                        <p className="text-[10px] uppercase tracking-[0.2em] font-black text-emerald-600">Direction Générale</p>
                      </div>
                      <div className="h-32 w-32 rounded-full border-4 border-double border-emerald-500/30 flex items-center justify-center relative rotate-12 bg-emerald-50/50">
                         <div className="text-[8px] font-black p-2 text-center text-emerald-700 uppercase leading-tight">
                            Cachet Officiel<br />MonÉcole+<br />RECONNU
                         </div>
                      </div>
                   </div>
                 )}
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
