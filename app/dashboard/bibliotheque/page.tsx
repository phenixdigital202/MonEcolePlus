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
  FileQuestion,
  Sparkles,
  Paperclip,
  RefreshCw,
  GraduationCap
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
import { getLivresPedagogiques, createLivrePedagogique, deleteLivrePedagogique, getCurrentUserRoleAction } from "@/lib/pedagogique-actions"

export default function BibliothequePage() {
  const [books, setBooks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [matiereFilter, setMatiereFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [userRole, setUserRole] = useState<string>("admin") // default to admin/teacher permission or checked via action

  // Form state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [titre, setTitre] = useState("")
  const [auteur, setAuteur] = useState("")
  const [type, setType] = useState("pdf")
  const [matiere, setMatiere] = useState("Mathematiques")
  const [niveau, setNiveau] = useState("Terminale")
  const [url, setUrl] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const fetchData = async () => {
    setLoading(true)
    const [res, roleRes] = await Promise.all([
      getLivresPedagogiques(),
      getCurrentUserRoleAction()
    ])

    if (res.success) {
      setBooks(res.data || [])
    } else {
      toast.error(res.error || "Erreur lors du chargement de la bibliothèque")
    }

    if (roleRes.success && roleRes.role) {
      setUserRole(roleRes.role)
    } else {
      const cookieRole = document.cookie.split('; ').find(row => row.startsWith('user_role='))?.split('=')[1]
      if (cookieRole) setUserRole(decodeURIComponent(cookieRole))
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setUrl(event.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!titre || !auteur) {
      return toast.error("Veuillez saisir le titre et l'auteur")
    }

    setActionLoading(true)
    const finalUrl = url || "/books/placeholder.pdf"

    const res = await createLivrePedagogique({
      titre,
      auteur,
      type,
      matiere,
      niveau,
      url: finalUrl
    })

    if (res.success) {
      toast.success("Ressource pédagogique transmise aux élèves avec succès !")
      setIsAddOpen(false)
      setTitre("")
      setAuteur("")
      setUrl("")
      setSelectedFile(null)
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

  const isPublisher = userRole === 'admin' || userRole === 'teacher' || userRole === 'super_admin'

  const getTypeBadge = (typeStr: string) => {
    switch(typeStr.toLowerCase()) {
      case 'video':
        return { label: "Cours Vidéo", color: "bg-rose-500/10 text-rose-600 border-rose-200", icon: Video }
      case 'corrige':
        return { label: "Corrigé Officiel", color: "bg-emerald-500/10 text-emerald-600 border-emerald-200", icon: FileCheck }
      case 'exercice':
        return { label: "Sujet d'Exercice", color: "bg-amber-500/10 text-amber-600 border-amber-200", icon: FileQuestion }
      case 'controle':
        return { label: "Contrôle / Devoir", color: "bg-orange-500/10 text-orange-600 border-orange-200", icon: FileQuestion }
      case 'examen':
        return { label: "Sujet d'Examen", color: "bg-purple-500/10 text-purple-600 border-purple-200", icon: GraduationCap }
      case 'fiche':
        return { label: "Fiche de Révision", color: "bg-indigo-500/10 text-indigo-600 border-indigo-200", icon: Sparkles }
      case 'epub':
        return { label: "Manuel / EPUB", color: "bg-blue-500/10 text-blue-600 border-blue-200", icon: BookOpen }
      default:
        return { label: "Cours PDF", color: "bg-primary/10 text-primary border-primary/20", icon: FileText }
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-8 animate-in fade-in duration-700 w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bibliothèque & Supports Pédagogiques</h1>
          <p className="text-sm text-slate-500">Espace de partage des cours, sujets, devoirs, contrôles, corrigés et vidéos pour les élèves</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData} disabled={loading} className="gap-2 rounded-2xl border-slate-200 font-bold hover:bg-slate-50">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          {isPublisher && (
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 rounded-2xl shadow-lg font-bold bg-primary text-white hover:bg-primary/90 border-none">
                  <Plus className="h-4 w-4" />
                  Envoyer un support
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Publier un support aux élèves</DialogTitle>
                    <DialogDescription>
                      Transmettez des cours (fichiers/vidéos), sujets ou corrigés d&apos;exercices/devoirs/examens.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label>Titre du support</Label>
                      <Input
                        placeholder="Ex: Cours d'Algèbre / Sujet BAC Blanc / Corrigé Devoir N°2"
                        value={titre}
                        onChange={(e) => setTitre(e.target.value)}
                        required
                        className="rounded-xl"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Auteur / Enseignant</Label>
                        <Input
                          placeholder="Ex: M. Kouassi / Direction"
                          value={auteur}
                          onChange={(e) => setAuteur(e.target.value)}
                          required
                          className="rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Format / Type</Label>
                        <Select value={type} onValueChange={setType}>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="pdf">Cours (Document PDF)</SelectItem>
                            <SelectItem value="video">Cours Vidéo / Tutoriel</SelectItem>
                            <SelectItem value="exercice">Sujet d&apos;Exercice / Devoir</SelectItem>
                            <SelectItem value="controle">Sujet de Contrôle</SelectItem>
                            <SelectItem value="examen">Sujet d&apos;Examen (BAC / BEPC)</SelectItem>
                            <SelectItem value="corrige">Corrigé Officiel & Barème</SelectItem>
                            <SelectItem value="fiche">Fiche de Révision / Synthèse</SelectItem>
                            <SelectItem value="epub">Manuel / Livre Numérique</SelectItem>
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
                            <SelectItem value="Philosophie">Philosophie</SelectItem>
                            <SelectItem value="Informatique">Informatique</SelectItem>
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
                            <SelectItem value="Quatrieme">Quatrième</SelectItem>
                            <SelectItem value="Cinquieme">Cinquième</SelectItem>
                            <SelectItem value="Sixieme">Sixième</SelectItem>
                            <SelectItem value="Tous">Tous les niveaux</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Joindre un fichier local (PDF, Word, Vidéo...)</Label>
                      <Input
                        type="file"
                        onChange={handleFileChange}
                        className="rounded-xl cursor-pointer"
                      />
                      {selectedFile && (
                        <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                          <Paperclip className="h-3.5 w-3.5" /> Fichier sélectionné : {selectedFile.name}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Ou Lien Web / Drive / YouTube (Optionnel)</Label>
                      <Input
                        placeholder="https://drive.google.com/... ou https://youtube.com/..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} className="rounded-xl">
                      Annuler
                    </Button>
                    <Button type="submit" disabled={actionLoading} className="rounded-xl bg-primary text-white font-bold border-none">
                      {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Envoyer aux élèves"}
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
                  placeholder="Rechercher par titre, matière, auteur..." 
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
                  <SelectItem value="Histoire-Geo">Histoire-Géo</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[180px] rounded-2xl border-slate-200">
                  <SelectValue placeholder="Format" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="all">Tous les formats</SelectItem>
                  <SelectItem value="pdf">Cours Document PDF</SelectItem>
                  <SelectItem value="video">Cours Vidéo</SelectItem>
                  <SelectItem value="exercice">Exercice / Devoir</SelectItem>
                  <SelectItem value="controle">Contrôle</SelectItem>
                  <SelectItem value="examen">Examen (BAC/BEPC)</SelectItem>
                  <SelectItem value="corrige">Corrigé Officiel</SelectItem>
                  <SelectItem value="fiche">Fiche de Révision</SelectItem>
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
          {filteredBooks.map(b => {
            const badgeInfo = getTypeBadge(b.type)
            const TypeIcon = badgeInfo.icon

            return (
              <Card key={b.id} className="border-slate-200 rounded-3xl shadow-sm bg-white overflow-hidden flex flex-col justify-between hover:shadow-xl transition-all duration-300">
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="font-bold text-[10px] uppercase rounded-full border-slate-200">
                      {b.niveau}
                    </Badge>
                    <div className={`p-2 rounded-xl flex items-center justify-center ${badgeInfo.color}`}>
                      <TypeIcon className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2">{b.titre}</h3>
                    <p className="text-xs text-slate-500 font-medium">Par {b.auteur}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className="bg-primary/10 text-primary border-none font-bold text-[10px] uppercase">
                      {b.matiere}
                    </Badge>
                    <Badge variant="secondary" className={`font-bold text-[10px] uppercase ${badgeInfo.color}`}>
                      {badgeInfo.label}
                    </Badge>
                  </div>
                </div>

                <div className="p-4 bg-slate-50/80 border-t flex items-center justify-between gap-2">
                  <Button variant="ghost" size="sm" className="gap-2 rounded-xl text-primary font-bold hover:bg-primary/10 flex-1 justify-start" asChild>
                    <a href={b.url} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4" />
                      Télécharger / Consulter
                    </a>
                  </Button>
                  {isPublisher && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-600 rounded-full hover:bg-rose-50 shrink-0" onClick={() => handleDelete(b.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </Card>
            )
          })}
          {filteredBooks.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-400 italic">
              Aucune ressource ou support pédagogique trouvé.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

