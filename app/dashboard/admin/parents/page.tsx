"use client"

import { useState, useEffect } from "react"
import { 
  Users, 
  Search, 
  Plus, 
  MoreHorizontal,
  Mail,
  UserCheck,
  Filter,
  Download,
  Trash2,
  Edit,
  Eye,
  GraduationCap,
  Phone,
  Link as LinkIcon,
  Loader2
} from "lucide-react"
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
import { Label } from "@/components/ui/label"
import { getParentsAction, addUserAction, deleteUserAction, updateUserAction } from "@/lib/admin-shortcut-actions"
import { toast } from "sonner"

export default function AdminParentsPage() {
  const [parents, setParents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddParentOpen, setIsAddParentOpen] = useState(false)
  const [editingParent, setEditingParent] = useState<any>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchParents = async () => {
    setLoading(true)
    const res = await getParentsAction()
    if (res.success) {
      setParents(res.data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchParents()
  }, [])

  const handleAddParent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setActionLoading(true)
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData)
    
    const res = await addUserAction({ ...data, role: 'parent' })
    if (res.success) {
      toast.success("Parent ajouté avec succès")
      setIsAddParentOpen(false)
      fetchParents()
    } else {
      toast.error(res.error || "Erreur lors de l'ajout")
    }
    setActionLoading(false)
  }

  const handleUpdateParent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingParent) return
    setActionLoading(true)
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData)
    
    const res = await updateUserAction(editingParent.id, data)
    if (res.success) {
      toast.success("Parent mis à jour")
      setEditingParent(null)
      fetchParents()
    } else {
      toast.error(res.error || "Erreur lors de la mise à jour")
    }
    setActionLoading(false)
  }

  const handleDeleteParent = async (id: number) => {
    if (!confirm("Voulez-vous vraiment supprimer ce parent ?")) return
    
    const res = await deleteUserAction(id)
    if (res.success) {
      toast.success("Parent supprimé")
      fetchParents()
    } else {
      toast.error(res.error || "Erreur lors de la suppression")
    }
  }

  const filteredParents = parents.filter(parent => {
    const matchesSearch = (parent.nom || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (parent.email || "").toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  return (
    <div className="space-y-6 p-4 md:p-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Gestion des Parents</h1>
          <p className="text-slate-500 font-medium">Gérez les comptes parents et le suivi familial</p>
        </div>
        <Dialog open={isAddParentOpen} onOpenChange={setIsAddParentOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 rounded-xl px-6 text-white">
              <Plus className="h-4 w-4" />
              Nouveau Compte Parent
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-3xl">
            <form onSubmit={handleAddParent}>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Ajouter un parent</DialogTitle>
                <DialogDescription>
                  Créez un accès pour un responsable légal.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="nom">Nom complet</Label>
                  <Input id="nom" name="nom" placeholder="Ex: Thomas Moreau" className="rounded-xl" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="t.moreau@email.com" className="rounded-xl" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input id="password" name="password" type="password" placeholder="••••••••" className="rounded-xl" required />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddParentOpen(false)} className="rounded-xl">Annuler</Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl" disabled={actionLoading}>
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Créer le compte"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={!!editingParent} onOpenChange={(open) => !open && setEditingParent(null)}>
          <DialogContent className="sm:max-w-md rounded-3xl">
            {editingParent && (
              <form onSubmit={handleUpdateParent}>
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">Modifier le parent</DialogTitle>
                  <DialogDescription>
                    Mettez à jour les informations de {editingParent.nom}.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-nom">Nom complet</Label>
                    <Input id="edit-nom" name="nom" defaultValue={editingParent.nom} className="rounded-xl" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-email">Email</Label>
                    <Input id="edit-email" name="email" type="email" defaultValue={editingParent.email} className="rounded-xl" required />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setEditingParent(null)} className="rounded-xl">Annuler</Button>
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl" disabled={actionLoading}>
                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer"}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Total Parents", value: parents.length, icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-500/10" },
          { label: "Familles Actives", value: "0", icon: Users, color: "text-blue-600", bg: "bg-blue-500/10" },
          { label: "Taux de Connexion", value: "0%", icon: LinkIcon, color: "text-amber-600", bg: "bg-amber-500/10" },
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

      {/* Table Section */}
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
            <Button variant="outline" className="gap-2 rounded-xl border-slate-200 hover:bg-slate-50">
              <Download className="h-4 w-4" />
              Exporter
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-20 flex justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent bg-slate-50/30">
                  <TableHead className="font-bold text-slate-800">Parent</TableHead>
                  <TableHead className="font-bold text-slate-800">Enfants liés</TableHead>
                  <TableHead className="hidden md:table-cell font-bold text-slate-800">Dernière activité</TableHead>
                  <TableHead className="text-right font-bold text-slate-800">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-slate-500">
                      Aucun parent trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredParents.map((parent) => (
                    <TableRow key={parent.id} className="group hover:bg-slate-50/50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                            <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold">
                              {parent.nom.split(' ').map((n: string) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-slate-800">{parent.nom}</p>
                            <p className="text-xs text-slate-500">{parent.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(parent.parent_links || []).map((link: any, i: number) => (
                            <Badge key={i} variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 rounded-full text-[10px] font-bold">
                              <GraduationCap className="h-3 w-3 mr-1" />
                              {link.eleve.nom}
                            </Badge>
                          ))}
                          <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full hover:bg-emerald-50 text-emerald-600">
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-xs text-slate-500 font-medium">Jamais</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100">
                              <MoreHorizontal className="h-4 w-4 text-slate-500" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-2xl p-2 min-w-[160px]">
                            <DropdownMenuLabel className="text-xs text-slate-400 font-bold uppercase tracking-widest px-3 py-2">Gestion</DropdownMenuLabel>
                            <DropdownMenuItem className="gap-2 rounded-xl cursor-pointer">
                              <Eye className="h-4 w-4 text-blue-500" /> Suivi Enfants
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 rounded-xl cursor-pointer" onClick={() => setEditingParent(parent)}>
                              <Edit className="h-4 w-4 text-amber-500" /> Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 rounded-xl cursor-pointer">
                              <LinkIcon className="h-4 w-4 text-indigo-500" /> Lier un Enfant
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="gap-2 rounded-xl cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                              onClick={() => handleDeleteParent(parent.id)}
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
