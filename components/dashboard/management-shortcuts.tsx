"use client"

import { useState } from "react"
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
  broadcastAnnouncementAction 
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

  const handleAction = async (actionName: string, formData: any, fn: Function) => {
    setLoading(actionName)
    try {
      const res = await fn(formData)
      if (res.success) {
        toast.success("Opération réussie !", {
            description: "Les données ont été mises à jour dans la base."
        })
        setOpenDialog(null)
      } else {
        toast.error("Erreur", { description: res.error })
      }
    } catch (e) {
      toast.error("Erreur critique", { description: "Une erreur inattendue est survenue." })
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
        <form className="grid gap-4 py-4" onSubmit={async (e) => {
           e.preventDefault()
           const fd = new FormData(e.currentTarget)
           await handleAction("student", Object.fromEntries(fd), addStudentAction)
        }}>
           <div className="grid gap-2">
              <Label htmlFor="nom">Nom complet</Label>
              <Input id="nom" name="nom" placeholder="Ex: Jean Dupont" required />
           </div>
           <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="jean@exemple.com" required />
           </div>
           <div className="grid gap-2">
              <Label htmlFor="password">Mot de passe provisoire</Label>
              <Input id="password" name="password" type="password" required />
           </div>
           <div className="grid gap-2">
              <Label>Classe d&apos;affectation</Label>
              <Select name="id_classe" required>
                 <SelectTrigger><SelectValue placeholder="Choisir une classe" /></SelectTrigger>
                 <SelectContent>
                    {data.classes.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.nom} ({c.niveau})</SelectItem>)}
                 </SelectContent>
              </Select>
           </div>
           <DialogFooter>
              <Button type="submit" disabled={loading === 'student'}>
                 {loading === 'student' ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />} 
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
        <form className="grid gap-4 py-4" onSubmit={async (e) => {
           e.preventDefault()
           const fd = new FormData(e.currentTarget)
           await handleAction("invoice", Object.fromEntries(fd), issueInvoiceAction)
        }}>
           <div className="grid gap-2">
              <Label>Élève concerné</Label>
              <Select name="id_utilisateur" required>
                 <SelectTrigger><SelectValue placeholder="Choisir l'élève" /></SelectTrigger>
                 <SelectContent>
                    {data.students.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.nom}</SelectItem>)}
                 </SelectContent>
              </Select>
           </div>
           <div className="grid gap-2">
              <Label htmlFor="montant">Montant (FCFA)</Label>
              <Input id="montant" name="montant" type="number" placeholder="50000" required />
           </div>
           <div className="grid gap-2">
              <Label>Type de frais</Label>
              <Select name="type" defaultValue="scolarite" required>
                 <SelectTrigger><SelectValue /></SelectTrigger>
                 <SelectContent>
                    <SelectItem value="scolarite">Scolarité</SelectItem>
                    <SelectItem value="inscription">Frais d&apos;inscription</SelectItem>
                    <SelectItem value="examen">Frais d&apos;examen</SelectItem>
                 </SelectContent>
              </Select>
           </div>
           <DialogFooter>
              <Button type="submit" variant="default" disabled={loading === 'invoice'}>
                 {loading === 'invoice' ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />} 
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
        <form className="grid gap-4 py-4" onSubmit={async (e) => {
           e.preventDefault()
           const fd = new FormData(e.currentTarget)
           await handleAction("schedule", Object.fromEntries(fd), scheduleClassAction)
        }}>
           <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                 <Label>Classe</Label>
                 <Select name="id_classe" required>
                    <SelectTrigger><SelectValue placeholder="Classe" /></SelectTrigger>
                    <SelectContent>
                       {data.classes.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.nom}</SelectItem>)}
                    </SelectContent>
                 </Select>
              </div>
              <div className="grid gap-2">
                 <Label>Professeur</Label>
                 <Select name="id_enseignant" required>
                    <SelectTrigger><SelectValue placeholder="Prof" /></SelectTrigger>
                    <SelectContent>
                       {data.teachers.map(t => <SelectItem key={t.id} value={t.id.toString()}>{t.nom}</SelectItem>)}
                    </SelectContent>
                 </Select>
              </div>
           </div>
           <div className="grid gap-2">
              <Label htmlFor="matiere">Matière</Label>
              <Input id="matiere" name="matiere" placeholder="Ex: Mathématiques" required />
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                 <Label>Jour</Label>
                 <Select name="jour" defaultValue="Lundi" required>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                       {["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"].map(j => <SelectItem key={j} value={j}>{j}</SelectItem>)}
                    </SelectContent>
                 </Select>
              </div>
              <div className="grid gap-2">
                 <Label htmlFor="salle">Salle</Label>
                 <Input id="salle" name="salle" placeholder="Ex: 204" />
              </div>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                 <Label htmlFor="heure_debut">Début</Label>
                 <Input id="heure_debut" name="heure_debut" type="time" required />
              </div>
              <div className="grid gap-2">
                 <Label htmlFor="heure_fin">Fin</Label>
                 <Input id="heure_fin" name="heure_fin" type="time" required />
              </div>
           </div>
           <DialogFooter>
              <Button type="submit" disabled={loading === 'schedule'}>
                 {loading === 'schedule' ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />} 
                 Planifier
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
        <form className="grid gap-4 py-4" onSubmit={async (e) => {
           e.preventDefault()
           const fd = new FormData(e.currentTarget)
           const vals = Object.fromEntries(fd)
           await handleAction("announce", { ...vals, id_auteur: adminId }, broadcastAnnouncementAction)
        }}>
           <div className="grid gap-2">
              <Label htmlFor="titre">Titre de l&apos;annonce</Label>
              <Input id="titre" name="titre" placeholder="Ex: Rappel Conseil de Classe" required />
           </div>
           <div className="grid gap-2">
              <Label>Cible</Label>
              <Select name="cible" defaultValue="tous" required>
                 <SelectTrigger><SelectValue /></SelectTrigger>
                 <SelectContent>
                    <SelectItem value="tous">Tous</SelectItem>
                    <SelectItem value="enseignants">Enseignants uniquement</SelectItem>
                    <SelectItem value="eleves">Élèves uniquement</SelectItem>
                    <SelectItem value="parents">Parents uniquement</SelectItem>
                 </SelectContent>
              </Select>
           </div>
           <div className="grid gap-2">
              <Label htmlFor="message">Contenu du message</Label>
              <Textarea id="message" name="message" placeholder="Écrivez votre message ici..." className="min-h-[100px]" required />
           </div>
           <DialogFooter>
              <Button type="submit" variant="default" disabled={loading === 'announce'}>
                 {loading === 'announce' ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Megaphone className="mr-2 h-4 w-4" />} 
                 Diffuser
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
            onOpenChange={(open) => setOpenDialog(open ? shortcut.id : null)}
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
