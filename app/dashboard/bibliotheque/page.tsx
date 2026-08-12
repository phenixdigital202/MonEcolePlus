"use client"

import { useState, useEffect } from "react"
import { 
  BookOpen, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Trash2, 
  Loader2, 
  FileText, 
  Video, 
  FileCheck,
  RefreshCw 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import { toast } from "sonner"
import { getLivresPedagogiques, createLivrePedagogique, deleteLivrePedagogique } from "@/lib/pedagogique-actions"

export default function BibliothequePage() {
  const [books, setBooks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [matiereFilter, setMatiereFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [userRole, setUserRole] = useState<string>("")

  // Form state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [titre, setTitre] = useState("")
  const [auteur, setAuteur] = useState("")
  const [type, setType] = useState("pdf")
  const [matiere, setMatiere] = useState("Mathematiques")
  const [niveau, setNiveau] = useState("Terminale")
  const [url, setUrl] = useState("")

  const fetchData = async () => {
    setLoading(true)
    const res = await getLivresPedagogiques()
    if (res.success) {
      setBooks(res.data || [])
    } else {
      toast.error(res.error || "Erreur lors du chargement de la bibliothèque")
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
    const role = document.cookie.split('; ').find(row => row.startsWith('user_role='))?.split('=')[1]
    if (role) {
      setUserRole(decodeURIComponent(role))
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!titre || !auteur) {
      return toast.error("Veuillez saisir le titre et l'auteur")
    }

    setActionLoading(true)
    const res = await createLivrePedagogique({
      titre,
      auteur,
      type,
      matiere,
      niveau,
      url: url || undefined
    })

    if (res.success) {
      toast.success("Ressource pédagogique ajoutée !")
      setIsAddOpen(false)
      setTitre("")
      setAuteur("")
      setUrl("")
      fetchData()
    } else {
      toast.error(res.error || "Erreur d'ajout")
    }
    setActionLoading(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Voulez-vous vraiment supprimer ce document ?")) return
    const res = await deleteLivrePedagogique(id)
    if (res.success) {
      toast.success("Document supprimé")
      fetchData()
    } else {
      toast.error(res.error)
    }
  }

  const filteredBooks = books.filter(b => {
    const matchesSearch = b.titre.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          b.auteur.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesMatiere = matiereFilter === "all" || b.matiere.toLowerCase() === matiereFilter.toLowerCase()
    const matchesType = typeFilter === "all" || b.type.toLowerCase() === typeFilter.toLowerCase()
    return matchesSearch && matchesMatiere && matchesType
  })

  return (
    <div className="space-y-6 p-4 md:p-8 animate-in fade-in duration-700 w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bibliothèque Numérique</h1>
          <p className="text-sm text-slate-500">Accédez aux livres, cours vidéos, exercices et corrigés officiels</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData} disabled={loading} className="gap-2 rounded-2xl border-slate-200 font-bold hover:bg-slate-50">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          {(userRole === 'admin' || userRole === 'teacher') && (
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 rounded-2xl shadow-lg font-bold bg-primary text-white hover:bg-primary/90 border-none">
                  <Plus className="h-4 w-4" />
                  Ajouter un document
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md rounded-3xl p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Publier un document</DialogTitle>
                    <DialogDescription>
                      Ajoutez une ressource pédagogique à la bibliothèque
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label>Titre du document</Label>
                      <Input
                        placeholder="Ex: Mathématiques Terminale C - Algèbre"
                        value={titre}
                        onChange={(e) => setTitre(e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Auteur / Enseignant</Label>
                        <Input
                          placeholder="M. Touré"
                          value={auteur}
                          onChange={(e) => setAuteur(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Format / Type</Label>
                        <Select value={type} onValueChange={setType}>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="pdf">Livre PDF</SelectItem>
                            <SelectItem value="epub">EPUB</SelectItem>
                            <SelectItem value="video">Vidéo / Cours</SelectItem>
                            <SelectItem value="exercice">Exercice</SelectItem>
                            <SelectItem value="corrige">Corrigé</SelectItem>
                            <SelectItem value="quiz">Quiz</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Matière</Label>
                        <Select value={matiere} onValueChange={setMatiere}>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="Mathematiques">Mathématiques</SelectItem>
                            <SelectItem value="Physique">Physique-Chimie</SelectItem>
                            <SelectItem value="SVT">SVT</SelectItem>
                            <SelectItem value="Francais">Français</SelectItem>
                            <SelectItem value="Anglais">Anglais</SelectItem>
                            <SelectItem value="Histoire-Geo">Histoire-Géo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Niveau cible</Label>
                        <Select value={niveau} onValueChange={setNiveau}>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="Terminale">Terminale</SelectItem>
                            <SelectItem value="Premiere">Première</SelectItem>
                            <SelectItem value="Seconde">Seconde</SelectItem>
                            <SelectItem value="Troisieme">Troisième</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Lien / URL du document</Label>
                      <Input
                        placeholder="https://drive.google.com/..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} className="rounded-xl">
                      Annuler
                    </Button>
                    <Button type="submit" disabled={actionLoading} className="rounded-xl bg-primary text-white font-bold border-none">
                      {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publier"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <Card className="border-slate-200 rounded-3xl shadow-sm bg-white w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between w-full">
            <div className="flex flex-1 gap-3 flex-col sm:flex-row w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input 
                  placeholder="Rechercher par titre, auteur..." 
                  className="pl-9 rounded-2xl border-slate-200 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Select value={matiereFilter} onValueChange={setMatiereFilter}>
                <SelectTrigger className="w-full sm:w-[180px] rounded-2xl border-slate-200">
                  <Filter className="mr-2 h-4 w-4 text-slate-400" />
                  <SelectValue placeholder="Matière" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="all">Toutes les matières</SelectItem>
                  <SelectItem value="Mathematiques">Mathématiques</SelectItem>
                  <SelectItem value="Physique">Physique-Chimie</SelectItem>
                  <SelectItem value="SVT">SVT</SelectItem>
                  <SelectItem value="Francais">Français</SelectItem>
                  <SelectItem value="Anglais">Anglais</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[180px] rounded-2xl border-slate-200">
                  <SelectValue placeholder="Format" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="all">Tous les formats</SelectItem>
                  <SelectItem value="pdf">Livre PDF</SelectItem>
                  <SelectItem value="epub">EPUB</SelectItem>
                  <SelectItem value="video">Cours Vidéo</SelectItem>
                  <SelectItem value="exercice">Exercice</SelectItem>
                  <SelectItem value="corrige">Corrigé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Books Grid */}
      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full">
          {filteredBooks.map(b => (
            <Card key={b.id} className="border-slate-200 rounded-3xl shadow-sm bg-white overflow-hidden flex flex-col justify-between hover:shadow-lg transition-shadow">
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="font-bold text-[10px] uppercase rounded-full">
                    {b.niveau}
                  </Badge>
                  {b.type === "video" ? (
                    <Video className="h-5 w-5 text-red-500" />
                  ) : b.type === "corrige" ? (
                    <FileCheck className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <FileText className="h-5 w-5 text-primary" />
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2">{b.titre}</h3>
                  <p className="text-xs text-slate-500 font-medium">Par {b.auteur}</p>
                </div>

                <Badge className="bg-primary/10 text-primary border-none font-bold text-[10px] uppercase w-fit block">
                  {b.matiere}
                </Badge>
              </div>

              <div className="p-4 bg-slate-50 border-t flex items-center justify-between gap-2">
                <Button variant="ghost" size="sm" className="gap-2 rounded-xl text-primary font-bold hover:bg-primary/10" asChild>
                  <a href={b.url} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4" />
                    Télécharger
                  </a>
                </Button>
                {(userRole === 'admin' || userRole === 'teacher') && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-600 rounded-full hover:bg-rose-50" onClick={() => handleDelete(b.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
          {filteredBooks.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-400 italic">
              Aucune ressource pédagogique trouvée.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
