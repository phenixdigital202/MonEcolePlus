"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, BookOpen, Plus, MoreVertical, Trash2 } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { CreateEvaluationModal } from "./create-evaluation-modal"
import { EditEvaluationModal } from "./edit-evaluation-modal"
import { deleteEvaluationAction } from "@/lib/grades-actions"
import { toast } from "sonner"
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
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"

interface EvaluationsListViewProps {
  initialEvaluations: any[]
  classes: any[]
}

export function EvaluationsListView({ initialEvaluations, classes }: EvaluationsListViewProps) {
  const [evaluations, setEvaluations] = useState(initialEvaluations)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [currentEvaluation, setCurrentEvaluation] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const subjects = [
    "Mathématiques", "Français", "Anglais", "Physique-Chimie", "SVT", "Histoire-Géographie"
  ]

  const handleDelete = async () => {
    if (!currentEvaluation) return
    setIsDeleting(true)
    const res = await deleteEvaluationAction(currentEvaluation.id)
    if (res.success) {
      toast.success("Évaluation supprimée")
      setEvaluations(prev => prev.filter(e => e.id !== currentEvaluation.id))
      setIsDeleteAlertOpen(false)
    } else {
      toast.error(res.error || "Erreur lors de la suppression")
    }
    setIsDeleting(false)
  }

  return (
    <>
      <DashboardHeader 
        title="Liste des Évaluations & Devoirs" 
        subtitle="Gérez l'ensemble des contrôles et devoirs programmés"
      >
        <Button className="rounded-xl shadow-lg" onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Évaluation
        </Button>
      </DashboardHeader>
      
      <main className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
            <Card className="bg-primary/5 border-primary/10">
                <CardContent className="p-4">
                    <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Total</p>
                    <p className="text-2xl font-black text-slate-800">{evaluations.length}</p>
                </CardContent>
            </Card>
            <Card className="bg-blue-500/5 border-blue-500/10">
                <CardContent className="p-4">
                    <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">Devoirs</p>
                    <p className="text-2xl font-black text-slate-800">{evaluations.filter(e => e.type_eval === 'devoir').length}</p>
                </CardContent>
            </Card>
            <Card className="bg-amber-500/5 border-amber-500/10">
                <CardContent className="p-4">
                    <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Examens</p>
                    <p className="text-2xl font-black text-slate-800">{evaluations.filter(e => e.type_eval === 'examen').length}</p>
                </CardContent>
            </Card>
            <Card className="bg-emerald-500/5 border-emerald-500/10">
                <CardContent className="p-4">
                    <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-1">Notes Saisies</p>
                    <p className="text-2xl font-black text-slate-800">{evaluations.reduce((acc, curr) => acc + curr._count.notes, 0)}</p>
                </CardContent>
            </Card>
        </div>

        <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
          <CardHeader className="border-b bg-slate-50/50">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Historique des Évaluations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-slate-100 bg-slate-50/20">
                    <th className="p-4 font-black text-slate-400 text-[10px] uppercase tracking-widest">Date</th>
                    <th className="p-4 font-black text-slate-400 text-[10px] uppercase tracking-widest">Matière</th>
                    <th className="p-4 font-black text-slate-400 text-[10px] uppercase tracking-widest">Classe</th>
                    <th className="p-4 font-black text-slate-400 text-[10px] uppercase tracking-widest text-center">Type</th>
                    <th className="p-4 font-black text-slate-400 text-[10px] uppercase tracking-widest text-center">Participation</th>
                    <th className="p-4 font-black text-slate-400 text-[10px] uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {evaluations.map((ev) => (
                    <tr key={ev.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-slate-600">
                            <Calendar className="h-4 w-4 opacity-40" />
                            <span className="text-sm font-medium">{new Date(ev.date_eval).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-slate-800 text-sm">
                        {ev.matiere}
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 font-bold">
                            {ev.classes.nom}
                        </Badge>
                      </td>
                      <td className="p-4 text-center">
                        <Badge 
                            className={cn(
                                "rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-tighter",
                                ev.type_eval === 'examen' ? "bg-amber-500 hover:bg-amber-600" : 
                                ev.type_eval === 'controle' ? "bg-blue-500 hover:bg-blue-600" : 
                                "bg-slate-500 hover:bg-slate-600"
                            )}
                        >
                            {ev.type_eval || 'devoir'}
                        </Badge>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-xs font-bold text-slate-700">{ev._count.notes} notes</span>
                            <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: ev._count.notes > 0 ? '100%' : '0%' }} />
                            </div>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1">
                            <Link href={`/dashboard/grades?evalId=${ev.id}&classId=${ev.id_classe}`}>
                                <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10 font-bold text-xs">
                                    Saisir
                                </Button>
                            </Link>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 rounded-full">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="rounded-xl border-slate-100 shadow-xl">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="cursor-pointer gap-2"
                                  onClick={() => {
                                    setCurrentEvaluation(ev)
                                    setIsEditModalOpen(true)
                                  }}
                                >
                                  Modifier
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="cursor-pointer gap-2 text-destructive"
                                  onClick={() => {
                                    setCurrentEvaluation(ev)
                                    setIsDeleteAlertOpen(true)
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" /> Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {evaluations.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-20 text-center">
                        <div className="bg-slate-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BookOpen className="h-8 w-8 text-slate-200" />
                        </div>
                        <p className="text-slate-400 italic font-medium">Aucune évaluation programmée.</p>
                        <Button variant="link" className="text-primary font-bold mt-2" onClick={() => setIsModalOpen(true)}>
                            Créer la première évaluation
                        </Button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>

      <CreateEvaluationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        classId={classes[0]?.id || 0}
        className={classes[0]?.nom || ""}
        subjects={subjects}
        onSuccess={(ev) => {
          setEvaluations(prev => [ev, ...prev])
          setIsModalOpen(false)
        }}
      />

      <EditEvaluationModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        evaluation={currentEvaluation}
        subjects={subjects}
        onSuccess={(updatedEv) => {
          setEvaluations(prev => prev.map(e => e.id === updatedEv.id ? { ...e, ...updatedEv } : e))
          setIsEditModalOpen(false)
        }}
      />

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Cela supprimera définitivement l'évaluation
              et toutes les données associées. Notez que vous ne pouvez pas supprimer une évaluation si des notes y sont déjà rattachées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
