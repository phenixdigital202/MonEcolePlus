"use client"

import { useState, useEffect } from "react"
import { getEcoles, createEcole, updateEcolePlan, deleteEcole, resetEcoleAdminPassword } from "@/lib/saas-admin-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Plus, Search, Trash2, Edit2, ShieldAlert, KeyRound, Loader2, CheckCircle2, User } from "lucide-react"

export default function GestionEcolesPage() {
  const [ecoles, setEcoles] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [nom, setNom] = useState("")
  const [subdomain, setSubdomain] = useState("")
  const [adminNom, setAdminNom] = useState("")
  const [adminEmail, setAdminEmail] = useState("")
  const [adminPassword, setAdminPassword] = useState("")
  const [plan, setPlan] = useState<"gratuit" | "standard" | "premium">("gratuit")
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const [loading, setLoading] = useState(false)
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null)

  useEffect(() => {
    loadEcoles()
  }, [])

  const loadEcoles = async () => {
    const res = await getEcoles()
    if (res.success && res.data) {
      setEcoles(res.data)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccessMsg("")
    if (!nom || !subdomain) {
      setError("Veuillez remplir au moins le nom et le sous-domaine de l'école.")
      return
    }

    setLoading(true)
    const res = await createEcole(nom, subdomain, plan, adminEmail, adminNom, adminPassword)
    setLoading(false)

    if (res.success) {
      setSuccessMsg(`Établissement créé avec succès ! Admin: ${res.adminCredentials?.email} | Mot de passe: ${res.adminCredentials?.password}`)
      setNom("")
      setSubdomain("")
      setAdminNom("")
      setAdminEmail("")
      setAdminPassword("")
      setPlan("gratuit")
      loadEcoles()
    } else {
      setError(res.error || "Erreur lors de la création de l'établissement.")
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm("Voulez-vous vraiment supprimer cet établissement et toutes ses liaisons ?")) {
      const res = await deleteEcole(id)
      if (res.success) {
        loadEcoles()
      }
    }
  }

  const handleUpdatePlan = async (id: number, currentPlan: string) => {
    const nextPlan = currentPlan === "gratuit" ? "standard" : currentPlan === "standard" ? "premium" : "gratuit"
    const res = await updateEcolePlan(id, nextPlan)
    if (res.success) {
      loadEcoles()
    }
  }

  const handleResetPassword = async (id: number, nomEcole: string) => {
    const defaultPwd = "MonEcole2026!"
    const custom = prompt(`Réinitialiser le mot de passe administrateur pour "${nomEcole}". Entrez le nouveau mot de passe :`, defaultPwd)
    if (custom === null) return

    setActionLoadingId(id)
    const res = await resetEcoleAdminPassword(id, custom || defaultPwd)
    setActionLoadingId(null)

    if (res.success) {
      alert(`✅ Mot de passe réinitialisé avec succès !\n\nEmail : ${res.email}\nNouveau mot de passe : ${res.password}`)
      loadEcoles()
    } else {
      alert(`❌ Erreur : ${res.error}`)
    }
  }

  const filtered = ecoles.filter(e => 
    e.nom.toLowerCase().includes(search.toLowerCase()) || 
    (e.subdomain && e.subdomain.toLowerCase().includes(search.toLowerCase())) ||
    (e.users && e.users.some((u: any) => u.email.toLowerCase().includes(search.toLowerCase())))
  )

  return (
    <div className="p-8 space-y-8 bg-[#09090b] text-white min-h-screen">
      <div className="flex flex-col gap-1.5 border-b border-[#27272a] pb-6">
        <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
          Gestion des Établissements
        </h1>
        <p className="text-[#a1a1aa] text-sm">Créez, modifiez, réinitialisez les accès et gérez les abonnements de toutes les écoles.</p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Creation Form */}
        <Card className="border-[#27272a] bg-[#18181b] text-white lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Plus className="h-5 w-5 text-indigo-400" />
              Ajouter une École
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#a1a1aa]">Nom de l&apos;école *</label>
                <Input value={nom} onChange={e => setNom(e.target.value)} placeholder="Ex: Collège Moderne d'Abobo" className="bg-[#09090b] border-[#27272a] text-white" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#a1a1aa]">Sous-domaine / Identifiant *</label>
                <Input value={subdomain} onChange={e => setSubdomain(e.target.value)} placeholder="ex: abobo" className="bg-[#09090b] border-[#27272a] text-white" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#a1a1aa]">Nom de l&apos;administrateur</label>
                <Input value={adminNom} onChange={e => setAdminNom(e.target.value)} placeholder="Ex: M. Touré" className="bg-[#09090b] border-[#27272a] text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#a1a1aa]">Email Administrateur</label>
                <Input type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} placeholder="admin@ecole.ci (par défaut auto)" className="bg-[#09090b] border-[#27272a] text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#a1a1aa]">Mot de passe initial</label>
                <Input type="text" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} placeholder="Ex: MonEcole2026!" className="bg-[#09090b] border-[#27272a] text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#a1a1aa]">Formule de base</label>
                <select value={plan} onChange={e => setPlan(e.target.value as any)} className="w-full bg-[#09090b] border border-[#27272a] text-white rounded-lg h-10 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500">
                  <option value="gratuit">Gratuit / Starter</option>
                  <option value="standard">Standard / Professional</option>
                  <option value="premium">Premium / Enterprise</option>
                </select>
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 font-bold h-11 rounded-xl flex items-center justify-center gap-2">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Créer l'Établissement & Provisionner BD"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* List & Search */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par école, sous-domaine ou email admin..." className="pl-9 bg-[#18181b] border-[#27272a] text-white h-11 rounded-xl" />
          </div>

          <div className="border border-[#27272a] rounded-xl overflow-hidden bg-[#18181b]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#27272a] bg-[#09090b] text-[10px] uppercase font-bold tracking-wider text-[#a1a1aa]">
                  <th className="p-4">Établissement</th>
                  <th className="p-4">Administrateur</th>
                  <th className="p-4">Plan</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272a] text-sm">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground text-xs">
                      Aucun établissement trouvé.
                    </td>
                  </tr>
                ) : (
                  filtered.map((e) => {
                    const admin = e.users?.[0]
                    return (
                      <tr key={e.id} className="hover:bg-neutral-900/50">
                        <td className="p-4">
                          <div className="font-bold text-white">{e.nom}</div>
                          <div className="text-xs text-[#a1a1aa] font-mono">{e.subdomain || "—"}.monecoleplus.ci</div>
                        </td>
                        <td className="p-4">
                          {admin ? (
                            <div>
                              <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                                <User className="h-3 w-3 text-indigo-400" />
                                {admin.nom}
                              </div>
                              <div className="text-[11px] text-indigo-300 font-mono mt-0.5">{admin.email}</div>
                            </div>
                          ) : (
                            <span className="text-xs text-amber-400 italic">Aucun admin</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span 
                            onClick={() => handleUpdatePlan(e.id, e.plan)}
                            title="Cliquer pour changer de formule"
                            className="cursor-pointer text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
                          >
                            {e.plan}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-1">
                          <Button 
                            onClick={() => handleResetPassword(e.id, e.nom)} 
                            size="sm" 
                            variant="ghost" 
                            title="Réinitialiser le mot de passe de l'administrateur"
                            disabled={actionLoadingId === e.id}
                            className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 h-8 px-2"
                          >
                            {actionLoadingId === e.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <KeyRound className="h-3.5 w-3.5" />
                            )}
                          </Button>
                          <Button 
                            onClick={() => handleDelete(e.id)} 
                            size="sm" 
                            variant="ghost" 
                            title="Supprimer cet établissement"
                            className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 h-8 px-2"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
