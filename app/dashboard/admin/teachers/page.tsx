"use client"

import { useState, useEffect } from "react"
import { 
  Users, 
  Search, 
  Plus, 
  MoreHorizontal,
  Mail,
  BookOpen,
  UserCheck,
  Filter,
  Download,
  Trash2,
  Edit,
  Eye,
  GraduationCap,
  Clock,
  Briefcase,
  Loader2,
  AlertTriangle
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { getTeachersAction, addUserAction, deleteUserAction, updateUserAction } from "@/lib/admin-shortcut-actions"
import { toast } from "sonner"

const MATIERES = [
  // Tronc Commun & Primaire
  "Français",
  "Mathématiques",
  "Éveil au milieu / Sciences",
  "Éducation artistique",
  "Instruction civique et morale",
  // Collège & Lycée
  "Histoire-Géographie",
  "Enseignement Moral et Civique (EMC)",
  "Anglais (LV1/LV2)",
  "Allemand (LV1/LV2)",
  "Espagnol (LV1/LV2)",
  "Sciences de la Vie et de la Terre (SVT)",
  "Physique-Chimie",
  "Technologie",
  "Arts Plastiques",
  "Éducation Musicale",
  "Éducation Physique et Sportive (EPS)",
  "Histoire des arts",
  "Enseignements Pratiques Interdisciplinaires (EPI)",
  "Éducation aux Droits de l'Homme et à la Citoyenneté (EDHC)",
  "Autre"
]

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<any>(null)
  const [teacherToDelete, setTeacherToDelete] = useState<any>(null)
  const [selectedProfileTeacher, setSelectedProfileTeacher] = useState<any>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const router = useRouter()

  const fetchTeachers = async () => {
    setLoading(true)
    const res = await getTeachersAction()
    if (res.success) {
      setTeachers(res.data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchTeachers()
  }, [])

  const handleAddTeacher = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setActionLoading(true)
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData)
    
    const res = await addUserAction({ ...data, role: 'teacher' })
    if (res.success) {
      toast.success("Enseignant ajouté avec succès")
      setIsAddTeacherOpen(false)
      fetchTeachers()
    } else {
      toast.error(res.error || "Erreur lors de l'ajout")
    }
    setActionLoading(false)
  }

  const handleUpdateTeacher = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingTeacher) return
    setActionLoading(true)
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData)
    
    const res = await updateUserAction(editingTeacher.id, data)
    if (res.success) {
      toast.success("Enseignant mis à jour")
      setEditingTeacher(null)
      fetchTeachers()
    } else {
      toast.error(res.error || "Erreur lors de la mise à jour")
    }
    setActionLoading(false)
  }

  const handleDeleteTeacher = async () => {
    if (!teacherToDelete) return
    setActionLoading(true)
    const res = await deleteUserAction(teacherToDelete.id)
    if (res.success) {
      toast.success("Enseignant supprimé avec succès")
      setTeacherToDelete(null)
      fetchTeachers()
    } else {
      toast.error(res.error || "Erreur lors de la suppression")
    }
    setActionLoading(false)
  }

  const handleExport = () => {
    const headers = ["ID", "Nom", "Email", "Statut"]
    const csvData = filteredTeachers.map(t => [
      t.id,
      t.nom,
      t.email,
      "Actif"
    ])
    
    const csvContent = [headers, ...csvData].map(e => e.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `enseignants_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Liste exportée avec succès")
  }

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = (teacher.nom || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (teacher.email || "").toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  return (
    <div className="space-y-6 p-4 md:p-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Gestion des Enseignants</h1>
          <p className="text-slate-500 font-medium">Administrez le corps professoral de votre établissement</p>
        </div>
        <Dialog open={isAddTeacherOpen} onOpenChange={setIsAddTeacherOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 rounded-xl px-6">
              <Plus className="h-4 w-4" />
              Nouvel Enseignant
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-3xl">
            <form onSubmit={handleAddTeacher}>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Ajouter un enseignant</DialogTitle>
                <DialogDescription>
                  Créez un nouveau compte pour un membre du corps professoral.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="nom">Nom complet</Label>
                  <Input id="nom" name="nom" placeholder="Ex: Jean Dupont" className="rounded-xl" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email professionnel</Label>
                  <Input id="email" name="email" type="email" placeholder="jean.dupont@ecole.fr" className="rounded-xl" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input id="password" name="password" type="password" placeholder="••••••••" className="rounded-xl" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="matiere">Matière</Label>
                  <Select name="matiere">
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Sélectionnez une matière" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl max-h-[300px]">
                      {MATIERES.map((matiere) => (
                        <SelectItem key={matiere} value={matiere} className="rounded-lg">
                          {matiere}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddTeacherOpen(false)} className="rounded-xl">Annuler</Button>
                <Button type="submit" className="rounded-xl" disabled={actionLoading}>
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Créer le compte"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Full Teacher Profile Modal */}
        <Dialog open={!!selectedProfileTeacher} onOpenChange={(open) => !open && setSelectedProfileTeacher(null)}>
          <DialogContent className="sm:max-w-lg rounded-3xl p-6">
            {selectedProfileTeacher && (
              <div className="space-y-6">
                <DialogHeader>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-primary/20 shadow-md">
                      <AvatarFallback className="bg-primary/10 text-primary font-black text-xl">
                        {selectedProfileTeacher.nom ? selectedProfileTeacher.nom.split(' ').map((n: string) => n[0]).join('') : "P"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <DialogTitle className="text-2xl font-black text-slate-800">{selectedProfileTeacher.nom}</DialogTitle>
                      <DialogDescription className="text-sm text-slate-500 font-medium">
                        {selectedProfileTeacher.email}
                      </DialogDescription>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-emerald-500 text-white border-none text-[10px] rounded-full">Enseignant Actif</Badge>
                        <Badge variant="outline" className="text-[10px] rounded-full font-bold">{selectedProfileTeacher.matiere || "Matière non spécifiée"}</Badge>
                      </div>
                    </div>
                  </div>
                </DialogHeader>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Matière Enseignée</p>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">
                      {selectedProfileTeacher.matiere || "Non assignée"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Classes Actives</p>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">
                      0 classe(s)
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Date d&apos;arrivée</p>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">
                      {selectedProfileTeacher.created_at ? new Date(selectedProfileTeacher.created_at).toLocaleDateString("fr-FR") : "Récente"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Volume Horaire</p>
                    <p className="font-bold text-indigo-600 text-sm mt-0.5">-- h / semaine</p>
                  </div>
                </div>

                {/* Quick Actions inside Profile */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    className="flex-1 rounded-xl gap-2 h-11"
                    onClick={() => {
                      const teacher = selectedProfileTeacher
                      setSelectedProfileTeacher(null)
                      router.push(`/dashboard/messages?to=${teacher.id}`)
                    }}
                  >
                    <Mail className="h-4 w-4 text-primary" />
                    Envoyer un message
                  </Button>
                  <Button 
                    className="flex-1 rounded-xl bg-primary hover:bg-primary/90 text-white gap-2 border-none h-11"
                    onClick={() => {
                      setSelectedProfileTeacher(null)
                      router.push(`/dashboard/schedule`)
                    }}
                  >
                    <BookOpen className="h-4 w-4" />
                    Emploi du Temps
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={!!editingTeacher} onOpenChange={(open) => !open && setEditingTeacher(null)}>
          <DialogContent className="sm:max-w-md rounded-3xl">
            {editingTeacher && (
              <form onSubmit={handleUpdateTeacher}>
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">Modifier l&apos;enseignant</DialogTitle>
                  <DialogDescription>
                    Mettez à jour les informations de {editingTeacher.nom}.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-nom">Nom complet</Label>
                    <Input id="edit-nom" name="nom" defaultValue={editingTeacher.nom} className="rounded-xl" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-email">Email professionnel</Label>
                    <Input id="edit-email" name="email" type="email" defaultValue={editingTeacher.email} className="rounded-xl" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-matiere">Matière</Label>
                    <Select name="matiere" defaultValue={editingTeacher.matiere || undefined}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Sélectionnez une matière" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl max-h-[300px]">
                        {MATIERES.map((matiere) => (
                          <SelectItem key={matiere} value={matiere} className="rounded-lg">
                            {matiere}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setEditingTeacher(null)} className="rounded-xl">Annuler</Button>
                  <Button type="submit" className="rounded-xl" disabled={actionLoading}>
                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer"}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!teacherToDelete} onOpenChange={(open) => !open && setTeacherToDelete(null)}>
          <AlertDialogContent className="rounded-3xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Confirmer la suppression
              </AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer le compte de <strong>{teacherToDelete?.nom}</strong> ? Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteTeacher}
                className="bg-destructive hover:bg-destructive/90 rounded-xl text-white border-none"
                disabled={actionLoading}
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmer la suppression"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total Enseignants", value: teachers.length, icon: BookOpen, color: "text-blue-600", bg: "bg-blue-500/10" },
          { label: "Classes Couvertes", value: "0", icon: GraduationCap, color: "text-purple-600", bg: "bg-purple-500/10" },
          { label: "Charge Moyenne", value: "0h", icon: Clock, color: "text-emerald-600", bg: "bg-emerald-500/10" },
          { label: "Postes à pourvoir", value: "2", icon: Briefcase, color: "text-amber-600", bg: "bg-amber-500/10" },
        ].map((stat, i) => (
          <Card key={i} className="border-none bg-white/50 backdrop-blur-md shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase text-slate-500 tracking-wider">{stat.label}</p>
                  <h3 className="text-2xl font-black mt-1 text-slate-800">{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-2xl ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters & Table */}
      <Card className="border-none shadow-xl bg-white/80 backdrop-blur-lg overflow-hidden rounded-3xl">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input 
                  placeholder="Rechercher par nom ou email..." 
                  className="pl-9 rounded-xl border-slate-200 bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <Button 
              variant="outline" 
              className="gap-2 rounded-xl border-slate-200 hover:bg-slate-50"
              onClick={handleExport}
            >
              <Download className="h-4 w-4" />
              Exporter CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-20 flex justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent bg-slate-50/30">
                  <TableHead className="font-bold text-slate-800">Enseignant</TableHead>
                  <TableHead className="font-bold text-slate-800">Matière</TableHead>
                  <TableHead className="font-bold text-slate-800 text-center">Classes</TableHead>
                  <TableHead className="font-bold text-slate-800">Statut</TableHead>
                  <TableHead className="text-right font-bold text-slate-800">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeachers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-slate-500">
                      Aucun enseignant trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTeachers.map((teacher) => (
                    <TableRow key={teacher.id} className="group hover:bg-slate-50/50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                              {teacher.nom ? teacher.nom.split(' ').map((n: string) => n[0]).join('') : "P"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-slate-800">{teacher.nom}</p>
                            <p className="text-xs text-slate-500">{teacher.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-none rounded-full">
                          {teacher.matiere || "À définir"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-bold text-slate-700">0</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full bg-emerald-500 animate-pulse`} />
                          <span className={`text-xs font-bold text-emerald-600`}>
                            Actif
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100">
                              <MoreHorizontal className="h-4 w-4 text-slate-500" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-2xl p-2 min-w-[160px]">
                            <DropdownMenuLabel className="text-xs text-slate-400 font-bold uppercase tracking-widest px-3 py-2">Options</DropdownMenuLabel>
                            <DropdownMenuItem 
                              className="gap-2 rounded-xl cursor-pointer"
                              onClick={() => setSelectedProfileTeacher(teacher)}
                            >
                              <Eye className="h-4 w-4 text-blue-500" /> Voir Profil
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 rounded-xl cursor-pointer" onClick={() => setEditingTeacher(teacher)}>
                              <Edit className="h-4 w-4 text-amber-500" /> Modifier
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="gap-2 rounded-xl cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                              onClick={() => setTeacherToDelete(teacher)}
                            >
                              <Trash2 className="h-4 w-4" /> Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
