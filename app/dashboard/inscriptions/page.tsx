"use client"

import { useState, useEffect } from "react"
import { 
  getInscriptionsAction, 
  createInscriptionAction, 
  getInscriptionDetailsAction,
  InscriptionFormData 
} from "@/lib/inscription-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  FileSpreadsheet, 
  Plus, 
  Search, 
  Printer, 
  FileText, 
  GraduationCap, 
  UserCheck, 
  Calendar, 
  CreditCard,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Eye,
  Filter
} from "lucide-react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { OfficialFicheInscriptionPdf } from "@/components/documents/official-fiche-inscription-pdf"

export default function InscriptionsPage() {
  const [inscriptions, setInscriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedInscription, setSelectedInscription] = useState<any>(null)
  const [selectedSchool, setSelectedSchool] = useState<any>(null)
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)

  // Form State
  const [formPending, setFormPending] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)
  const [classesList, setClassesList] = useState<any[]>([])

  const [formData, setFormData] = useState<InscriptionFormData>({
    type_inscription: "Inscription",
    matricule: "",
    nom: "",
    email: "",
    date_naissance: "",
    lieu_naissance: "",
    nationalite: "Ivoirienne",
    sexe: "M",
    etablissement_origine: "",
    statut_affectation: "Non Affecté",
    statut_redoublement: "Non Redoublant",
    cantine: false,
    transport: false,
    lv2: "",
    id_classe: 0,
    annee_scolaire: "2026-2027",
    montant_scolarite: 150000,
    tuteur_type: "Père",
    tuteur_nom: "",
    tuteur_profession: "",
    tuteur_tel_mobile: "",
    tuteur_tel_bureau: "",
    tuteur_tel_domicile: "",
    tuteur_adresse: "",
    tuteur_email: ""
  })

  // Load Inscriptions & Classes
  useEffect(() => {
    loadData()
  }, [])

  async function loadData(querySearch = "") {
    setLoading(true)
    const res = await getInscriptionsAction(querySearch)
    if (res.success) {
      setInscriptions(res.data || [])
    }
    setLoading(false)

    // Fetch classes list for select dropdown
    try {
      const resp = await fetch("/api/classes")
      if (resp.ok) {
        const json = await resp.json()
        if (json.data) setClassesList(json.data)
      }
    } catch (e) {}
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setSearch(val)
    loadData(val)
  }

  async function handleOpenPdfModal(id: number) {
    const res = await getInscriptionDetailsAction(id)
    if (res.success) {
      setSelectedInscription(res.data)
      setSelectedSchool(res.school)
      setIsPdfModalOpen(true)
    }
  }

  async function handleSubmitForm(e: React.FormEvent) {
    e.preventDefault()
    setFormPending(true)
    setFormError(null)
    setFormSuccess(null)

    const res = await createInscriptionAction(formData)
    if (res.success) {
      setFormSuccess(`Fiche d'${formData.type_inscription.toLowerCase()} créée avec succès pour ${formData.nom}.`)
      loadData(search)
      setTimeout(() => {
        setIsFormModalOpen(false)
        setFormSuccess(null)
      }, 1500)
    } else {
      setFormError(res.error || "Une erreur est survenue lors de l'enregistrement.")
    }
    setFormPending(false)
  }

  function handleAutoGenerateMatricule() {
    const yearPrefix = new Date().getFullYear()
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26))
    setFormData(prev => ({ ...prev, matricule: `${yearPrefix}-${randomSuffix}${letter}` }))
  }

  // Calculate statistics
  const totalInscriptions = inscriptions.length
  const newCount = inscriptions.filter(i => i.type_inscription === "Inscription").length
  const reCount = inscriptions.filter(i => i.type_inscription === "Réinscription").length
  const totalScolarite = inscriptions.reduce((acc, i) => acc + (Number(i.montant_scolarite) || 0), 0)

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>Gestion des Inscriptions ou Réinscriptions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Inscriptions ou Réinscriptions Scolaires
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Gérez les fiches officielles, attribuez les matricules et téléchargez les documents réglementaires.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setIsFormModalOpen(true)}
            className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-extrabold text-xs sm:text-sm h-11 px-5 rounded-2xl shadow-lg shadow-blue-500/25 transition-transform hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Inscription ou Réinscription
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-slate-200/80 rounded-3xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Dossiers</span>
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">{totalInscriptions}</p>
          <p className="text-xs text-slate-500 font-medium">Élèves enregistrés en base</p>
        </div>

        <div className="p-5 bg-white border border-slate-200/80 rounded-3xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nouvelles Inscriptions</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">{newCount}</p>
          <p className="text-xs text-emerald-600 font-bold">Nouveaux élèves ({totalInscriptions > 0 ? Math.round((newCount / totalInscriptions) * 100) : 0}%)</p>
        </div>

        <div className="p-5 bg-white border border-slate-200/80 rounded-3xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Réinscriptions</span>
            <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <GraduationCap className="h-5 w-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">{reCount}</p>
          <p className="text-xs text-purple-600 font-bold">Anciens élèves renouvelés</p>
        </div>

        <div className="p-5 bg-white border border-slate-200/80 rounded-3xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Scolarités Engagées</span>
            <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-indigo-700 truncate">{totalScolarite.toLocaleString("fr-FR")} FCFA</p>
          <p className="text-xs text-slate-500 font-medium">Montant annuel théorique</p>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white p-4 border border-slate-200/80 rounded-3xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            type="text" 
            placeholder="Rechercher par Matricule, Nom, Classe..." 
            value={search}
            onChange={handleSearchChange}
            className="pl-10 h-11 rounded-2xl border-slate-200 bg-slate-50/50 text-xs font-medium focus:bg-white focus:border-blue-600"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
          <Filter className="h-4 w-4 text-slate-400" />
          <span>Affichage de {inscriptions.length} dossier(s)</span>
        </div>
      </div>

      {/* Inscriptions Data Table */}
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto" />
            <p className="text-sm text-slate-500 font-medium">Chargement des fiches d&apos;inscription...</p>
          </div>
        ) : inscriptions.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <FileSpreadsheet className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Aucun dossier trouvé</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Aucune inscription ou réinscription enregistrée. Cliquez sur le bouton ci-dessus pour ajouter un nouvel élève.
            </p>
            <Button onClick={() => setIsFormModalOpen(true)} className="bg-blue-600 text-white font-bold rounded-xl text-xs">
              <Plus className="h-4 w-4 mr-2" /> Créer une fiche d&apos;inscription
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-black uppercase tracking-wider">
                  <th className="py-4 px-6">Matricule</th>
                  <th className="py-4 px-6">Élève (Nom &amp; Prénoms)</th>
                  <th className="py-4 px-6">Classe &amp; Année</th>
                  <th className="py-4 px-6 text-center">Type Opération</th>
                  <th className="py-4 px-6 text-right">Scolarité (FCFA)</th>
                  <th className="py-4 px-6 text-center">Actions / Fiche</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inscriptions.map((ins) => {
                  const u = ins.user || {}
                  const c = ins.classe || {}
                  const isReinscr = ins.type_inscription === "Réinscription"

                  return (
                    <tr key={ins.id} className="hover:bg-slate-50/80 transition-colors font-medium">
                      <td className="py-4 px-6 font-mono font-black text-slate-900">
                        <span className="inline-block px-2.5 py-1 bg-slate-100 border border-slate-300 rounded-lg text-[11px]">
                          {u.matricule || "NON ATTRIBUÉ"}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-blue-100 text-blue-700 font-black flex items-center justify-center shrink-0">
                            {u.nom ? u.nom[0] : "E"}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 text-sm">{u.nom}</p>
                            <p className="text-[10px] text-slate-500">
                              {u.sexe === "F" ? "Fille (F)" : "Garçon (M)"} • Née le {u.date_naissance ? new Date(u.date_naissance).toLocaleDateString("fr-FR") : "N/A"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <p className="font-black text-blue-700">{c.nom || "Sans classe"}</p>
                        <p className="text-[10px] text-slate-500">Année {ins.annee_scolaire}</p>
                      </td>

                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          isReinscr 
                            ? "bg-purple-50 text-purple-700 border border-purple-200" 
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}>
                          {ins.type_inscription || "Inscription"}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right font-black text-slate-900 text-sm">
                        {ins.montant_scolarite ? Number(ins.montant_scolarite).toLocaleString("fr-FR") + " FCFA" : "—"}
                      </td>

                      <td className="py-4 px-6 text-center">
                        <Button
                          onClick={() => handleOpenPdfModal(ins.id)}
                          size="sm"
                          className="bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
                        >
                          <Printer className="h-3.5 w-3.5 mr-1.5" />
                          Fiche Officielle (PDF)
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal 1: PDF Viewer & Print Modal */}
      <Dialog open={isPdfModalOpen} onOpenChange={setIsPdfModalOpen}>
        <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto p-6 sm:p-8 rounded-3xl bg-slate-100">
          <DialogHeader className="flex flex-row items-center justify-between border-b pb-4 mb-4">
            <DialogTitle className="text-lg font-black text-slate-900">
              Fiche Officielle d&apos;Inscription ou Réinscription
            </DialogTitle>
          </DialogHeader>

          {selectedInscription && (
            <OfficialFicheInscriptionPdf 
              inscriptionData={selectedInscription}
              schoolData={selectedSchool}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Modal 2: Form Modal (Nouvelle Inscription / Réinscription) */}
      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto p-6 sm:p-8 rounded-3xl bg-white">
          <DialogHeader className="border-b pb-4 mb-6">
            <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="h-6 w-6 text-blue-600" />
              Saisie Fiche d&apos;Inscription ou Réinscription
            </DialogTitle>
          </DialogHeader>

          {formError && (
            <div className="mb-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div className="mb-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{formSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSubmitForm} className="space-y-6 text-xs">
            {/* Type & Matricule Section */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    Type d&apos;Opération *
                  </label>
                  <select
                    value={formData.type_inscription}
                    onChange={e => setFormData({ ...formData, type_inscription: e.target.value as any })}
                    className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white font-bold text-xs"
                  >
                    <option value="Inscription">Inscription (Nouveau)</option>
                    <option value="Réinscription">Réinscription (Ancien)</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block font-black text-slate-700 uppercase tracking-wider">
                      Matricule National / Interne
                    </label>
                    <button 
                      type="button" 
                      onClick={handleAutoGenerateMatricule} 
                      className="text-[10px] text-blue-600 font-bold hover:underline"
                    >
                      Générer auto ⚡
                    </button>
                  </div>
                  <Input 
                    type="text" 
                    placeholder="Ex: 2026-8492A" 
                    value={formData.matricule || ""}
                    onChange={e => setFormData({ ...formData, matricule: e.target.value })}
                    className="h-11 rounded-xl font-mono font-bold uppercase bg-white border-slate-300"
                  />
                </div>
              </div>
            </div>

            {/* Renseignements Élève */}
            <div className="space-y-4">
              <h4 className="font-black text-slate-900 uppercase tracking-wider border-b pb-2 text-xs flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-blue-600" />
                1. Renseignements de l&apos;Élève
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Nom &amp; Prénoms de l&apos;Élève *</label>
                  <Input 
                    required 
                    type="text" 
                    placeholder="Ex: KOUASSI Jean-Marc" 
                    value={formData.nom}
                    onChange={e => setFormData({ ...formData, nom: e.target.value })}
                    className="h-11 rounded-xl bg-white border-slate-300 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Classe d&apos;affectation *</label>
                  <select
                    required
                    value={formData.id_classe}
                    onChange={e => setFormData({ ...formData, id_classe: Number(e.target.value) })}
                    className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white font-bold text-xs"
                  >
                    <option value={0}>-- Sélectionner une classe --</option>
                    {classesList.map(c => (
                      <option key={c.id} value={c.id}>{c.nom} ({c.niveau})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sexe *</label>
                  <select
                    value={formData.sexe}
                    onChange={e => setFormData({ ...formData, sexe: e.target.value as any })}
                    className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white font-bold text-xs"
                  >
                    <option value="M">Masculin (M)</option>
                    <option value="F">Féminin (F)</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">Date de Naissance</label>
                    <span className="text-[10px] text-slate-400 font-medium">Format: jj/mm/aaaa</span>
                  </div>
                  <Input 
                    type="date" 
                    placeholder="dd/mm/yyyy"
                    value={formData.date_naissance || ""}
                    onChange={e => setFormData({ ...formData, date_naissance: e.target.value })}
                    className="h-11 rounded-xl bg-white border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lieu de Naissance</label>
                  <Input 
                    type="text" 
                    placeholder="Ex: Abidjan Cocody" 
                    value={formData.lieu_naissance || ""}
                    onChange={e => setFormData({ ...formData, lieu_naissance: e.target.value })}
                    className="h-11 rounded-xl bg-white border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nationalité</label>
                  <Input 
                    type="text" 
                    placeholder="Ex: Ivoirienne" 
                    value={formData.nationalite || "Ivoirienne"}
                    onChange={e => setFormData({ ...formData, nationalite: e.target.value })}
                    className="h-11 rounded-xl bg-white border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Établissement d&apos;origine</label>
                  <Input 
                    type="text" 
                    placeholder="Ex: Collège Sainte Marie" 
                    value={formData.etablissement_origine || ""}
                    onChange={e => setFormData({ ...formData, etablissement_origine: e.target.value })}
                    className="h-11 rounded-xl bg-white border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Statut Affectation</label>
                  <select
                    value={formData.statut_affectation}
                    onChange={e => setFormData({ ...formData, statut_affectation: e.target.value as any })}
                    className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white font-bold text-xs"
                  >
                    <option value="Non Affecté">Non Affecté</option>
                    <option value="Affecté">Affecté de l&apos;État</option>
                    <option value="Aucun">Aucun</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Statut Redoublement</label>
                  <select
                    value={formData.statut_redoublement}
                    onChange={e => setFormData({ ...formData, statut_redoublement: e.target.value as any })}
                    className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white font-bold text-xs"
                  >
                    <option value="Non Redoublant">Non Redoublant (Passant)</option>
                    <option value="Redoublant">Redoublant</option>
                  </select>
                </div>
              </div>

              {/* Services & LV2 */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input 
                    type="checkbox" 
                    checked={formData.cantine} 
                    onChange={e => setFormData({ ...formData, cantine: e.target.checked })} 
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  <span>Souscrit à la Cantine</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input 
                    type="checkbox" 
                    checked={formData.transport} 
                    onChange={e => setFormData({ ...formData, transport: e.target.checked })} 
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  <span>Souscrit au Transport Scolaire</span>
                </label>
              </div>
            </div>

            {/* Scolarité & Finances */}
            <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-3">
              <h4 className="font-black text-blue-900 uppercase text-xs flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-blue-600" />
                Scolarité &amp; Engagement Financier
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Montant Annuel Scolarité (FCFA)</label>
                  <Input 
                    type="number" 
                    value={formData.montant_scolarite || 0}
                    onChange={e => setFormData({ ...formData, montant_scolarite: Number(e.target.value) })}
                    className="h-11 rounded-xl bg-white border-blue-300 font-black text-sm text-blue-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Année Scolaire</label>
                  <Input 
                    type="text" 
                    value={formData.annee_scolaire}
                    onChange={e => setFormData({ ...formData, annee_scolaire: e.target.value })}
                    className="h-11 rounded-xl bg-white border-blue-300 font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Représentant Légal */}
            <div className="space-y-4">
              <h4 className="font-black text-slate-900 uppercase tracking-wider border-b pb-2 text-xs flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-blue-600" />
                2. Représentant Légal (Père / Mère / Tuteur)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lien de parenté</label>
                  <select
                    value={formData.tuteur_type}
                    onChange={e => setFormData({ ...formData, tuteur_type: e.target.value as any })}
                    className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white font-bold text-xs"
                  >
                    <option value="Père">Père</option>
                    <option value="Mère">Mère</option>
                    <option value="Tuteur">Tuteur Légal</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nom &amp; Prénoms du Représentant</label>
                  <Input 
                    type="text" 
                    placeholder="Ex: KOUASSI Marc" 
                    value={formData.tuteur_nom || ""}
                    onChange={e => setFormData({ ...formData, tuteur_nom: e.target.value })}
                    className="h-11 rounded-xl bg-white border-slate-300 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Téléphone Mobile (WhatsApp)</label>
                  <Input 
                    type="tel" 
                    placeholder="Ex: +225 07 00 00 00 00" 
                    value={formData.tuteur_tel_mobile || ""}
                    onChange={e => setFormData({ ...formData, tuteur_tel_mobile: e.target.value })}
                    className="h-11 rounded-xl bg-white border-slate-300 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email du Représentant</label>
                  <Input 
                    type="email" 
                    placeholder="Ex: parent@exemple.ci" 
                    value={formData.tuteur_email || ""}
                    onChange={e => setFormData({ ...formData, tuteur_email: e.target.value })}
                    className="h-11 rounded-xl bg-white border-slate-300 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t">
              <Button type="button" variant="outline" onClick={() => setIsFormModalOpen(false)} className="rounded-xl font-bold">
                Annuler
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-6" disabled={formPending}>
                {formPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                Enregistrer la Fiche d&apos;Inscription
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
