"use client"

import { useState, useEffect } from "react"
import { getEcoles, createEcole, updateEcolePlan, deleteEcole } from "@/lib/saas-admin-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Plus, Search, Trash2, Edit2, ShieldAlert } from "lucide-react"

export default function GestionEcolesPage() {
  const [ecoles, setEcoles] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [nom, setNom] = useState("")
  const [subdomain, setSubdomain] = useState("")
  const [plan, setPlan] = useState<"gratuit" | "standard" | "premium">("gratuit")
  const [error, setError] = useState("")

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
    if (!nom || !subdomain) {
      setError("Veuillez remplir tous les champs.")
      return
    }
    const res = await createEcole(nom, subdomain, plan)
    if (res.success) {
      setNom("")
      setSubdomain("")
      setPlan("gratuit")
      loadEcoles()
    } else {
      setError(res.error || "Erreur de création.")
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm("Voulez-vous vraiment supprimer cet établissement ?")) {
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

  const filtered = ecoles.filter(e => 
    e.nom.toLowerCase().includes(search.toLowerCase()) || 
    (e.subdomain && e.subdomain.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="p-8 space-y-8 bg-[#09090b] text-white min-h-screen">
      <div className="flex flex-col gap-1.5 border-b border-[#27272a] pb-6">
        <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
          Gestion des Établissements
        </h1>
        <p className="text-[#a1a1aa] text-sm">Créez, modifiez et gérez les abonnements des établissements scolaires.</p>
      </div>

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
                <label className="text-xs font-bold uppercase tracking-wider text-[#a1a1aa]">Nom</label>
                <Input value={nom} onChange={e => setNom(e.target.value)} placeholder="Ex: Lycée Classique" className="bg-[#09090b] border-[#27272a] text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#a1a1aa]">Sous-domaine</label>
                <Input value={subdomain} onChange={e => setSubdomain(e.target.value)} placeholder="ex: classique" className="bg-[#09090b] border-[#27272a] text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#a1a1aa]">Formule de base</label>
                <select value={plan} onChange={e => setPlan(e.target.value as any)} className="w-full bg-[#09090b] border border-[#27272a] text-white rounded-lg h-10 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500">
                  <option value="gratuit">Gratuit / Starter</option>
                  <option value="standard">Standard / Professional</option>
                  <option value="premium">Premium / Enterprise</option>
                </select>
              </div>
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 font-bold h-11 rounded-xl">
                Créer l&apos;Établissement
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* List & Search */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher une école..." className="pl-9 bg-[#18181b] border-[#27272a] text-white h-11 rounded-xl" />
          </div>

          <div className="border border-[#27272a] rounded-xl overflow-hidden bg-[#18181b]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#27272a] bg-[#09090b] text-[10px] uppercase font-bold tracking-wider text-[#a1a1aa]">
                  <th className="p-4">Nom</th>
                  <th className="p-4">Domaine</th>
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
                  filtered.map((e) => (
                    <tr key={e.id} className="hover:bg-neutral-900/50">
                      <td className="p-4 font-bold text-white">{e.nom}</td>
                      <td className="p-4 text-xs text-[#a1a1aa]">{e.subdomain || "—"}.mon-ecole-plus.ci</td>
                      <td className="p-4">
                        <span 
                          onClick={() => handleUpdatePlan(e.id, e.plan)}
                          className="cursor-pointer text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                        >
                          {e.plan}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <Button onClick={() => handleDelete(e.id)} size="sm" variant="ghost" className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
