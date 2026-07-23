"use client"

import { useState, useEffect } from "react"
import { 
  Users, 
  Search, 
  Plus, 
  MoreHorizontal,
  Mail,
  GraduationCap,
  Download,
  Trash2,
  Edit,
  Eye,
  BookOpen,
  Calendar,
  Loader2,
  School,
  AlertTriangle,
  CheckCircle2,
  UserCheck
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
import { getStudentsAction, addStudentAction, deleteUserAction, updateUserAction, getShortcutMetaData } from "@/lib/admin-shortcut-actions"
import { toast } from "sonner"

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<any>(null)
  const [studentToDelete, setStudentToDelete] = useState<any>(null)
  const [selectedProfileStudent, setSelectedProfileStudent] = useState<any>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const router = useRouter()

  const fetchData = async () => {
    setLoading(true)
    const [studentRes, metaRes] = await Promise.all([
      getStudentsAction(),
      getShortcutMetaData()
    ])
    
    if (studentRes.success) setStudents(studentRes.data || [])
    if (metaRes.success) setClasses(metaRes.data.classes || [])
    
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAddStudent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setActionLoading(true)
    const formData = new FormData(e.currentTarget)
    
    const res = await addStudentAction(Object.fromEntries(formData))
    if (res.success) {
      toast.success("Élève ajouté avec succès")
      setIsAddStudentOpen(false)
      fetchData()
    } else {
      toast.error(res.error || "Erreur lors de l'ajout")
    }
    setActionLoading(false)
  }

  const handleUpdateStudent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingStudent) return
    setActionLoading(true)
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData)
    
    const res = await updateUserAction(editingStudent.id, data)
    if (res.success) {
      toast.success("Élève mis à jour")
      setEditingStudent(null)
      fetchData()
    } else {
      toast.error(res.error || "Erreur lors de la mise à jour")
    }
    setActionLoading(false)
  }

  const handleDeleteStudent = async () => {
    if (!studentToDelete) return
    setActionLoading(true)
    const res = await deleteUserAction(studentToDelete.id)
    if (res.success) {
      toast.success("Élève supprimé avec succès")
      setStudentToDelete(null)
      fetchData()
    } else {
      toast.error(res.error || "Erreur lors de la suppression")
    }
    setActionLoading(false)
  }

  const handleExport = () => {
    const headers = ["ID", "Nom", "Email", "Classe", "Statut"]
    const csvData = filteredStudents.map(s => [
      s.id,
      s.nom,
      s.email,
      s.inscriptions?.[0]?.classe?.nom || "N/A",
      "Actif"
    ])
    
    const csvContent = [headers, ...csvData].map(e => e.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `eleves_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Liste exportée avec succès")
  }

  const filteredStudents = students.filter(student => {
    const matchesSearch = (student.nom || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (student.email || "").toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  return (
    <div className="space-y-6 p-4 md:p-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Gestion des Élèves</h1>
          <p className="text-slate-500 font-medium">Administrez les inscriptions et le suivi des élèves</p>
        </div>
        <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 rounded-xl px-6 text-white border-none">
              <Plus className="h-4 w-4" />
              Nouvel Élève
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-3xl">
            <form onSubmit={handleAddStudent}>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Ajouter un élève</DialogTitle>
                <DialogDescription>
                  Créez un nouveau compte élève.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="nom">Nom complet</Label>
                  <Input id="nom" name="nom" placeholder="Ex: Lucas Bernard" className="rounded-xl" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="lucas.b@ecole.fr" className="rounded-xl" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input id="password" name="password" type="password" placeholder="••••••••" className="rounded-xl" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="id_classe">Classe initiale</Label>
                  <Select name="id_classe">
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Sélectionner une classe" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map(c => (
                        <SelectItem key={c.id} value={c.id.toString()}>{c.nom} ({c.niveau})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddStudentOpen(false)} className="rounded-xl">Annuler</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl border-none" disabled={actionLoading}>
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Inscrire l'élève"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Full Profile Modal */}
        <Dialog open={!!selectedProfileStudent} onOpenChange={(open) => !open && setSelectedProfileStudent(null)}>
          <DialogContent className="sm:max-w-lg rounded-3xl p-6">
            {selectedProfileStudent && (
              <div className="space-y-6">
                <DialogHeader>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-indigo-100 shadow-md">
                      <AvatarFallback className="bg-indigo-600 text-white font-black text-xl">
                        {selectedProfileStudent.nom ? selectedProfileStudent.nom.split(' ').map((n: string) => n[0]).join('') : "E"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <DialogTitle className="text-2xl font-black text-slate-800">{selectedProfileStudent.nom}</DialogTitle>
                      <DialogDescription className="text-sm text-slate-500 font-medium">
                        {selectedProfileStudent.email}
                      </DialogDescription>
                      <Badge className="mt-1 bg-emerald-500 text-white border-none text-[10px] rounded-full">Élève Actif</Badge>
                    </div>
                  </div>
                </DialogHeader>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Classe Affectée</p>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">
                      {selectedProfileStudent.inscriptions?.[0]?.classe?.nom || "Non inscrit"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Niveau Scolaire</p>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">
                      {selectedProfileStudent.inscriptions?.[0]?.classe?.niveau || "Général"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Date d&apos;inscription</p>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">
                      {selectedProfileStudent.created_at ? new Date(selectedProfileStudent.created_at).toLocaleDateString("fr-FR") : "Récente"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Taux de Présence</p>
                    <p className="font-bold text-emerald-600 text-sm mt-0.5">94%</p>
                  </div>
                </div>

                {/* Quick Actions inside Profile */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    className="flex-1 rounded-xl gap-2 h-11"
                    onClick={() => {
                      const student = selectedProfileStudent
                      setSelectedProfileStudent(null)
                      router.push(`/dashboard/messages?to=${student.id}`)
                    }}
                  >
                    <Mail className="h-4 w-4 text-indigo-600" />
                    Envoyer un message
                  </Button>
                  <Button 
                    className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white gap-2 border-none h-11"
                    onClick={() => {
                      setSelectedProfileStudent(null)
                      router.push(`/dashboard/documents/bulletin`)
                    }}
                  >
                    <BookOpen className="h-4 w-4" />
                    Voir Bulletin
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={!!editingStudent} onOpenChange={(open) => !open && setEditingStudent(null)}>
          <DialogContent className="sm:max-w-md rounded-3xl">
            {editingStudent && (
              <form onSubmit={handleUpdateStudent}>
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">Modifier l&apos;élève</DialogTitle>
                  <DialogDescription>
                    Mettez à jour les informations de {editingStudent.nom}.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-nom">Nom complet</Label>
                    <Input id="edit-nom" name="nom" defaultValue={editingStudent.nom} className="rounded-xl" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-email">Email</Label>
                    <Input id="edit-email" name="email" type="email" defaultValue={editingStudent.email} className="rounded-xl" required />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setEditingStudent(null)} className="rounded-xl">Annuler</Button>
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl border-none" disabled={actionLoading}>
                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer"}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!studentToDelete} onOpenChange={(open) => !open && setStudentToDelete(null)}>
          <AlertDialogContent className="rounded-3xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Confirmer la suppression
              </AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer l&apos;élève <strong>{studentToDelete?.nom}</strong> ? Cette action est irréversible et supprimera définitivement son compte et ses données.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteStudent}
                className="bg-destructive hover:bg-destructive/90 rounded-xl text-white border-none"
                disabled={actionLoading}
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Supprimer"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total Élèves", value: students.length, icon: GraduationCap, color: "text-indigo-600", bg: "bg-indigo-500/10" },
          { label: "Nouveaux (Mois)", value: "0", icon: Plus, color: "text-emerald-600", bg: "bg-emerald-500/10" },
          { label: "Classes Actives", value: classes.length, icon: School, color: "text-amber-600", bg: "bg-amber-500/10" },
          { label: "Taux Présence", value: "94%", icon: Calendar, color: "text-rose-600", bg: "bg-rose-500/10" },
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
              Exporter Liste
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
                  <TableHead className="font-bold text-slate-800">Élève</TableHead>
                  <TableHead className="font-bold text-slate-800">Classe</TableHead>
                  <TableHead className="font-bold text-slate-800">Moyenne</TableHead>
                  <TableHead className="font-bold text-slate-800">Statut</TableHead>
                  <TableHead className="text-right font-bold text-slate-800">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-slate-500">
                      Aucun élève trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => {
                    const currentInscription = student.inscriptions?.[0]
                    return (
                      <TableRow key={student.id} className="group hover:bg-slate-50/50 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                              <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold">
                                {student.nom ? student.nom.split(' ').map((n: string) => n[0]).join('') : "E"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-bold text-slate-800">{student.nom}</p>
                              <p className="text-xs text-slate-500">{student.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-none rounded-full">
                            {currentInscription?.classe?.nom || "Non inscrit"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-bold text-slate-700">--/20</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-bold text-emerald-600">Actif</span>
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
                                onClick={() => setSelectedProfileStudent(student)}
                              >
                                <Eye className="h-4 w-4 text-blue-500" /> Profil Complet
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2 rounded-xl cursor-pointer" onClick={() => setEditingStudent(student)}>
                                <Edit className="h-4 w-4 text-amber-500" /> Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="gap-2 rounded-xl cursor-pointer"
                                onClick={() => router.push("/dashboard/documents/bulletin")}
                              >
                                <BookOpen className="h-4 w-4 text-indigo-500" /> Bulletin
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="gap-2 rounded-xl cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                                onClick={() => setStudentToDelete(student)}
                              >
                                <Trash2 className="h-4 w-4" /> Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
