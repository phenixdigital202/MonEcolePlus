"use client"

import { useState, useEffect } from "react"
import { 
  CreditCard, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Loader2,
  DollarSign,
  User,
  ArrowUpRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { getPaymentsAction, createPaymentAction, updatePaymentAction, deletePaymentAction } from "@/lib/payment-actions"
import { getAllUsersAction } from "@/lib/admin-shortcut-actions"
import { toast } from "sonner"

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const [selectedUserForPay, setSelectedUserForPay] = useState("")
  const [amount, setAmount] = useState("")
  const [paymentType, setPaymentType] = useState<"scolarite" | "inscription" | "examen">("scolarite")
  const [paymentStatus, setPaymentStatus] = useState<"paye" | "en_attente" | "annule">("paye")

  const [paymentToEdit, setPaymentToEdit] = useState<any>(null)
  const [editStatus, setEditStatus] = useState<"paye" | "en_attente" | "annule">("paye")
  const [editAmount, setEditAmount] = useState("")

  const [paymentToDelete, setPaymentToDelete] = useState<any>(null)
  const [receiptPayment, setReceiptPayment] = useState<any>(null)

  const fetchData = async () => {
    setLoading(true)
    const [payRes, userRes] = await Promise.all([
      getPaymentsAction(),
      getAllUsersAction()
    ])

    if (payRes.success) setPayments(payRes.data || [])
    if (userRes.success) setUsers(userRes.data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUserForPay || !amount || parseFloat(amount) <= 0) {
      return toast.error("Veuillez sélectionner un utilisateur et un montant valide.")
    }

    setActionLoading(true)
    const res = await createPaymentAction({
      id_utilisateur: parseInt(selectedUserForPay),
      montant: parseFloat(amount),
      type: paymentType,
      status: paymentStatus
    })

    if (res.success) {
      toast.success("Paiement créé avec succès !")
      setIsAddPaymentOpen(false)
      setAmount("")
      setSelectedUserForPay("")
      fetchData()
    } else {
      toast.error(res.error || "Erreur de création")
    }
    setActionLoading(false)
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!paymentToEdit) return

    setActionLoading(true)
    const res = await updatePaymentAction(paymentToEdit.id, {
      montant: editAmount ? parseFloat(editAmount) : undefined,
      status: editStatus
    })

    if (res.success) {
      toast.success("Paiement mis à jour")
      setPaymentToEdit(null)
      fetchData()
    } else {
      toast.error(res.error || "Erreur lors de la modification")
    }
    setActionLoading(false)
  }

  const handleDeleteConfirm = async () => {
    if (!paymentToDelete) return
    setActionLoading(true)

    const res = await deletePaymentAction(paymentToDelete.id)
    if (res.success) {
      toast.success("Paiement supprimé")
      setPaymentToDelete(null)
      fetchData()
    } else {
      toast.error(res.error || "Erreur de suppression")
    }
    setActionLoading(false)
  }

  const filteredPayments = payments.filter(p => {
    const userName = p.user?.nom || ""
    const userEmail = p.user?.email || ""
    const matchesSearch = userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          userEmail.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "all" || p.type === typeFilter
    const matchesStatus = statusFilter === "all" || p.status === statusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  // Computed stats
  const totalReceived = payments
    .filter(p => p.status === "paye")
    .reduce((sum, p) => sum + Number(p.montant), 0)

  const totalPending = payments
    .filter(p => p.status === "en_attente")
    .reduce((sum, p) => sum + Number(p.montant), 0)

  const paidCount = payments.filter(p => p.status === "paye").length
  const pendingCount = payments.filter(p => p.status === "en_attente").length

  return (
    <div className="space-y-6 p-4 md:p-8 animate-in fade-in duration-700 w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestion des Paiements</h1>
          <p className="text-sm text-slate-500">Suivi financier des scolarités, inscriptions et reçus d&apos;établissement</p>
        </div>

        <Dialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-2xl shadow-lg font-bold bg-primary text-white hover:bg-primary/90 border-none">
              <Plus className="h-4 w-4" />
              Nouveau paiement
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-3xl p-6">
            <form onSubmit={handleCreatePayment} className="space-y-4">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Enregistrer un Paiement</DialogTitle>
                <DialogDescription>
                  Saisissez les détails du paiement de scolarité ou d&apos;inscription
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="user-select">Utilisateur / Élève</Label>
                  <Select value={selectedUserForPay} onValueChange={setSelectedUserForPay} required>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Sélectionner un bénéficiaire" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl max-h-[250px]">
                      {users.map(u => (
                        <SelectItem key={u.id} value={u.id.toString()}>
                          {u.nom} ({u.role === 'student' ? 'Élève' : u.role === 'parent' ? 'Parent' : u.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Montant (FCFA / €)</Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    placeholder="50000"
                    className="rounded-xl"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required 
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Type de paiement</Label>
                    <Select value={paymentType} onValueChange={(val: any) => setPaymentType(val)}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="scolarite">Scolarité</SelectItem>
                        <SelectItem value="inscription">Inscription</SelectItem>
                        <SelectItem value="examen">Examen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Statut</Label>
                    <Select value={paymentStatus} onValueChange={(val: any) => setPaymentStatus(val)}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="paye">Payé</SelectItem>
                        <SelectItem value="en_attente">En attente</SelectItem>
                        <SelectItem value="annule">Annulé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddPaymentOpen(false)} className="rounded-xl">
                  Annuler
                </Button>
                <Button type="submit" disabled={actionLoading} className="rounded-xl bg-primary text-white font-bold border-none">
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Valider le paiement"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full">
        <Card className="border-slate-200 rounded-3xl shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Revenus Encaissés</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">{totalReceived.toLocaleString("fr-FR")} FCFA</div>
            <p className="text-xs text-slate-500 font-medium mt-1">{paidCount} règlements validés</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 rounded-3xl shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-amber-600 uppercase tracking-widest">En Attente de Règlement</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">{totalPending.toLocaleString("fr-FR")} FCFA</div>
            <p className="text-xs text-slate-500 font-medium mt-1">{pendingCount} transactions à relancer</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 rounded-3xl shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-primary uppercase tracking-widest">Total Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">{payments.length}</div>
            <p className="text-xs text-slate-500 font-medium mt-1">Historique des écritures</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 rounded-3xl shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-purple-600 uppercase tracking-widest">Taux d&apos;encaissement</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">
              {payments.length > 0 ? Math.round((paidCount / payments.length) * 100) : 100}%
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">Règlements vs attendus</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters Bar */}
      <Card className="border-slate-200 rounded-3xl shadow-sm bg-white w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between w-full">
            <div className="flex flex-1 gap-3 flex-col sm:flex-row w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input 
                  placeholder="Rechercher par nom d'élève ou email..." 
                  className="pl-9 rounded-2xl border-slate-200 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[180px] rounded-2xl border-slate-200">
                  <Filter className="mr-2 h-4 w-4 text-slate-400" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="scolarite">Scolarité</SelectItem>
                  <SelectItem value="inscription">Inscription</SelectItem>
                  <SelectItem value="examen">Examen</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px] rounded-2xl border-slate-200">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="paye">Payé</SelectItem>
                  <SelectItem value="en_attente">En attente</SelectItem>
                  <SelectItem value="annule">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              variant="outline" 
              className="gap-2 rounded-2xl border-slate-200 hover:bg-slate-50 shrink-0"
              onClick={() => window.print()}
            >
              <Printer className="h-4 w-4" />
              Imprimer le journal
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white w-full">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-20 flex justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
          ) : (
            <div className="overflow-x-auto w-full">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="hover:bg-transparent bg-slate-50/50">
                    <TableHead className="font-bold text-slate-600 text-xs">Bénéficiaire</TableHead>
                    <TableHead className="font-bold text-slate-600 text-xs">Type</TableHead>
                    <TableHead className="font-bold text-slate-600 text-xs">Montant</TableHead>
                    <TableHead className="font-bold text-slate-600 text-xs">Statut</TableHead>
                    <TableHead className="font-bold text-slate-600 text-xs">Date</TableHead>
                    <TableHead className="text-right font-bold text-slate-600 text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((p) => (
                    <TableRow key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                            {p.user?.nom ? p.user.nom.substring(0, 2).toUpperCase() : "PA"}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{p.user?.nom || "Bénéficiaire inconnu"}</p>
                            <p className="text-xs text-slate-500 font-medium">{p.user?.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-bold text-xs uppercase rounded-full">
                          {p.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-black text-slate-900 text-sm">
                        {Number(p.montant).toLocaleString("fr-FR")} FCFA
                      </TableCell>
                      <TableCell>
                        {p.status === 'paye' ? (
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 gap-1 font-bold text-xs">
                            <CheckCircle2 className="h-3 w-3" /> Payé
                          </Badge>
                        ) : p.status === 'en_attente' ? (
                          <Badge className="bg-amber-500/10 text-amber-600 border-amber-200 gap-1 font-bold text-xs">
                            <Clock className="h-3 w-3" /> En attente
                          </Badge>
                        ) : (
                          <Badge className="bg-rose-500/10 text-rose-600 border-rose-200 gap-1 font-bold text-xs">
                            <XCircle className="h-3 w-3" /> Annulé
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 font-medium">
                        {new Date(p.date_paiement).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary rounded-full hover:bg-primary/10"
                            onClick={() => setReceiptPayment(p)}
                            title="Générer le reçu"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-amber-600 rounded-full hover:bg-amber-50"
                            onClick={() => {
                              setPaymentToEdit(p)
                              setEditAmount(p.montant.toString())
                              setEditStatus(p.status)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-rose-600 rounded-full hover:bg-rose-50"
                            onClick={() => setPaymentToDelete(p)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredPayments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-16 text-center text-slate-400 italic">
                        Aucun paiement trouvé.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* REÇU MODAL */}
      <Dialog open={!!receiptPayment} onOpenChange={(open) => !open && setReceiptPayment(null)}>
        <DialogContent className="sm:max-w-lg rounded-3xl p-6">
          {receiptPayment && (
            <div className="space-y-6 print:p-0">
              <div className="text-center space-y-1 pb-4 border-b border-slate-100">
                <h2 className="text-xl font-black text-primary">MonÉcole+ Groupe Scolaire</h2>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Reçu Officiel de Règlement</p>
                <p className="text-[10px] text-slate-400">Reçu N° REC-{receiptPayment.id}-{new Date(receiptPayment.date_paiement).getFullYear()}</p>
              </div>

              <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex justify-between py-1 border-b border-slate-200/50">
                  <span className="text-slate-500 font-medium">Élève / Bénéficiaire :</span>
                  <span className="font-bold text-slate-900">{receiptPayment.user?.nom}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/50">
                  <span className="text-slate-500 font-medium">Email :</span>
                  <span className="font-bold text-slate-900">{receiptPayment.user?.email}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/50">
                  <span className="text-slate-500 font-medium">Motif du Paiement :</span>
                  <span className="font-bold uppercase text-primary">{receiptPayment.type}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/50">
                  <span className="text-slate-500 font-medium">Date d&apos;émission :</span>
                  <span className="font-bold text-slate-800">{new Date(receiptPayment.date_paiement).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex justify-between py-2 items-center">
                  <span className="text-slate-700 font-bold text-sm">Montant Réglé :</span>
                  <span className="font-black text-emerald-600 text-lg">{Number(receiptPayment.montant).toLocaleString("fr-FR")} FCFA</span>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 text-center italic">
                Ce document constitue une preuve officielle de paiement enregistrée en base de données.
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" className="rounded-xl" onClick={() => setReceiptPayment(null)}>Fermer</Button>
                <Button className="rounded-xl bg-primary text-white font-bold border-none gap-2" onClick={() => window.print()}>
                  <Printer className="h-4 w-4" /> Imprimer le reçu
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* EDIT MODAL */}
      <Dialog open={!!paymentToEdit} onOpenChange={(open) => !open && setPaymentToEdit(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          {paymentToEdit && (
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Modifier le Paiement</DialogTitle>
                <DialogDescription>Mettre à jour le montant ou le statut du règlement</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>Montant (FCFA / €)</Label>
                  <Input 
                    type="number" 
                    className="rounded-xl"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Statut</Label>
                  <Select value={editStatus} onValueChange={(val: any) => setEditStatus(val)}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="paye">Payé</SelectItem>
                      <SelectItem value="en_attente">En attente</SelectItem>
                      <SelectItem value="annule">Annulé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setPaymentToEdit(null)} className="rounded-xl">Annuler</Button>
                <Button type="submit" disabled={actionLoading} className="rounded-xl bg-primary text-white font-bold border-none">
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* DELETE DIALOG */}
      <AlertDialog open={!!paymentToDelete} onOpenChange={(open) => !open && setPaymentToDelete(null)}>
        <AlertDialogContent className="rounded-3xl p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-rose-600">Supprimer l&apos;écriture comptable ?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 text-sm">
              Cette action supprimera définitivement le paiement N° #{paymentToDelete?.id} de {Number(paymentToDelete?.montant).toLocaleString("fr-FR")} FCFA.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="rounded-xl font-bold">Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              disabled={actionLoading}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold border-none shadow-lg shadow-rose-200"
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
