"use client"

import { useState } from "react"
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Save, 
  Upload, 
  GraduationCap, 
  BookOpen, 
  Users, 
  School,
  Settings,
  MessageSquare,
  Server,
  Key
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateSchoolSettingsAction } from "@/lib/school-actions"
import { testWhatsAppConnectionAction } from "@/lib/whatsapp-actions"
import { saveSchoolYearAction } from "@/lib/school-year-actions"
import { toast } from "sonner"

interface AdminSchoolPortalProps {
  schoolData: any
  stats: {
    students: number
    teachers: number
    parents: number
    classes: number
  }
  schoolYears: any[]
}

export function AdminSchoolPortal({ schoolData, stats, schoolYears: initialSchoolYears }: AdminSchoolPortalProps) {
  const [isPending, setIsPending] = useState(false)
  const [testingWa, setTestingWa] = useState(false)
  const [waTestPhone, setWaTestPhone] = useState("")

  // Form states
  const [nom, setNom] = useState(schoolData?.nom || "")
  const [directeur, setDirecteur] = useState(schoolData?.directeur || "")
  const [adresse, setAdresse] = useState(schoolData?.adresse || "")
  const [telephone, setTelephone] = useState(schoolData?.telephone || "")
  const [email, setEmail] = useState(schoolData?.email || "")
  const [website, setWebsite] = useState(schoolData?.website || "")
  const [codeUai, setCodeUai] = useState(schoolData?.code_uai || "0750001A")
  const [academie, setAcademie] = useState(schoolData?.academie || "paris")
  const [type, setType] = useState(schoolData?.type || "lycee")
  const [description, setDescription] = useState(schoolData?.description || "")
  const [smtpHost, setSmtpHost] = useState(schoolData?.smtp_host || "")
  const [smtpPort, setSmtpPort] = useState(schoolData?.smtp_port || 587)
  const [smtpUser, setSmtpUser] = useState(schoolData?.smtp_user || "")
  const [smtpPass, setSmtpPass] = useState(schoolData?.smtp_pass ? "••••••••••••" : "")
  const [waPhoneId, setWaPhoneId] = useState(schoolData?.whatsapp_phone_number_id || "")

  // Mask token on load
  const initialWaToken = schoolData?.whatsapp_access_token
    ? `${schoolData.whatsapp_access_token.substring(0, 4)}***${schoolData.whatsapp_access_token.substring(schoolData.whatsapp_access_token.length - 4)}`
    : ""
  const [waToken, setWaToken] = useState(initialWaToken)

  // School Year States
  const [schoolYears, setSchoolYears] = useState<any[]>(initialSchoolYears)
  const activeYear = schoolYears.find(y => y.status === "ACTIVE")
  
  const [syId, setSyId] = useState<number | undefined>(activeYear?.id)
  const [syStartDate, setSyStartDate] = useState(
    activeYear?.startDate ? new Date(activeYear.startDate).toISOString().split('T')[0] : ""
  )
  const [syEndDate, setSyEndDate] = useState(
    activeYear?.endDate ? new Date(activeYear.endDate).toISOString().split('T')[0] : ""
  )
  const [syStatus, setSyStatus] = useState(activeYear?.status || "ACTIVE")
  const [savingSy, setSavingSy] = useState(false)

  // Auto calculate label from dates
  const calculatedLabel = (() => {
    if (!syStartDate || !syEndDate) return ""
    const startYear = new Date(syStartDate).getFullYear()
    const endYear = new Date(syEndDate).getFullYear()
    if (isNaN(startYear) || isNaN(endYear)) return ""
    return `${startYear}-${endYear}`
  })()

  // Auto calculate duration in months
  const durationInMonths = (() => {
    if (!syStartDate || !syEndDate) return 0
    const start = new Date(syStartDate)
    const end = new Date(syEndDate)
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.round(diffDays / 30.4) // average month duration
  })()

  const handleSaveSchoolYear = async () => {
    if (!syStartDate || !syEndDate) {
      toast.error("Veuillez sélectionner les dates de début et de fin.")
      return
    }
    
    if (new Date(syEndDate) <= new Date(syStartDate)) {
      toast.error("La date de fin doit être supérieure à la date de début.")
      return
    }

    setSavingSy(true)
    try {
      const res = await saveSchoolYearAction({
        id: syId,
        label: calculatedLabel,
        startDate: syStartDate,
        endDate: syEndDate,
        status: syStatus
      })

      if (res.success) {
        toast.success("Année scolaire enregistrée avec succès !")
        // Refresh local history list
        // Simply push or update the item in local schoolYears state
        const updatedItem = res.data
        setSchoolYears(prev => {
          // If status is ACTIVE, set all others to CLOSED
          let list = [...prev]
          if (updatedItem.status === "ACTIVE") {
            list = list.map(y => y.id === updatedItem.id ? updatedItem : { ...y, status: "CLOSED" })
          } else {
            const idx = list.findIndex(y => y.id === updatedItem.id)
            if (idx > -1) list[idx] = updatedItem
            else list.unshift(updatedItem)
          }
          // Sort by startDate desc
          return list.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
        })
        setSyId(updatedItem.id)
      } else {
        toast.error(res.error || "Échec de l'enregistrement.")
      }
    } catch (err: any) {
      toast.error("Erreur réseau : " + err.message)
    } finally {
      setSavingSy(false)
    }
  }

  const handleSelectYearFromHistory = (year: any) => {
    setSyId(year.id)
    setSyStartDate(new Date(year.startDate).toISOString().split('T')[0])
    setSyEndDate(new Date(year.endDate).toISOString().split('T')[0])
    setSyStatus(year.status)
    toast.info(`Année scolaire ${year.label} sélectionnée pour édition.`)
  }

  const handleResetForNewYear = () => {
    setSyId(undefined)
    setSyStartDate("")
    setSyEndDate("")
    setSyStatus("DRAFT")
    toast.info("Prêt pour la création d'une nouvelle année scolaire.")
  }

  const handleSave = async () => {
    setIsPending(true)
    try {
      const res = await updateSchoolSettingsAction({
        nom,
        directeur,
        adresse,
        telephone,
        email,
        website,
        smtp_host: smtpHost,
        smtp_port: smtpPort,
        smtp_user: smtpUser,
        smtp_pass: smtpPass,
        whatsapp_access_token: waToken,
        whatsapp_phone_number_id: waPhoneId
      })

      if (res.success) {
        toast.success("Configuration de l'établissement enregistrée avec succès !")
      } else {
        toast.error(res.error || "Erreur lors de l'enregistrement.")
      }
    } catch (err: any) {
      toast.error("Erreur réseau : " + err.message)
    } finally {
      setIsPending(false)
    }
  }

  const handleTestWhatsApp = async () => {
    if (!waTestPhone) {
      toast.error("Veuillez saisir un numéro destinataire de test.")
      return
    }
    setTestingWa(true)
    try {
      const res = await testWhatsAppConnectionAction(waTestPhone)
      if (res.success) {
        toast.success("Vrai message de diagnostic WhatsApp envoyé avec succès via Meta API !")
      } else {
        toast.error(res.error || "Échec du diagnostic de connexion WhatsApp.")
      }
    } catch (err: any) {
      toast.error("Erreur de test : " + err.message)
    } finally {
      setTestingWa(false)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Configuration de l&apos;établissement</h1>
          <p className="text-slate-500 font-medium">Configurez l&apos;identité visuelle, les coordonnées, les serveurs SMTP et les jetons de production de votre école</p>
        </div>
        <Button onClick={handleSave} disabled={isPending} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-5 font-bold shadow-lg shadow-indigo-150 border-none transition-transform duration-200 active:scale-95">
          <Save className="h-4 w-4" />
          {isPending ? "Enregistrement..." : "Enregistrer la config"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: General Info */}
          <Card className="border-none shadow-xl bg-white/70 backdrop-blur-sm card-hover-premium rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                <Building2 className="h-5 w-5 text-indigo-600" />
                Informations Générales
              </CardTitle>
              <CardDescription className="text-xs">Détails officiels de l&apos;établissement</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="schoolName" className="text-xs font-bold text-slate-500 uppercase">Nom de l&apos;établissement</Label>
                  <Input id="schoolName" value={nom} onChange={(e) => setNom(e.target.value)} className="rounded-xl border-slate-200 text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="schoolType" className="text-xs font-bold text-slate-500 uppercase">Type d&apos;établissement</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger className="rounded-xl border-slate-200 text-xs">
                      <SelectValue placeholder="Sélectionner le type" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="primaire">École Primaire</SelectItem>
                      <SelectItem value="college">Collège</SelectItem>
                      <SelectItem value="lycee">Lycée</SelectItem>
                      <SelectItem value="universite">Université</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="uai" className="text-xs font-bold text-slate-500 uppercase">Code UAI</Label>
                  <Input id="uai" value={codeUai} onChange={(e) => setCodeUai(e.target.value)} className="font-mono rounded-xl border-slate-200 text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="academie" className="text-xs font-bold text-slate-500 uppercase">Académie / Zone Scolaire</Label>
                  <Select value={academie} onValueChange={setAcademie}>
                    <SelectTrigger className="rounded-xl border-slate-200 text-xs">
                      <SelectValue placeholder="Sélectionner la zone" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="paris">Paris</SelectItem>
                      <SelectItem value="abidjan">Abidjan</SelectItem>
                      <SelectItem value="dakar">Dakar</SelectItem>
                      <SelectItem value="yaounde">Yaoundé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-xs font-bold text-slate-500 uppercase">Description / Historique</Label>
                <Textarea 
                  id="description" 
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Présentez brièvement votre établissement..."
                  className="rounded-xl border-slate-200 text-xs"
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Coordinates */}
          <Card className="border-none shadow-xl bg-white/70 backdrop-blur-sm card-hover-premium rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                <MapPin className="h-5 w-5 text-indigo-600" />
                Coordonnées & Contacts
              </CardTitle>
              <CardDescription className="text-xs">Adresse physique et contacts officiels</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="address" className="text-xs font-bold text-slate-500 uppercase">Adresse Postale / Physique</Label>
                <Input id="address" value={adresse} onChange={(e) => setAdresse(e.target.value)} className="rounded-xl border-slate-200 text-xs" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-bold text-slate-500 uppercase">Téléphone Standard</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input id="phone" value={telephone} onChange={(e) => setTelephone(e.target.value)} className="pl-9 rounded-xl border-slate-200 text-xs" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-bold text-slate-500 uppercase">Email Administratif</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9 rounded-xl border-slate-200 text-xs" />
                  </div>
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="website" className="text-xs font-bold text-slate-500 uppercase">Site internet de l&apos;école</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} className="pl-9 rounded-xl border-slate-200 text-xs" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Communications (SMTP & WhatsApp) */}
          <Card className="border-none shadow-xl bg-white/70 backdrop-blur-sm card-hover-premium rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                <Server className="h-5 w-5 text-indigo-600" />
                Moteur SMTP Décentralisé (Emails)
              </CardTitle>
              <CardDescription className="text-xs">Configurez vos propres serveurs SMTP de messagerie</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-500 uppercase">Serveur SMTP Hôte</Label>
                  <Input value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} placeholder="smtp.hostinger.com" className="rounded-xl border-slate-200 text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-500 uppercase">Port SMTP</Label>
                  <Input type="number" value={smtpPort} onChange={(e) => setSmtpPort(Number(e.target.value))} placeholder="587" className="rounded-xl border-slate-200 text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-500 uppercase">Utilisateur SMTP / Email</Label>
                  <Input value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} placeholder="ecole@domaine.ci" className="rounded-xl border-slate-200 text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-500 uppercase">Mot de passe SMTP</Label>
                  <Input type="password" value={smtpPass} onChange={(e) => setSmtpPass(e.target.value)} placeholder="••••••••••••" className="rounded-xl border-slate-200 text-xs" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: WhatsApp Meta Config */}
          <Card className="border-none shadow-xl bg-white/70 backdrop-blur-sm card-hover-premium rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                <MessageSquare className="h-5 w-5 text-indigo-600" />
                Meta WhatsApp Cloud API (Production)
              </CardTitle>
              <CardDescription className="text-xs">Identifiants d&apos;envoi WhatsApp officiels de l&apos;école</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-500 uppercase">Jeton d&apos;accès permanent Meta (Access Token)</Label>
                <Input value={waToken} onChange={(e) => setWaToken(e.target.value)} placeholder="EAAG..." className="font-mono rounded-xl border-slate-200 text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-500 uppercase">WhatsApp Phone Number ID</Label>
                <Input value={waPhoneId} onChange={(e) => setWaPhoneId(e.target.value)} placeholder="e.g. 10984877..." className="font-mono rounded-xl border-slate-200 text-xs" />
              </div>

              <Separator className="my-4" />
              <div className="space-y-3 bg-indigo-50/40 p-4 rounded-2xl border border-indigo-50">
                <h4 className="text-xs font-bold text-indigo-800 uppercase flex items-center gap-1.5">
                  <Key className="h-4 w-4" /> Diagnostic d&apos;envoi réel
                </h4>
                <p className="text-[10px] text-indigo-600 font-medium">Saisissez un numéro de téléphone réel pour envoyer un message de diagnostic et vérifier la bonne configuration de vos accès Meta.</p>
                <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                  <Input 
                    type="text" 
                    value={waTestPhone} 
                    onChange={(e) => setWaTestPhone(e.target.value)} 
                    placeholder="e.g. +2250141551665" 
                    className="rounded-xl border-slate-200 text-xs bg-white flex-1"
                  />
                  <Button type="button" onClick={handleTestWhatsApp} disabled={testingWa} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 text-xs font-bold shrink-0 border-none">
                    {testingWa ? "Envoi..." : "Tester l'envoi"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info & Stats */}
        <div className="space-y-6">
          {/* Logo Card */}
          <Card className="border-none shadow-xl bg-white/70 backdrop-blur-sm card-hover-premium rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-800">Logo Établissement</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex aspect-square items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/30 overflow-hidden">
                <div className="text-center p-4">
                  <Building2 className="mx-auto h-12 w-12 text-slate-400" />
                  <p className="mt-2 text-xs text-slate-400 font-bold uppercase tracking-wider">Logo non défini</p>
                </div>
              </div>
              <Button variant="outline" className="w-full gap-2 border-slate-200 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-700 h-10">
                <Upload className="h-4 w-4 text-slate-500" />
                Téléverser un logo
              </Button>
            </CardContent>
          </Card>

          {/* Real Statistics Card */}
          <Card className="border-none shadow-xl bg-white/70 backdrop-blur-sm card-hover-premium rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-800">Effectifs de l&apos;École</CardTitle>
              <CardDescription className="text-xs">Statistiques réelles en base de données</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {[
                { label: "Élèves inscrits", value: stats.students, icon: GraduationCap, bg: "bg-blue-500/10", color: "text-blue-600" },
                { label: "Enseignants", value: stats.teachers, icon: BookOpen, bg: "bg-purple-500/10", color: "text-purple-600" },
                { label: "Parents d'élèves", value: stats.parents, icon: Users, bg: "bg-emerald-500/10", color: "text-emerald-600" },
                { label: "Classes actives", value: stats.classes, icon: School, bg: "bg-amber-500/10", color: "text-amber-600" },
              ].map((stat, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 transition-all duration-300 hover:bg-white hover:shadow-md">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-xl ${stat.bg} p-2.5 flex items-center justify-center`}>
                      <stat.icon className={`h-4.5 w-4.5 ${stat.color}`} />
                    </div>
                    <span className="font-bold text-xs text-slate-700 uppercase tracking-wider">{stat.label}</span>
                  </div>
                  <span className="text-xl font-black text-slate-800 stat-number">{stat.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* School Year Card */}
          <Card className="border-none shadow-xl bg-white/70 backdrop-blur-sm card-hover-premium rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-800">📚 Année scolaire</CardTitle>
                <CardDescription className="text-xs">Gérez la période scolaire active</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={handleResetForNewYear} className="h-8 border-slate-200 hover:bg-slate-50 text-[10px] font-bold rounded-lg">
                Nouvelle
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-500 uppercase">Année scolaire</Label>
                <Input value={calculatedLabel || "Auto-généré"} readOnly className="font-mono rounded-xl border-slate-200 text-xs bg-slate-50/50 cursor-not-allowed" />
              </div>
              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-500 uppercase">Date de début</Label>
                  <Input type="date" value={syStartDate} onChange={(e) => setSyStartDate(e.target.value)} className="rounded-xl border-slate-200 text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-500 uppercase">Date de fin</Label>
                  <Input type="date" value={syEndDate} onChange={(e) => setSyEndDate(e.target.value)} className="rounded-xl border-slate-200 text-xs" />
                </div>
              </div>

              {durationInMonths > 0 && (
                <p className="text-[10px] text-slate-500 font-bold">Durée calculée : {durationInMonths} mois</p>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-500 uppercase">Statut</Label>
                <Select value={syStatus} onValueChange={setSyStatus}>
                  <SelectTrigger className="rounded-xl border-slate-200 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="DRAFT">⚪ Brouillon (DRAFT)</SelectItem>
                    <SelectItem value="ACTIVE">🟢 Active (ACTIVE)</SelectItem>
                    <SelectItem value="CLOSED">🔴 Clôturée (CLOSED)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="button" onClick={handleSaveSchoolYear} disabled={savingSy} className="w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-2 mt-2 border-none">
                {savingSy ? "Enregistrement..." : "Enregistrer l'année scolaire"}
              </Button>
            </CardContent>
          </Card>

          {/* Academic Years History */}
          <Card className="border-none shadow-xl bg-white/70 backdrop-blur-sm card-hover-premium rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-800">Historique des Années Scolaires</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              {schoolYears.length > 0 ? (
                schoolYears.map((year) => {
                  const isActive = year.status === "ACTIVE"
                  const isClosed = year.status === "CLOSED"
                  return (
                    <div 
                      key={year.id} 
                      onClick={() => handleSelectYearFromHistory(year)}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md cursor-pointer transition-all flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-700">{year.label}</span>
                          <Badge className={`text-[8px] px-1.5 py-0.5 rounded border-none ${
                            isActive ? "bg-emerald-500 text-white" :
                            isClosed ? "bg-rose-500 text-white" : "bg-slate-400 text-white"
                          }`}>
                            {year.status}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                          {new Date(year.startDate).toLocaleDateString()} → {new Date(year.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-xs text-slate-400 font-medium italic text-center py-4">
                  Aucune année scolaire configurée.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
