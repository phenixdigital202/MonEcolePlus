"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { 
  UserPlus, 
  Receipt, 
  CalendarPlus, 
  Megaphone,
  PlusCircle,
  Loader2,
  CheckCircle2
} from "lucide-react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { 
  addStudentAction, 
  issueInvoiceAction, 
  scheduleClassAction, 
  broadcastAnnouncementAction,
  getShortcutMetaData
} from "@/lib/admin-shortcut-actions"
import { cn } from "@/lib/utils"

interface ManagementShortcutsProps {
  data: {
    classes: any[]
    teachers: any[]
    students: any[]
  }
  adminId: number
}

export function ManagementShortcuts({ data, adminId }: ManagementShortcutsProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [openDialog, setOpenDialog] = useState<string | null>(null)
  const [metaData, setMetaData] = useState(data)

  // Fetch fresh metadata if initial data arrays are empty
  useEffect(() => {
    if (!data || !data.classes || data.classes.length === 0 || !data.students || data.students.length === 0) {
      getShortcutMetaData().then(res => {
        if (res.success && res.data) {
          setMetaData(res.data)
        }
      }).catch(err => console.error("[ManagementShortcuts] metadata fetch error:", err))
    } else {
      setMetaData(data)
    }
  }, [data])

  // Controlled states for forms
  // 1. Student Form State
  const [studentNom, setStudentNom] = useState("")
  const [studentEmail, setStudentEmail] = useState("")
  const [studentPassword, setStudentPassword] = useState("")
  const [studentClassId, setStudentClassId] = useState("")

  // 2. Invoice Form State
  const [invoiceStudentId, setInvoiceStudentId] = useState("")
  const [invoiceAmount, setInvoiceAmount] = useState("")
  const [invoiceType, setInvoiceType] = useState("scolarite")

  // 3. Schedule Form State
  const [scheduleClassId, setScheduleClassId] = useState("")
  const [scheduleTeacherId, setScheduleTeacherId] = useState("")
  const [scheduleSubject, setScheduleSubject] = useState("")
  const [scheduleDay, setScheduleDay] = useState("Lundi")
  const [scheduleStartTime, setScheduleStartTime] = useState("08:00")
  const [scheduleEndTime, setScheduleEndTime] = useState("10:00")
  const [scheduleSalle, setScheduleSalle] = useState("Salle 1")

  // 4. Announcement Form State
  const [announceTitle, setAnnounceTitle] = useState("")
  const [announceCible, setAnnounceCible] = useState("tous")
  const [announceMessage, setAnnounceMessage] = useState("")

  const resetForms = () => {
    setStudentNom("")
    setStudentEmail("")
    setStudentPassword("")
    setStudentClassId("")
    setInvoiceStudentId("")
    setInvoiceAmount("")
    setInvoiceType("scolarite")
    setScheduleClassId("")
    setScheduleTeacherId("")
    setScheduleSubject("")
    setScheduleDay("Lundi")
    setScheduleStartTime("08:00")
    setScheduleEndTime("10:00")
    setScheduleSalle("Salle 1")
    setAnnounceTitle("")
    setAnnounceCible("tous")
    setAnnounceMessage("")
  }

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentNom || !studentEmail || !studentPassword) {
      toast.error("Veuillez remplir tous les champs obligatoires.")
      return
    }
    setLoading("student")
    try {
      const res = await addStudentAction({
        nom: studentNom,
        email: studentEmail,
        password: studentPassword,
        id_classe: studentClassId
      })
      if (res.success) {
        toast.success("Élève inscrit avec succès !", {
          description: `${studentNom} a été ajouté à la base de données.`
        })
        resetForms()
        setOpenDialog(null)
      } else {
        toast.error("Erreur d'inscription", { description: res.error })
      }
    } catch (err: any) {
      toast.error("Erreur critique", { description: err?.message || "Une erreur est survenue." })
    } finally {
      setLoading(null)
    }
  }

  const handleInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!invoiceStudentId || !invoiceAmount) {
      toast.error("Veuillez sélectionner un élève et indiquer un montant.")
      return
    }
    setLoading("invoice")
    try {
      const res = await issueInvoiceAction({
        id_utilisateur: invoiceStudentId,
        montant: invoiceAmount,
        type: invoiceType
      })
      if (res.success) {
        toast.success("Facture émise avec succès !", {
          description: `Facture de ${Number(invoiceAmount).toLocaleString("fr-FR")} FCFA enregistrée.`
        })
        resetForms()
        setOpenDialog(null)
      } else {
        toast.error("Erreur d'émission", { description: res.error })
      }
    } catch (err: any) {
      toast.error("Erreur critique", { description: err?.message || "Une erreur est survenue." })
    } finally {
      setLoading(null)
    }
  }

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!scheduleClassId || !scheduleTeacherId || !scheduleSubject) {
      toast.error("Veuillez sélectionner une classe, un professeur et renseigner une matière.")
      return
    }
    setLoading("schedule")
    try {
      const res = await scheduleClassAction({
        id_classe: scheduleClassId,
        id_enseignant: scheduleTeacherId,
        matiere: scheduleSubject,
        jour: scheduleDay,
        heure_debut: scheduleStartTime,
        heure_fin: scheduleEndTime,
        salle: scheduleSalle
      })
      if (res.success) {
        toast.success("Cours planifié avec succès !", {
          description: `Cours de ${scheduleSubject} programmé pour le ${scheduleDay}.`
        })
        resetForms()
        setOpenDialog(null)
      } else {
        toast.error("Erreur de planification", { description: res.error })
      }
    } catch (err: any) {
      toast.error("Erreur critique", { description: err?.message || "Une erreur est survenue." })
    } finally {
      setLoading(null)
    }
  }

  const handleAnnounceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!announceTitle || !announceMessage) {
      toast.error("Le titre et le message de l'annonce sont obligatoires.")
      return
    }
    setLoading("announce")
    try {
      const res = await broadcastAnnouncementAction({
        titre: announceTitle,
        message: announceMessage,
        cible: announceCible,
        id_auteur: adminId
      })
      if (res.success) {
        toast.success("Annonce diffusée avec succès !", {
          description: "L'annonce a été transmise aux destinataires ciblés."
        })
        resetForms()
        setOpenDialog(null)
      } else {
        toast.error("Erreur de diffusion", { description: res.error })
      }
    } catch (err: any) {
      toast.error("Erreur critique", { description: err?.message || "Une erreur est survenue." })
    } finally {
      setLoading(null)
    }
  }

  const shortcuts = [
    { 
      id: "student",
      title: "Ajouter Élève", 
      desc: "Formulaire d'inscription", 
      icon: UserPlus, 
      color: "text-blue-500", 
      bg: "bg-blue-50",
      form: (
        <form className="grid gap-4 py-4" onSubmit={handleStudentSubmit}>
           <div className="grid gap-2">
              <Label htmlFor="nom">Nom complet *</Label>
              <Input 
                id="nom" 
                value={studentNom}
                onChange={(e) => setStudentNom(e.target.value)}
                placeholder="Ex: KOUASSI Jean" 
                required 
              />
           </div>
           <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input 
                id="email" 
                type="email" 
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                placeholder="jean.kouassi@exemple.ci" 
                required 
              />
           </div>
           <div className="grid gap-2">
              <Label htmlFor="password">Mot de passe provisoire *</Label>
              <Input 
                id="password" 
                type="password" 
                value={studentPassword}
                onChange={(e) => setStudentPassword(e.target.value)}
                placeholder="••••••••" 
                required 
              />
           </div>
           <div className="grid gap-2">
              <Label>Classe d&apos;affectation</Label>
              <Select value={studentClassId} onValueChange={setStudentClassId}>
                 <SelectTrigger><SelectValue placeholder="Choisir une classe" /></SelectTrigger>
                 <SelectContent>
                    {(metaData?.classes || []).map((c: any) => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.nom} ({c.niveau})</SelectItem>
                    ))}
                 </SelectContent>
              </Select>
           </div>
           <DialogFooter>
              <Button type="submit" className="w-full rounded-xl font-bold gap-2" disabled={loading === 'student'}>
                 {loading === 'student' ? <Loader2 className="animate-spin h-4 w-4" /> : <PlusCircle className="h-4 w-4" />} 
                 Inscrire l&apos;élève
              </Button>
           </DialogFooter>
        </form>
      )
    },
    { 
      id: "invoice",
      title: "Émettre Facture", 
      desc: "Gestion scolarité", 
      icon: Receipt, 
      color: "text-emerald-500", 
      bg: "bg-emerald-50",
      form: (
        <form className="grid gap-4 py-4" onSubmit={handleInvoiceSubmit}>
           <div className="grid gap-2">
              <Label>Élève concerné *</Label>
              <Select value={invoiceStudentId} onValueChange={setInvoiceStudentId} required>
                 <SelectTrigger><SelectValue placeholder="Choisir l'élève" /></SelectTrigger>
                 <SelectContent>
                    {(metaData?.students || []).map((s: any) => (
                      <SelectItem key={s.id} value={s.id.toString()}>{s.nom}</SelectItem>
                    ))}
                 </SelectContent>
              </Select>
           </div>
           <div className="grid gap-2">
              <Label htmlFor="montant">Montant (FCFA) *</Label>
              <Input 
                id="montant" 
                type="number" 
                value={invoiceAmount}
                onChange={(e) => setInvoiceAmount(e.target.value)}
                placeholder="Ex: 50000" 
                required 
              />
           </div>
           <div className="grid gap-2">
              <Label>Type de frais *</Label>
              <Select value={invoiceType} onValueChange={setInvoiceType} required>
                 <SelectTrigger><SelectValue /></SelectTrigger>
                 <SelectContent>
                    <SelectItem value="scolarite">Scolarité</SelectItem>
                    <SelectItem value="inscription">Frais d&apos;inscription</SelectItem>
                    <SelectItem value="examen">Frais d&apos;examen</SelectItem>
                 </SelectContent>
              </Select>
           </div>
           <DialogFooter>
              <Button type="submit" className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2" disabled={loading === 'invoice'}>
                 {loading === 'invoice' ? <Loader2 className="animate-spin h-4 w-4" /> : <Receipt className="h-4 w-4" />} 
                 Générer la facture
              </Button>
           </DialogFooter>
        </form>
      )
    },
    { 
      id: "schedule",
      title: "Planifier Cours", 
      desc: "Emplois du temps", 
      icon: CalendarPlus, 
      color: "text-sky-500", 
      bg: "bg-sky-50",
      form: (
        <form className="grid gap-4 py-4" onSubmit={handleScheduleSubmit}>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                 <Label>Classe *</Label>
                 <Select value={scheduleClassId} onValueChange={setScheduleClassId} required>
                    <SelectTrigger><SelectValue placeholder="Classe" /></SelectTrigger>
                    <SelectContent>
                       {(metaData?.classes || []).map((c: any) => (
                         <SelectItem key={c.id} value={c.id.toString()}>{c.nom}</SelectItem>
                       ))}
                    </SelectContent>
                 </Select>
              </div>
              <div className="grid gap-2">
                 <Label>Professeur *</Label>
                 <Select value={scheduleTeacherId} onValueChange={setScheduleTeacherId} required>
                    <SelectTrigger><SelectValue placeholder="Professeur" /></SelectTrigger>
                    <SelectContent>
                       {(metaData?.teachers || []).map((t: any) => (
                         <SelectItem key={t.id} value={t.id.toString()}>{t.nom}</SelectItem>
                       ))}
                    </SelectContent>
                 </Select>
              </div>
           </div>
           <div className="grid gap-2">
              <Label htmlFor="matiere">Matière *</Label>
              <Input 
                id="matiere" 
                value={scheduleSubject}
                onChange={(e) => setScheduleSubject(e.target.value)}
                placeholder="Ex: Mathématiques" 
                required 
              />
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                 <Label>Jour *</Label>
                 <Select value={scheduleDay} onValueChange={setScheduleDay} required>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                       {["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"].map(j => (
                         <SelectItem key={j} value={j}>{j}</SelectItem>
                       ))}
                    </SelectContent>
                 </Select>
              </div>
              <div className="grid gap-2">
                 <Label htmlFor="salle">Salle</Label>
                 <Input 
                   id="salle" 
                   value={scheduleSalle}
                   onChange={(e) => setScheduleSalle(e.target.value)}
                   placeholder="Ex: Salle 204" 
                 />
              </div>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                 <Label htmlFor="heure_debut">Début *</Label>
                 <Input 
                   id="heure_debut" 
                   type="time" 
                   value={scheduleStartTime}
                   onChange={(e) => setScheduleStartTime(e.target.value)}
                   required 
                 />
              </div>
              <div className="grid gap-2">
                 <Label htmlFor="heure_fin">Fin *</Label>
                 <Input 
                   id="heure_fin" 
                   type="time" 
                   value={scheduleEndTime}
                   onChange={(e) => setScheduleEndTime(e.target.value)}
                   required 
                 />
              </div>
           </div>
           <DialogFooter>
              <Button type="submit" className="w-full rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold gap-2" disabled={loading === 'schedule'}>
                 {loading === 'schedule' ? <Loader2 className="animate-spin h-4 w-4" /> : <CalendarPlus className="h-4 w-4" />} 
                 Planifier le cours
              </Button>
           </DialogFooter>
        </form>
      )
    },
    { 
      id: "announce",
      title: "Diffuser Annonce", 
      desc: "Email, SMS, Mobile", 
      icon: Megaphone, 
      color: "text-amber-500", 
      bg: "bg-amber-50",
      form: (
        <form className="grid gap-4 py-4" onSubmit={handleAnnounceSubmit}>
           <div className="grid gap-2">
              <Label htmlFor="titre">Titre de l&apos;annonce *</Label>
              <Input 
                id="titre" 
                value={announceTitle}
                onChange={(e) => setAnnounceTitle(e.target.value)}
                placeholder="Ex: Rappel Conseil de Classe" 
                required 
              />
           </div>
           <div className="grid gap-2">
              <Label>Cible *</Label>
              <Select value={announceCible} onValueChange={setAnnounceCible} required>
                 <SelectTrigger><SelectValue /></SelectTrigger>
                 <SelectContent>
                    <SelectItem value="tous">Tous les utilisateurs</SelectItem>
                    <SelectItem value="enseignants">Enseignants uniquement</SelectItem>
                    <SelectItem value="eleves">Élèves uniquement</SelectItem>
                    <SelectItem value="parents">Parents uniquement</SelectItem>
                 </SelectContent>
              </Select>
           </div>
           <div className="grid gap-2">
              <Label htmlFor="message">Contenu du message *</Label>
              <Textarea 
                id="message" 
                value={announceMessage}
                onChange={(e) => setAnnounceMessage(e.target.value)}
                placeholder="Écrivez votre message ici..." 
                className="min-h-[100px]" 
                required 
              />
           </div>
           <DialogFooter>
              <Button type="submit" className="w-full rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold gap-2" disabled={loading === 'announce'}>
                 {loading === 'announce' ? <Loader2 className="animate-spin h-4 w-4" /> : <Megaphone className="h-4 w-4" />} 
                 Diffuser l&apos;annonce
              </Button>
           </DialogFooter>
        </form>
      )
    },
  ]

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-700">
      <h3 className="text-xl font-bold tracking-tight text-slate-800">Raccourcis de Gestion</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {shortcuts.map((shortcut) => (
          <Dialog 
            key={shortcut.id} 
            open={openDialog === shortcut.id} 
            onOpenChange={(open) => {
              if (!open) resetForms()
              setOpenDialog(open ? shortcut.id : null)
            }}
          >
            <DialogTrigger asChild>
              <button className="min-w-0 group relative flex items-center gap-3 md:gap-4 p-4 md:p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 text-left overflow-hidden">
                <div className={cn("absolute top-0 right-0 h-2 w-2 rounded-bl-full bg-slate-200 transition-colors group-hover:bg-primary/40")} />
                <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 group-hover:rotate-3", shortcut.bg, shortcut.color)}>
                   <shortcut.icon className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                   <p className="font-bold text-slate-800 text-sm leading-tight mb-0.5">{shortcut.title}</p>
                   <p className="text-xs text-slate-500 font-medium truncate">{shortcut.desc}</p>
                </div>
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-3xl">
              <DialogHeader>
                <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center mb-4", shortcut.bg, shortcut.color)}>
                  <shortcut.icon className="h-6 w-6" />
                </div>
                <DialogTitle className="text-xl font-black">{shortcut.title}</DialogTitle>
                <DialogDescription>
                  Effectuez cette opération rapidement. Les changements seront appliqués immédiatement.
                </DialogDescription>
              </DialogHeader>
              {shortcut.form}
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  )
}
