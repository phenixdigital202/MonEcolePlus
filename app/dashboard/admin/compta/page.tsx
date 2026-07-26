"use client"

import { useState, useEffect } from "react"
import { 
  DollarSign, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  BookOpen, 
  Briefcase, 
  Download, 
  Printer, 
  Calendar,
  Wallet,
  Building2,
  RefreshCw,
  Loader2
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { 
  getTransactionsComptables, 
  createTransactionComptable, 
  getComptaStats, 
  getComptaReports 
} from "@/lib/compta-actions"

export default function ComptaAdminPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [stats, setStats] = useState<any>({
    totalRecettes: 0,
    totalDepenses: 0,
    soldeGlobal: 0,
    caisseSolde: 0,
    banqueSolde: 0
  })
  const [reports, setReports] = useState<any>({
    grandLivre: {},
    balance: {}
  })

  const [loading, setLoading] = useState(true)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  // Form State
  const [type, setType] = useState<"recette" | "depense">("recette")
  const [categorie, setCategorie] = useState("scolarite")
  const [montant, setMontant] = useState("")
  const [modePaiement, setModePaiement] = useState<"especes" | "mobile_money" | "banque">("especes")
  const [description, setDescription] = useState("")
  const [reference, setReference] = useState("")
  const [compteCaisse, setCompteCaisse] = useState("Caisse Principale")
  const [compteBanque, setCompteBanque] = useState("SG")

  const [activeTab, setActiveTab] = useState<"journal" | "grand_livre" | "balance">("journal")

  const fetchData = async () => {
    setLoading(true)
    const [txRes, statsRes, repRes] = await Promise.all([
      getTransactionsComptables(),
      getComptaStats(),
      getComptaReports()
    ])

    if (txRes.success) setTransactions(txRes.data || [])
    if (statsRes.success) setStats(statsRes.data)
    if (repRes.success) setReports(repRes.data)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!montant || parseFloat(montant) <= 0) {
      return toast.error("Veuillez entrer un montant valide")
    }

    setActionLoading(true)
    const res = await createTransactionComptable({
      type,
      categorie,
      montant: parseFloat(montant),
      mode_paiement: modePaiement,
      description,
      reference,
      compte_caisse: modePaiement === "especes" ? compteCaisse : undefined,
      compte_banque: modePaiement !== "especes" ? compteBanque : undefined
    })

    if (res.success) {
      toast.success("Écriture comptable enregistrée avec succès !")
      setIsAddOpen(false)
      setMontant("")
      setDescription("")
      setReference("")
      fetchData()
    } else {
      toast.error(res.error || "Erreur de saisie")
    }
    setActionLoading(false)
  }

  return (
    <div className="space-y-6 p-4 md:p-8 animate-in fade-in duration-700 w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">ERP Comptabilité & Finance</h1>
          <p className="text-sm text-slate-500">Journal d&apos;écritures, Grand Livre, Balance et suivi des caisses/banques</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData} disabled={loading} className="gap-2 rounded-2xl border-slate-200 font-bold hover:bg-slate-50">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-2xl shadow-lg font-bold bg-primary text-white hover:bg-primary/90 border-none">
                <Plus className="h-4 w-4" />
                Nouvelle écriture
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-3xl p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">Enregistrer un mouvement</DialogTitle>
                  <DialogDescription>
                    Ajoutez une recette ou une dépense dans le grand journal comptable
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Flux</Label>
                      <Select value={type} onValueChange={(val: any) => {
                        setType(val)
                        setCategorie(val === "recette" ? "scolarite" : "salaires")
                      }}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="recette">Recette (+)</SelectItem>
                          <SelectItem value="depense">Dépense (-)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Catégorie</Label>
                      <Select value={categorie} onValueChange={setCategorie}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {type === "recette" ? (
                            <>
                              <SelectItem value="scolarite">Scolarité</SelectItem>
                              <SelectItem value="cantine">Cantine</SelectItem>
                              <SelectItem value="transport">Transport</SelectItem>
                              <SelectItem value="uniformes">Uniformes</SelectItem>
                              <SelectItem value="examens">Examens</SelectItem>
                              <SelectItem value="bibliotheque">Bibliothèque</SelectItem>
                              <SelectItem value="activites">Activités</SelectItem>
                              <SelectItem value="divers">Divers</SelectItem>
                            </>
                          ) : (
                            <>
                              <SelectItem value="salaires">Salaires / Personnel</SelectItem>
                              <SelectItem value="eau">Eau</SelectItem>
                              <SelectItem value="electricite">Électricité</SelectItem>
                              <SelectItem value="internet">Internet</SelectItem>
                              <SelectItem value="fournitures">Fournitures</SelectItem>
                              <SelectItem value="maintenance">Maintenance</SelectItem>
                              <SelectItem value="divers">Divers</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Montant (FCFA)</Label>
                      <Input
                        type="number"
                        placeholder="25000"
                        value={montant}
                        onChange={(e) => setMontant(e.target.value)}
                        className="rounded-xl"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Mode</Label>
                      <Select value={modePaiement} onValueChange={(val: any) => setModePaiement(val)}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="especes">Espèces / Caisse</SelectItem>
                          <SelectItem value="mobile_money">Mobile Money</SelectItem>
                          <SelectItem value="banque">Virement / Banque</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {modePaiement === "especes" ? (
                    <div className="space-y-2">
                      <Label>Compte de Caisse</Label>
                      <Select value={compteCaisse} onValueChange={setCompteCaisse}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="Caisse Principale">Caisse Principale</SelectItem>
                          <SelectItem value="Caisse Secondaire">Caisse Secondaire</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label>Banque Émettrice / Cible</Label>
                      <Select value={compteBanque} onValueChange={setCompteBanque}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="SG">Société Générale (SG)</SelectItem>
                          <SelectItem value="Ecobank">Ecobank</SelectItem>
                          <SelectItem value="BOA">Bank of Africa (BOA)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Référence / Pièce Justificative</Label>
                    <Input
                      placeholder="FACT-092-2026"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Complément d'information..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} className="rounded-xl">
                    Annuler
                  </Button>
                  <Button type="submit" disabled={actionLoading} className="rounded-xl bg-primary text-white font-bold border-none">
                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Valider"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 w-full">
        <Card className="border-slate-200 rounded-3xl shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-emerald-600 uppercase">Recettes</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">{stats.totalRecettes.toLocaleString("fr-FR")} FCFA</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 rounded-3xl shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-rose-600 uppercase">Dépenses</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-rose-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">{stats.totalDepenses.toLocaleString("fr-FR")} FCFA</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 rounded-3xl shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-primary uppercase">Résultat Net</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">{stats.soldeGlobal.toLocaleString("fr-FR")} FCFA</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 rounded-3xl shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-amber-600 uppercase">Encaisse Caisse</CardTitle>
            <Wallet className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">{stats.caisseSolde.toLocaleString("fr-FR")} FCFA</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 rounded-3xl shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-purple-600 uppercase">Encaisse Banque</CardTitle>
            <Building2 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">{stats.banqueSolde.toLocaleString("fr-FR")} FCFA</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 w-full gap-4">
        <button
          onClick={() => setActiveTab("journal")}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === "journal" ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-950"}`}
        >
          Journal des opérations
        </button>
        <button
          onClick={() => setActiveTab("grand_livre")}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === "grand_livre" ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-950"}`}
        >
          Grand Livre
        </button>
        <button
          onClick={() => setActiveTab("balance")}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === "balance" ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-950"}`}
        >
          Balance
        </button>
      </div>

      {/* Tab Panels */}
      <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white w-full">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-20 flex justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
          ) : (
            <>
              {activeTab === "journal" && (
                <div className="overflow-x-auto w-full">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow className="hover:bg-transparent bg-slate-50/50">
                        <TableHead className="font-bold text-slate-600 text-xs">Date</TableHead>
                        <TableHead className="font-bold text-slate-600 text-xs">Catégorie</TableHead>
                        <TableHead className="font-bold text-slate-600 text-xs">Mode</TableHead>
                        <TableHead className="font-bold text-slate-600 text-xs">Référence</TableHead>
                        <TableHead className="font-bold text-slate-600 text-xs">Débit (Dépense)</TableHead>
                        <TableHead className="font-bold text-slate-600 text-xs">Crédit (Recette)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((t) => (
                        <TableRow key={t.id} className="hover:bg-slate-50/80 transition-colors">
                          <TableCell className="text-xs font-semibold text-slate-600">
                            {new Date(t.date).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell className="font-bold text-slate-900 text-sm capitalize">
                            {t.categorie}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-bold text-[10px] uppercase rounded-full">
                              {t.mode_paiement.replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-slate-500 font-medium">{t.reference || "-"}</TableCell>
                          <TableCell className="text-rose-600 font-bold text-sm">
                            {t.type === "depense" ? `${Number(t.montant).toLocaleString("fr-FR")} FCFA` : "-"}
                          </TableCell>
                          <TableCell className="text-emerald-600 font-bold text-sm">
                            {t.type === "recette" ? `${Number(t.montant).toLocaleString("fr-FR")} FCFA` : "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                      {transactions.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="py-16 text-center text-slate-400 italic">
                            Aucune transaction comptable enregistrée.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}

              {activeTab === "grand_livre" && (
                <div className="p-6 space-y-6">
                  {Object.keys(reports.grandLivre).map(cat => (
                    <div key={cat} className="space-y-2 border border-slate-100 p-4 rounded-2xl bg-slate-50/50">
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">{cat}</h3>
                      <Table className="w-full bg-white rounded-xl overflow-hidden border">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">Date</TableHead>
                            <TableHead className="text-xs">Ref</TableHead>
                            <TableHead className="text-xs">Type</TableHead>
                            <TableHead className="text-xs">Montant</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {reports.grandLivre[cat].map((t: any) => (
                            <TableRow key={t.id}>
                              <TableCell className="text-xs">{new Date(t.date).toLocaleDateString('fr-FR')}</TableCell>
                              <TableCell className="text-xs font-semibold">{t.reference || "-"}</TableCell>
                              <TableCell className="text-xs capitalize font-medium">{t.type}</TableCell>
                              <TableCell className="text-xs font-bold">{Number(t.montant).toLocaleString("fr-FR")} FCFA</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ))}
                  {Object.keys(reports.grandLivre).length === 0 && (
                    <p className="text-center py-10 text-slate-400 italic">Grand livre vide.</p>
                  )}
                </div>
              )}

              {activeTab === "balance" && (
                <div className="p-6">
                  <Table className="w-full border rounded-2xl bg-white">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-bold text-xs">Compte / Catégorie</TableHead>
                        <TableHead className="font-bold text-xs">Total Débit</TableHead>
                        <TableHead className="font-bold text-xs">Total Crédit</TableHead>
                        <TableHead className="font-bold text-xs">Solde</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.keys(reports.balance).map(cat => {
                        const deb = reports.balance[cat].debit
                        const cred = reports.balance[cat].credit
                        const solde = cred - deb
                        return (
                          <TableRow key={cat}>
                            <TableCell className="capitalize font-bold text-slate-900">{cat}</TableCell>
                            <TableCell className="text-rose-600 font-medium">{deb.toLocaleString("fr-FR")} FCFA</TableCell>
                            <TableCell className="text-emerald-600 font-medium">{cred.toLocaleString("fr-FR")} FCFA</TableCell>
                            <TableCell className={`font-bold ${solde >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {solde.toLocaleString("fr-FR")} FCFA
                            </TableCell>
                          </TableRow>
                        )
                      })}
                      {Object.keys(reports.balance).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="py-10 text-center text-slate-400 italic">
                            Balance comptable vide.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
