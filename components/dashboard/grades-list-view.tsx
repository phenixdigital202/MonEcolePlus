"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Filter, Download, Trash2, Edit, Loader2 } from "lucide-react"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { deleteGradeAction, updateGradeAction } from "@/lib/grades-actions"
import { toast } from "sonner"

interface GradesListViewProps {
  initialNotes: any[]
  classes: any[]
}

export function GradesListView({ initialNotes, classes }: GradesListViewProps) {
  const [notes, setNotes] = useState<any[]>(initialNotes)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedClassFilter, setSelectedClassFilter] = useState("all")
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState("all")
  const [editingNote, setEditingNote] = useState<any>(null)
  const [noteToDelete, setNoteToDelete] = useState<any>(null)
  const [editValue, setEditValue] = useState("")
  const [editComment, setEditComment] = useState("")
  const [actionLoading, setActionLoading] = useState(false)

  // Extract unique subjects
  const subjects = Array.from(new Set(notes.map(n => n.evaluation?.matiere).filter(Boolean)))

  const filteredNotes = notes.filter(n => {
    const studentName = n.user?.nom || ""
    const subjectName = n.evaluation?.matiere || ""
    const className = n.evaluation?.classe?.nom || ""
    const classId = n.evaluation?.id_classe?.toString() || ""

    const matchesSearch = studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          subjectName.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesClass = selectedClassFilter === "all" || classId === selectedClassFilter || className === selectedClassFilter
    const matchesSubject = selectedSubjectFilter === "all" || subjectName === selectedSubjectFilter

    return matchesSearch && matchesClass && matchesSubject
  })

  const handleUpdateGrade = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingNote) return
    const val = parseFloat(editValue)
    if (isNaN(val) || val < 0 || val > 20) {
      toast.error("La note doit être comprise entre 0 et 20")
      return
    }

    setActionLoading(true)
    const res = await updateGradeAction(editingNote.id, val, editComment)
    if (res.success) {
      toast.success("Note mise à jour")
      setNotes(prev => prev.map(n => n.id === editingNote.id ? { ...n, valeur: val.toString(), commentaire: editComment } : n))
      setEditingNote(null)
    } else {
      toast.error(res.error || "Erreur de mise à jour")
    }
    setActionLoading(false)
  }

  const handleDeleteGrade = async () => {
    if (!noteToDelete) return
    setActionLoading(true)
    const res = await deleteGradeAction(noteToDelete.id)
    if (res.success) {
      toast.success("Note supprimée")
      setNotes(prev => prev.filter(n => n.id !== noteToDelete.id))
      setNoteToDelete(null)
    } else {
      toast.error(res.error || "Erreur de suppression")
    }
    setActionLoading(false)
  }

  const handleExportCSV = () => {
    const headers = ["ID", "Élève", "Classe", "Matière", "Note", "Commentaire", "Date Évaluation"]
    const csvData = filteredNotes.map(n => [
      n.id,
      n.user?.nom || "Élève",
      n.evaluation?.classe?.nom || "Non inscrite",
      n.evaluation?.matiere || "",
      Number(n.valeur).toFixed(2),
      n.commentaire || "",
      n.evaluation?.date_eval ? new Date(n.evaluation.date_eval).toLocaleDateString("fr-FR") : ""
    ])

    const csvContent = [headers, ...csvData].map(e => e.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `tableau_notes_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Tableau des notes exporté en CSV")
  }

  return (
    <>
      <DashboardHeader 
        title="Tableau des Notes" 
        subtitle="Consultez l'historique complet des résultats de tous les élèves"
      />
      
      <main className="p-4 md:p-8 space-y-6">
        {/* Filters and Actions Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 flex-col sm:flex-row gap-3 w-full">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                className="pl-9 rounded-xl border-slate-200" 
                placeholder="Chercher un élève ou une matière..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select value={selectedClassFilter} onValueChange={setSelectedClassFilter}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Toutes les classes" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">Toutes les classes</SelectItem>
                  {classes.map(c => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {subjects.length > 0 && (
              <div className="w-full sm:w-48">
                <Select value={selectedSubjectFilter} onValueChange={setSelectedSubjectFilter}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Toutes les matières" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">Toutes les matières</SelectItem>
                    {subjects.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <Button variant="outline" className="rounded-xl gap-2 hover:bg-slate-50" onClick={handleExportCSV}>
            <Download className="h-4 w-4" />
            Exporter CSV
          </Button>
        </div>

        {/* Table Card */}
        <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
          <CardHeader className="bg-slate-50/50 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-slate-800">Liste exhaustive des notes ({filteredNotes.length})</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-slate-100 bg-slate-50/20">
                    <th className="p-4 font-black text-slate-400 text-[10px] uppercase tracking-widest">Date</th>
                    <th className="p-4 font-black text-slate-400 text-[10px] uppercase tracking-widest">Élève</th>
                    <th className="p-4 font-black text-slate-400 text-[10px] uppercase tracking-widest">Classe</th>
                    <th className="p-4 font-black text-slate-400 text-[10px] uppercase tracking-widest">Matière</th>
                    <th className="p-4 font-black text-slate-400 text-[10px] uppercase tracking-widest text-center">Note / 20</th>
                    <th className="p-4 font-black text-slate-400 text-[10px] uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredNotes.map((note) => {
                    const val = Number(note.valeur)
                    const dateStr = note.evaluation?.date_eval ? new Date(note.evaluation.date_eval).toLocaleDateString('fr-FR') : "N/A"
                    return (
                      <tr key={note.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 text-xs font-medium text-slate-600">
                          {dateStr}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center text-[10px] font-bold">
                              {note.user?.nom ? note.user.nom.split(" ").map((n: string) => n[0]).join("") : "E"}
                            </div>
                            <span className="font-bold text-sm text-slate-800">{note.user?.nom}</span>
                          </div>
                        </td>
                        <td className="p-4 text-xs font-bold text-slate-600">{note.evaluation?.classe?.nom || "Non assignée"}</td>
                        <td className="p-4 text-xs font-bold text-slate-700">{note.evaluation?.matiere}</td>
                        <td className="p-4 text-center">
                          <Badge 
                            variant="secondary" 
                            className={`font-black text-xs px-2.5 py-0.5 border-none ${val >= 14 ? 'bg-emerald-500/10 text-emerald-600' : val >= 10 ? 'bg-amber-500/10 text-amber-600' : 'bg-rose-500/10 text-rose-600'}`}
                          >
                            {val.toFixed(2)}/20
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 rounded-full text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                              onClick={() => {
                                setEditingNote(note)
                                setEditValue(Number(note.valeur).toString())
                                setEditComment(note.commentaire || "")
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                              onClick={() => setNoteToDelete(note)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {filteredNotes.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-20 text-center text-slate-400 italic">
                        Aucune note correspondant à vos critères de recherche.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Edit Note Modal */}
      <Dialog open={!!editingNote} onOpenChange={(open) => !open && setEditingNote(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          {editingNote && (
            <form onSubmit={handleUpdateGrade} className="space-y-4">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Modifier la note</DialogTitle>
                <DialogDescription>
                  Élève : <span className="font-bold text-slate-800">{editingNote.user?.nom}</span> ({editingNote.evaluation?.matiere})
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-valeur">Note sur 20</Label>
                  <Input 
                    id="edit-valeur"
                    type="number"
                    step="0.25"
                    min="0"
                    max="20"
                    className="rounded-xl text-center font-bold text-lg"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-comment">Observation / Commentaire</Label>
                  <Input 
                    id="edit-comment"
                    placeholder="Ex: Travail sérieux..."
                    className="rounded-xl"
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingNote(null)} className="rounded-xl">Annuler</Button>
                <Button type="submit" disabled={actionLoading} className="rounded-xl bg-primary text-white border-none">
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Note Alert */}
      <AlertDialog open={!!noteToDelete} onOpenChange={(open) => !open && setNoteToDelete(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive font-bold">Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer la note de {Number(noteToDelete?.valeur).toFixed(2)}/20 pour {noteToDelete?.user?.nom} ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteGrade}
              disabled={actionLoading}
              className="bg-destructive hover:bg-destructive/90 text-white rounded-xl border-none"
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
