"use client"

import { useState, useEffect } from "react"
import { 
  Users, 
  Search, 
  Plus, 
  MoreHorizontal,
  Mail,
  Shield,
  GraduationCap,
  BookOpen,
  UserCheck,
  Filter,
  Download,
  Trash2,
  Edit,
  Eye,
  Loader2,
  Calendar,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { getAllUsersAction, addUserAction, deleteUserAction, updateUserAction } from "@/lib/admin-shortcut-actions"
import { toast } from "sonner"

const roleConfig = {
  admin: { label: "Admin", color: "bg-rose-500/10 text-rose-600 border-rose-200", icon: Shield },
  teacher: { label: "Enseignant", color: "bg-primary/10 text-primary border-primary/20", icon: BookOpen },
  student: { label: "Élève", color: "bg-purple-500/10 text-purple-600 border-purple-200", icon: GraduationCap },
  parent: { label: "Parent", color: "bg-emerald-500/10 text-emerald-600 border-emerald-200", icon: UserCheck },
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  // Sub-actions modal state
  const [selectedProfileUser, setSelectedProfileUser] = useState<any>(null)
  const [selectedEditUser, setSelectedEditUser] = useState<any>(null)
  const [userToDelete, setUserToDelete] = useState<any>(null)
  const [editFormData, setEditFormData] = useState({ nom: "", email: "", role: "student" })

  const fetchUsers = async () => {
    setLoading(true)
    const res = await getAllUsersAction()
    if (res.success) {
      setUsers(res.data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleAddUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setActionLoading(true)
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData)
    
    const res = await addUserAction(data)
    if (res.success) {
      toast.success("Utilisateur ajouté avec succès")
      setIsAddUserOpen(false)
      fetchUsers()
    } else {
      toast.error(res.error || "Erreur lors de l'ajout")
    }
    setActionLoading(false)
  }

  const handleOpenEdit = (user: any) => {
    setSelectedEditUser(user)
    setEditFormData({
      nom: user.nom || "",
      email: user.email || "",
      role: user.role || "student"
    })
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEditUser) return
    setActionLoading(true)

    const res = await updateUserAction(selectedEditUser.id, editFormData)
    if (res.success) {
      toast.success("Utilisateur mis à jour avec succès")
      setSelectedEditUser(null)
      fetchUsers()
    } else {
      toast.error(res.error || "Erreur de mise à jour")
    }
    setActionLoading(false)
  }

  const handleDeleteUserConfirm = async () => {
    if (!userToDelete) return
    setActionLoading(true)
    
    const res = await deleteUserAction(userToDelete.id)
    if (res.success) {
      toast.success("Utilisateur supprimé de la base de données")
      setUserToDelete(null)
      fetchUsers()
    } else {
      toast.error(res.error || "Erreur lors de la suppression")
    }
    setActionLoading(false)
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.nom || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (user.email || "").toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  return (
    <div className="space-y-6 p-4 md:p-8 animate-in fade-in duration-700 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestion des utilisateurs</h1>
          <p className="text-sm text-slate-500">Administrez tous les comptes et accès de l&apos;établissement</p>
        </div>
        <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-2xl shadow-lg font-bold bg-primary text-white hover:bg-primary/90 border-none">
              <Plus className="h-4 w-4" />
              Nouvel utilisateur
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-3xl">
            <form onSubmit={handleAddUser}>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Ajouter un utilisateur</DialogTitle>
                <DialogDescription>
                  Créez un nouveau compte utilisateur sur la plateforme MonÉcole+
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="nom">Nom complet</Label>
                  <Input id="nom" name="nom" placeholder="Jean Dupont" className="rounded-xl" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="jean.dupont@ecole.fr" className="rounded-xl" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input id="password" name="password" type="password" className="rounded-xl" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Rôle</Label>
                  <Select name="role" required>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Sélectionner un rôle" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="teacher">Enseignant</SelectItem>
                      <SelectItem value="student">Élève</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="admin">Administrateur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddUserOpen(false)} className="rounded-xl">Annuler</Button>
                <Button type="submit" disabled={actionLoading} className="rounded-xl bg-primary text-white font-bold border-none">
                   {actionLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "Créer le compte"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-slate-200 rounded-3xl shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">{users.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-slate-200 rounded-3xl shadow-sm bg-white">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 gap-4 flex-col sm:flex-row">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input 
                  placeholder="Rechercher un utilisateur..." 
                  className="pl-9 rounded-2xl border-slate-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-[200px] rounded-2xl border-slate-200">
                  <Filter className="mr-2 h-4 w-4 text-slate-400" />
                  <SelectValue placeholder="Filtrer par rôle" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="all">Tous les rôles</SelectItem>
                  <SelectItem value="admin">Administrateurs</SelectItem>
                  <SelectItem value="teacher">Enseignants</SelectItem>
                  <SelectItem value="student">Élèves</SelectItem>
                  <SelectItem value="parent">Parents</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" className="gap-2 rounded-2xl border-slate-200 hover:bg-slate-50">
              <Download className="h-4 w-4" />
              Exporter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
        <CardContent className="p-0">
          {loading ? (
             <div className="p-20 flex justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent bg-slate-50/50">
                  <TableHead className="font-bold text-slate-600 text-xs">Utilisateur</TableHead>
                  <TableHead className="font-bold text-slate-600 text-xs">Rôle</TableHead>
                  <TableHead className="font-bold text-slate-600 text-xs">Date création</TableHead>
                  <TableHead className="text-right font-bold text-slate-600 text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const roleKey = user.role as keyof typeof roleConfig
                  const config = roleConfig[roleKey] || roleConfig.student
                  const RoleIcon = config.icon

                  return (
                    <TableRow key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border border-slate-100">
                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                              {user.nom ? user.nom.split(' ').map((n: string) => n[0]).join('') : "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{user.nom}</p>
                            <p className="text-xs text-slate-500 font-medium">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`gap-1 font-bold text-xs px-2.5 py-0.5 rounded-full ${config.color}`}>
                          <RoleIcon className="h-3.5 w-3.5" />
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-500 text-xs font-medium">
                        {new Date(user.created_at).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 rounded-full hover:bg-slate-100">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-2xl border-slate-100 shadow-xl p-1.5 min-w-[170px]">
                            <DropdownMenuLabel className="text-xs font-bold text-slate-400">Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="gap-2 cursor-pointer rounded-xl font-medium text-xs text-slate-700 py-2"
                              onClick={() => setSelectedProfileUser(user)}
                            >
                              <Eye className="h-4 w-4 text-primary" /> Voir le profil
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="gap-2 cursor-pointer rounded-xl font-medium text-xs text-slate-700 py-2"
                              onClick={() => handleOpenEdit(user)}
                            >
                              <Edit className="h-4 w-4 text-amber-600" /> Modifier
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="gap-2 cursor-pointer rounded-xl font-bold text-xs text-rose-600 focus:bg-rose-50 py-2"
                              onClick={() => setUserToDelete(user)}
                            >
                              <Trash2 className="h-4 w-4" /> Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="py-16 text-center text-slate-400 italic">
                      Aucun utilisateur trouvé.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 1. VOIR LE PROFIL MODAL */}
      <Dialog open={!!selectedProfileUser} onOpenChange={(open) => !open && setSelectedProfileUser(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          {selectedProfileUser && (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Profil Utilisateur</DialogTitle>
              </DialogHeader>

              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <Avatar className="h-16 w-16 border-2 border-white shadow-md">
                  <AvatarFallback className="bg-primary text-white font-black text-xl">
                    {selectedProfileUser.nom ? selectedProfileUser.nom.split(' ').map((n: string) => n[0]).join('') : "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-black text-slate-900 text-lg">{selectedProfileUser.nom}</h3>
                  <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                    <Mail className="h-3.5 w-3.5 text-primary" /> {selectedProfileUser.email}
                  </p>
                  <div className="mt-2">
                    <Badge variant="secondary" className={`gap-1 font-bold text-xs px-2.5 py-0.5 rounded-full ${roleConfig[selectedProfileUser.role as keyof typeof roleConfig]?.color || 'bg-slate-100 text-slate-700'}`}>
                      {roleConfig[selectedProfileUser.role as keyof typeof roleConfig]?.label || selectedProfileUser.role}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">ID Utilisateur :</span>
                  <span className="font-bold text-slate-800">#{selectedProfileUser.id}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Date de création :</span>
                  <span className="font-bold text-slate-800">{new Date(selectedProfileUser.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
                {selectedProfileUser.matiere && (
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Matière Enseignée :</span>
                    <span className="font-bold text-primary">{selectedProfileUser.matiere}</span>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button className="w-full rounded-2xl font-bold bg-primary text-white border-none" onClick={() => setSelectedProfileUser(null)}>
                  Fermer
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 2. MODIFIER USER MODAL */}
      <Dialog open={!!selectedEditUser} onOpenChange={(open) => !open && setSelectedEditUser(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          {selectedEditUser && (
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Modifier l&apos;utilisateur</DialogTitle>
                <DialogDescription>
                  Modifiez les informations personnelles et le rôle de {selectedEditUser.nom}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-nom">Nom complet</Label>
                  <Input 
                    id="edit-nom" 
                    className="rounded-xl"
                    value={editFormData.nom}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, nom: e.target.value }))}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input 
                    id="edit-email" 
                    type="email"
                    className="rounded-xl"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Rôle</Label>
                  <Select 
                    value={editFormData.role}
                    onValueChange={(val) => setEditFormData(prev => ({ ...prev, role: val }))}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="teacher">Enseignant</SelectItem>
                      <SelectItem value="student">Élève</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="admin">Administrateur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setSelectedEditUser(null)} className="rounded-xl">Annuler</Button>
                <Button type="submit" disabled={actionLoading} className="rounded-xl bg-primary text-white font-bold border-none">
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer les modifications"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* 3. SUPPRIMER USER CONFIRMATION MODAL */}
      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent className="rounded-3xl p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-rose-600">Supprimer l&apos;utilisateur ?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 text-sm">
              Cette action est irréversible. Êtes-vous sûr de vouloir supprimer définitivement le compte de <strong className="text-slate-900">{userToDelete?.nom}</strong> ({userToDelete?.email}) ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="rounded-xl font-bold">Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteUserConfirm}
              disabled={actionLoading}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold border-none shadow-lg shadow-rose-200"
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Supprimer définitivement"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
