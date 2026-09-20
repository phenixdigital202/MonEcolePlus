"use client"

import { useState, useEffect, useRef } from "react"
import * as XLSX from "xlsx"
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
  ArrowUpRight,
  RefreshCw,
  RotateCcw,
  ChevronDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
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
import { getSchoolInfoAction } from "@/lib/documents-actions"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { 
  getPaymentsAction, 
  createPaymentAction, 
  updatePaymentAction, 
  deletePaymentAction,
  initiateMobileMoneyPaymentAction,
  refundPaymentAction,
  runBankReconciliationAction
} from "@/lib/payment-actions"
import { getAllUsersAction } from "@/lib/admin-shortcut-actions"
import { PaymentReceiptDocument } from "@/components/documents/payment-receipt-document"
import { DocumentPrintContainer } from "@/components/documents/document-print-container"
import { downloadDocumentAsPdf } from "@/lib/pdf-export-utils"
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
  const [userSearchForModal, setUserSearchForModal] = useState("")
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const userDropdownRef = useRef<HTMLDivElement>(null)
  const [amount, setAmount] = useState("")
  const [paymentType, setPaymentType] = useState<"scolarite" | "inscription" | "examen" | any>("scolarite")
  const [paymentStatus, setPaymentStatus] = useState<"paye" | "en_attente" | "annule" | any>("paye")

  // Mobile Money fields
  const [paymentMethod, setPaymentMethod] = useState<"classic" | "mobile_money">("classic")
  const [mmProvider, setMmProvider] = useState("orange_money")
  const [mmPhone, setMmPhone] = useState("")

  const [paymentToEdit, setPaymentToEdit] = useState<any>(null)
  const [editStatus, setEditStatus] = useState<"paye" | "en_attente" | "annule" | any>("paye")
  const [editAmount, setEditAmount] = useState("")

  const [paymentToDelete, setPaymentToDelete] = useState<any>(null)
  const [receiptPayment, setReceiptPayment] = useState<any>(null)
  const [receiptFormat, setReceiptFormat] = useState<"A4" | "A5">("A4")
  const [schoolInfo, setSchoolInfo] = useState<any>(null)

  const fetchData = async () => {
    setLoading(true)
    const [payRes, userRes, schRes] = await Promise.all([
      getPaymentsAction(),
      getAllUsersAction(),
      getSchoolInfoAction()
    ])

    if (payRes.success) setPayments(payRes.data || [])
    if (userRes.success) setUsers(userRes.data || [])
    if (schRes.success) setSchoolInfo(schRes.data)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setIsUserDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUserForPay || !amount || parseFloat(amount) <= 0) {
      return toast.error("Veuillez sélectionner un utilisateur et un montant valide.")
    }

    setActionLoading(true)

    if (paymentMethod === "mobile_money") {
      if (!mmPhone) {
        toast.error("Veuillez saisir le numéro de téléphone pour le paiement mobile.")
        setActionLoading(false)
        return
      }

      const res = await initiateMobileMoneyPaymentAction({
        id_utilisateur: parseInt(selectedUserForPay),
        montant: parseFloat(amount),
        type: paymentType,
        provider: mmProvider,
        phoneNumber: mmPhone
      })

      if (res.success) {
        toast.success(res.message || "Paiement Mobile Money validé !")
        setIsAddPaymentOpen(false)
        setAmount("")
        setMmPhone("")
        setSelectedUserForPay("")
        setUserSearchForModal("")
        setIsUserDropdownOpen(false)
        fetchData()
      } else {
        toast.error(res.error || "Erreur de paiement Mobile Money")
      }
    } else {
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
        setUserSearchForModal("")
        setIsUserDropdownOpen(false)
        fetchData()
      } else {
        toast.error(res.error || "Erreur de création")
      }
    }
    setActionLoading(false)
  }

  // Handle Bank Reconciliation action
  const handleReconciliation = async () => {
    setLoading(true)
    const res = await runBankReconciliationAction()
    if (res.success) {
      toast.success(`${res.count} paiement(s) réconcilié(s) automatiquement avec la passerelle !`)
      fetchData()
    } else {
      toast.error(res.error || "Erreur de rapprochement")
    }
    setLoading(false)
  }

  // Handle Mobile Money refund
  const handleRefund = async (id: number) => {
    setActionLoading(true)
    const res = await refundPaymentAction(id)
    if (res.success) {
      toast.success("Transaction Mobile Money remboursée avec succès !")
      fetchData()
    } else {
      toast.error(res.error || "Échec du remboursement")
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

  const handleExportJournalExcel = () => {
    try {
      if (!filteredPayments || filteredPayments.length === 0) {
        toast.error("Aucun paiement à exporter")
        return
      }

      const dataToExport = filteredPayments.map((p) => ({
        "Date": p.date_paiement ? new Date(p.date_paiement).toLocaleDateString("fr-FR") : "-",
        "Bénéficiaire": p.user?.nom || "Non renseigné",
        "Email": p.user?.email || "-",
        "Type de frais": p.type ? p.type.toUpperCase() : "-",
        "Montant (FCFA)": p.montant || 0,
        "Statut": p.status === "paye" ? "Payé" : p.status === "en_attente" ? "En attente" : p.status === "annule" ? "Annulé" : p.status || "-",
        "Mode de paiement": p.provider ? `${p.provider.toUpperCase()} (${p.phoneNumber || ""})` : "Classique",
        "Référence Transaction": p.transactionRef || "-",
      }))

      const worksheet = XLSX.utils.json_to_sheet(dataToExport)
      const colWidths = [
        { wch: 12 },
        { wch: 25 },
        { wch: 30 },
        { wch: 15 },
        { wch: 18 },
        { wch: 12 },
        { wch: 25 },
        { wch: 25 },
      ]
      worksheet["!cols"] = colWidths

      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Journal Paiements")

      const dateStr = new Date().toISOString().split("T")[0]
      XLSX.writeFile(workbook, `Journal_Paiements_${dateStr}.xlsx`)

      toast.success("Journal des paiements téléchargé avec succès !")
    } catch (error) {
      console.error("Erreur lors de l'export Excel:", error)
      toast.error("Erreur lors du téléchargement du journal Excel")
    }
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

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReconciliation} disabled={loading} className="gap-2 rounded-2xl border-slate-200 font-bold hover:bg-slate-50">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Rapprochement bancaire
          </Button>

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
                    Saisissez les détails du paiement ou initiez une transaction Mobile Money
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                  <div className="space-y-2 relative" ref={userDropdownRef}>
                    <Label htmlFor="user-select">Utilisateur / Élève</Label>
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Saisissez un nom ou recherchez un bénéficiaire..."
                        value={userSearchForModal}
                        onChange={(e) => {
                          const val = e.target.value
                          setUserSearchForModal(val)
                          setIsUserDropdownOpen(true)
                          const matchingUser = users.find(u => u.nom.toLowerCase().trim() === val.toLowerCase().trim())
                          if (matchingUser) {
                            setSelectedUserForPay(matchingUser.id.toString())
                          } else {
                            setSelectedUserForPay("")
                          }
                        }}
                        onFocus={() => setIsUserDropdownOpen(true)}
                        className="rounded-xl pr-10 text-sm font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                      >
                        <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isUserDropdownOpen && "rotate-180")} />
                      </button>
                    </div>

                    {isUserDropdownOpen && (
                      <div className="absolute z-50 left-0 right-0 top-full mt-1 max-h-56 overflow-y-auto rounded-2xl bg-white border border-slate-200 shadow-2xl py-1 text-slate-900 animate-in fade-in-50 duration-150">
                        {users
                          .filter(u => 
                            !userSearchForModal || 
                            u.nom.toLowerCase().includes(userSearchForModal.toLowerCase()) ||
                            (u.email && u.email.toLowerCase().includes(userSearchForModal.toLowerCase()))
                          )
                          .map(u => (
                            <button
                              key={u.id}
                              type="button"
                              onClick={() => {
                                setSelectedUserForPay(u.id.toString())
                                setUserSearchForModal(u.nom)
                                setIsUserDropdownOpen(false)
                              }}
                              className={cn(
                                "w-full text-left px-4 py-2.5 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0",
                                selectedUserForPay === u.id.toString() && "bg-primary/10 font-bold text-primary"
                              )}
                            >
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-900 text-xs">{u.nom}</span>
                                {u.email && <span className="text-[10px] text-slate-400">{u.email}</span>}
                              </div>
                              <Badge variant="outline" className="text-[10px] font-bold uppercase rounded-lg px-2 py-0.5 border-slate-200 text-slate-600">
                                {u.role === 'student' ? 'Élève' : u.role === 'parent' ? 'Parent' : u.role}
                              </Badge>
                            </button>
                          ))}

                        {users.filter(u => 
                          !userSearchForModal || 
                          u.nom.toLowerCase().includes(userSearchForModal.toLowerCase()) ||
                          (u.email && u.email.toLowerCase().includes(userSearchForModal.toLowerCase()))
                        ).length === 0 && (
                          <div className="px-4 py-3 text-xs text-slate-400 text-center font-medium">
                            Aucun bénéficiaire correspondant
                          </div>
                        )}
                      </div>
                    )}
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

                  <div className="space-y-2">
                    <Label>Méthode de Paiement</Label>
                    <div className="flex rounded-xl bg-slate-100 p-0.5 border">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setPaymentMethod("classic")}
                        className={cn("flex-1 h-8 rounded-lg text-xs font-bold", paymentMethod === "classic" ? "bg-white text-slate-800 shadow" : "text-slate-500")}
                      >
                        Guichet / Espèces
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setPaymentMethod("mobile_money")}
                        className={cn("flex-1 h-8 rounded-lg text-xs font-bold", paymentMethod === "mobile_money" ? "bg-white text-slate-800 shadow" : "text-slate-500")}
                      >
                        Mobile Money
                      </Button>
                    </div>
                  </div>

                  {paymentMethod === "mobile_money" ? (
                    <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="space-y-2 col-span-1">
                        <Label>Opérateur</Label>
                        <Select value={mmProvider} onValueChange={setMmProvider}>
                          <SelectTrigger className="rounded-xl bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="orange_money">Orange Money</SelectItem>
                            <SelectItem value="mtn_momo">MTN MoMo</SelectItem>
                            <SelectItem value="moov_money">Moov Money</SelectItem>
                            <SelectItem value="wave">Wave</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 col-span-1">
                        <Label>Téléphone</Label>
                        <Input
                          placeholder="+225..."
                          value={mmPhone}
                          onChange={(e) => setMmPhone(e.target.value)}
                          className="rounded-xl bg-white"
                          required={paymentMethod === "mobile_money"}
                        />
                      </div>
                    </div>
                  ) : null}

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

                    {paymentMethod === "classic" && (
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
                    )}
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
              onClick={handleExportJournalExcel}
            >
              <Download className="h-4 w-4" />
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
                        <div className="flex flex-col gap-1">
                          <Badge variant="outline" className="font-bold text-[10px] uppercase rounded-full w-fit">
                            {p.type}
                          </Badge>
                          {p.provider && (
                            <Badge className="bg-primary/10 text-primary border-none font-bold text-[9px] uppercase tracking-wider w-fit">
                              {p.provider.replace("_", " ")}
                            </Badge>
                          )}
                        </div>
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
                            <XCircle className="h-3 w-3" /> Annulé / Remboursé
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 font-medium">
                        {new Date(p.date_paiement).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {p.provider && p.status === "paye" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-rose-600 rounded-full hover:bg-rose-50"
                              onClick={() => handleRefund(p.id)}
                              title="Rembourser la transaction"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          )}
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

      {/* REÇU MODAL & PRINT PORTAL */}
      {receiptPayment && (
        <DocumentPrintContainer pageSize={receiptFormat === "A4" ? "a4" : "a5"}>
          <PaymentReceiptDocument
            payment={receiptPayment}
            schoolInfo={schoolInfo}
            totalPaidByStudent={payments
              .filter((p) => p.id_utilisateur === receiptPayment.id_utilisateur && p.status === "paye")
              .reduce((acc, p) => acc + Number(p.montant), 0)}
            printFormat={receiptFormat}
          />
        </DocumentPrintContainer>
      )}

      <Dialog open={!!receiptPayment} onOpenChange={(open) => !open && setReceiptPayment(null)}>
        <DialogContent className="sm:max-w-4xl rounded-3xl p-6 max-h-[92vh] overflow-y-auto">
          {receiptPayment && (
            <div className="space-y-4">
              <PaymentReceiptDocument
                payment={receiptPayment}
                schoolInfo={schoolInfo}
                totalPaidByStudent={payments
                  .filter((p) => p.id_utilisateur === receiptPayment.id_utilisateur && p.status === "paye")
                  .reduce((acc, p) => acc + Number(p.montant), 0)}
                printFormat={receiptFormat}
              />

              <DialogFooter className="gap-2 sm:gap-0 print:hidden no-print pt-3 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <span>Format :</span>
                  <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setReceiptFormat("A4")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        receiptFormat === "A4"
                          ? "bg-primary text-white shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      A4 Pleine Page
                    </button>
                    <button
                      type="button"
                      onClick={() => setReceiptFormat("A5")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        receiptFormat === "A5"
                          ? "bg-primary text-white shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      A5 Demie Page
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="rounded-xl font-bold" onClick={() => setReceiptPayment(null)}>
                    Fermer
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-xl border-slate-300 font-bold gap-2 text-slate-700"
                    onClick={() => {
                      toast.info("Génération du fichier PDF en cours...")
                      downloadDocumentAsPdf({
                        elementId: "printable-document",
                        filename: `Recu_Paiement_REC-${String(receiptPayment.id).padStart(6, "0")}`,
                        format: receiptFormat.toLowerCase() as "a4" | "a5"
                      })
                    }}
                  >
                    <Download className="h-4 w-4" /> Télécharger PDF
                  </Button>
                  <Button
                    className="rounded-xl bg-primary text-white font-bold border-none gap-2 shadow-lg shadow-primary/20"
                    onClick={() => window.print()}
                  >
                    <Printer className="h-4 w-4" /> Imprimer
                  </Button>
                </div>
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
