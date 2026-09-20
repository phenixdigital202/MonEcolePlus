"use client"

import { useState, useMemo, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { 
  GripVertical, 
  Clock, 
  Save, 
  RotateCcw,
  Sparkles,
  Edit3,
  Trash2,
  Loader2,
  Printer,
  FileDown,
  ChevronDown
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { useRouter } from "next/navigation"
import { 
  updateCoursePosition, 
  checkCourseConflict, 
  getScheduleData, 
  optimizeOrGenerateScheduleForClass,
  resetClassScheduleAction,
  updateCourseDetailsAction,
  deleteCourseAction
} from "@/lib/schedule-actions"
import { getSchoolInfoAction } from "@/lib/documents-actions"
import { downloadDocumentAsPdf } from "@/lib/pdf-export-utils"
import { toast } from "sonner"

const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
const hours = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"]
const defaultMatieres = ["Mathématiques", "Français", "Anglais", "SVT", "Physique-Chimie", "Histoire-Géo", "EPS", "Philosophie", "Espagnol", "Allemand"]

const colorMap: Record<string, string> = {
  "Mathématiques": "bg-blue-500",
  "Français": "bg-purple-500",
  "Anglais": "bg-orange-500",
  "SVT": "bg-emerald-500",
  "Physique-Chimie": "bg-red-500",
  "Histoire-Géo": "bg-amber-600",
  "EPS": "bg-slate-500",
  "default": "bg-primary"
}

interface ScheduleDndViewProps {
  initialClasses: { id: number; nom: string }[]
  initialTeachers?: { id: number; nom: string }[]
  initialSchedule: any[]
  selectedClassId: number
}

export function ScheduleDndView({ initialClasses, initialTeachers = [], initialSchedule, selectedClassId }: ScheduleDndViewProps) {
  const router = useRouter()
  const [schedule, setSchedule] = useState(initialSchedule)
  const [isSaving, setIsSaving] = useState(false)
  const [draggedItem, setDraggedItem] = useState<any | null>(null)
  const [viewMode, setViewMode] = useState<"weekly" | "monthly">("weekly")
  const [schoolInfo, setSchoolInfo] = useState<any>(null)

  // Edit course state
  const [editingCourse, setEditingCourse] = useState<any | null>(null)
  const [editMatiere, setEditMatiere] = useState("")
  const [editTeacherId, setEditTeacherId] = useState("")
  const [editSalle, setEditSalle] = useState("")
  const [editJour, setEditJour] = useState("")
  const [editHour, setEditHour] = useState("")

  useEffect(() => {
    setSchedule(initialSchedule)
  }, [initialSchedule])

  useEffect(() => {
    getSchoolInfoAction().then(res => {
      if (res.success) setSchoolInfo(res.data)
    })
  }, [])

  const handleClassChange = (id: string) => {
    router.push(`/dashboard/schedule/edit?classId=${id}`)
  }

  // Organize schedule into a grid-friendly format
  const grid = useMemo(() => {
    const res: Record<string, Record<string, any>> = {}
    schedule.forEach(item => {
      let hour = ""
      if (item.heure_debut) {
        const d = new Date(item.heure_debut)
        if (!isNaN(d.getTime())) {
          const h = d.getUTCHours()
          const m = d.getUTCMinutes()
          hour = `${h < 10 ? '0' + h : h}:${m < 10 ? '0' + m : m}`
        }
      }
      if (!hour && typeof item.heure_debut === "string") {
        const match = item.heure_debut.match(/(\d{2}:\d{2})/)
        if (match) hour = match[1]
      }
      if (!res[item.jour]) res[item.jour] = {}
      if (hour) res[item.jour][hour] = item
    })
    return res
  }, [schedule])

  const onDragStart = (e: React.DragEvent, item: any) => {
    setDraggedItem(item)
    e.dataTransfer.setData("courseId", item.id.toString())
    e.dataTransfer.effectAllowed = "move"
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const onDrop = async (e: React.DragEvent, day: string, hour: string) => {
    e.preventDefault()
    const courseId = parseInt(e.dataTransfer.getData("courseId"))
    
    if (!draggedItem || draggedItem.id !== courseId) return

    setIsSaving(true)
    const conflictCheck = await checkCourseConflict(
      courseId,
      draggedItem.id_enseignant,
      draggedItem.salle || "Salle 101",
      day,
      hour
    )

    if (conflictCheck.conflict) {
      toast.error(conflictCheck.reason || "Conflit d'affectation détecté !")
      setIsSaving(false)
      return
    }

    const updatedSchedule = schedule.map(item => {
      if (item.id === courseId) {
        const newHeureDebut = new Date(item.heure_debut)
        newHeureDebut.setUTCHours(parseInt(hour.split(":")[0]), parseInt(hour.split(":")[1]), 0)
        
        return {
          ...item,
          jour: day,
          heure_debut: newHeureDebut.toISOString()
        }
      }
      return item
    })

    setSchedule(updatedSchedule)
    setDraggedItem(null)

    const res = await updateCoursePosition(courseId, day as any, hour)
    if (res.success) {
      toast.success("Cours déplacé avec succès")
    } else {
      toast.error(res.error || "Erreur lors du déplacement")
      setSchedule(initialSchedule)
    }
    setIsSaving(false)
  }

  // Handle Automatic AI Optimization / Generation
  const handleAutoOptimize = async () => {
    setIsSaving(true)
    try {
      const res = await optimizeOrGenerateScheduleForClass(selectedClassId)
      if (res.success) {
        toast.success(res.message || "Résolution IA effectuée avec succès !")
        if (res.data) setSchedule(res.data)
        router.refresh()
      } else {
        toast.error(res.error || "Erreur de résolution automatique")
      }
    } catch (e: any) {
      toast.error("Erreur lors de la résolution IA")
    } finally {
      setIsSaving(false)
    }
  }

  // Handle PDF Export / Printing
  const handleDownloadPdf = async () => {
    try {
      toast.info("Génération du fichier PDF en cours...")
      const className = initialClasses.find(c => c.id === selectedClassId)?.nom || "Classe"
      const success = await downloadDocumentAsPdf({
        elementId: "printable-document",
        filename: `Emploi_du_temps_${className.replace(/\s+/g, "_")}.pdf`,
        format: "a4",
        orientation: "landscape"
      })

      if (!success) {
        window.print()
      } else {
        toast.success("Fichier PDF téléchargé avec succès !")
      }
    } catch (err) {
      window.print()
    }
  }

  const handleDirectPrint = () => {
    toast.info("Ouverture de la fenêtre d'impression...")
    setTimeout(() => {
      window.print()
    }, 150)
  }

  // Handle Direct Reset (wipes schedule for this class)
  const handleReset = async () => {
    setIsSaving(true)
    try {
      const res = await resetClassScheduleAction(selectedClassId)
      if (res.success) {
        setSchedule([])
        router.refresh()
        toast.success("Emploi du temps réinitialisé avec succès ! Tous les cours de cette classe ont été effacés.")
      } else {
        toast.error(res.error || "Erreur de réinitialisation")
      }
    } catch (err) {
      toast.error("Erreur lors de la réinitialisation")
    } finally {
      setIsSaving(false)
    }
  }

  // Handle opening Course Edit Modal
  const handleOpenEditModal = (item: any) => {
    setEditingCourse(item)
    setEditMatiere(item.matiere || "")
    setEditTeacherId(item.id_enseignant ? item.id_enseignant.toString() : "")
    setEditSalle(item.salle || "")
    setEditJour(item.jour || "Lundi")
    
    let hStr = "08:00"
    if (item.heure_debut) {
      const d = new Date(item.heure_debut)
      if (!isNaN(d.getTime())) {
        const h = d.getUTCHours()
        const m = d.getUTCMinutes()
        hStr = `${h < 10 ? '0' + h : h}:${m < 10 ? '0' + m : m}`
      }
    }
    setEditHour(hStr)
  }

  // Save modified course details
  const handleSaveCourseEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCourse) return

    setIsSaving(true)
    const res = await updateCourseDetailsAction(editingCourse.id, {
      matiere: editMatiere,
      id_enseignant: editTeacherId ? parseInt(editTeacherId) : undefined,
      salle: editSalle,
      jour: editJour,
      hour: editHour
    })

    if (res.success) {
      toast.success("Cours modifié avec succès !")
      setEditingCourse(null)
      const freshData = await getScheduleData(selectedClassId)
      setSchedule(freshData)
      router.refresh()
    } else {
      toast.error(res.error || "Erreur lors de la modification")
    }
    setIsSaving(false)
  }

  // Delete course
  const handleDeleteCourse = async () => {
    if (!editingCourse) return
    setIsSaving(true)
    const res = await deleteCourseAction(editingCourse.id)
    if (res.success) {
      toast.success("Cours supprimé avec succès !")
      setEditingCourse(null)
      const freshData = await getScheduleData(selectedClassId)
      setSchedule(freshData)
      router.refresh()
    } else {
      toast.error(res.error || "Erreur de suppression")
    }
    setIsSaving(false)
  }

  return (
    <>
      <DashboardHeader 
        title="Gestion Drag & Drop" 
        subtitle="Réorganisez l'emploi du temps en faisant glisser les cours ou en cliquant pour modifier."
      >
         <div className="flex items-center gap-2">
            {isSaving && <div className="text-xs text-primary animate-pulse font-bold flex items-center gap-1">
                <Save className="h-3 w-3" /> Synchronisation...
            </div>}
         </div>
      </DashboardHeader>
      
      <main className="p-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-6 items-start lg:items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 ml-1">Classe à éditer</span>
                <Select value={selectedClassId.toString()} onValueChange={handleClassChange}>
                <SelectTrigger className="w-[200px] rounded-xl border-slate-200">
                    <SelectValue placeholder="Choisir une classe" />
                </SelectTrigger>
                <SelectContent>
                    {initialClasses.map(c => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.nom}</SelectItem>
                    ))}
                </SelectContent>
                </Select>
            </div>
            
            <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 ml-1">Vue</span>
                <div className="flex rounded-xl bg-slate-100 p-0.5 border">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setViewMode("weekly")}
                    className={cn("h-7 text-[10px] font-bold rounded-lg px-3", viewMode === "weekly" ? "bg-white text-slate-800 shadow" : "text-slate-500")}
                  >
                    Hebdo
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setViewMode("monthly")}
                    className={cn("h-7 text-[10px] font-bold rounded-lg px-3", viewMode === "monthly" ? "bg-white text-slate-800 shadow" : "text-slate-500")}
                  >
                    Mensuelle
                  </Button>
                </div>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap print:hidden no-print">
            <Button variant="outline" size="sm" className="rounded-xl h-10 px-4 gap-1.5 font-bold hover:bg-primary/5" onClick={handleAutoOptimize} disabled={isSaving}>
              <Sparkles className="h-4 w-4 text-primary" />
              Résolution IA
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-xl h-10 px-4 gap-1.5 font-bold hover:bg-slate-50 border-slate-200">
                  <Printer className="h-4 w-4 text-slate-600" />
                  Imprimer / PDF
                  <ChevronDown className="h-3.5 w-3.5 opacity-60 ml-0.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-2xl w-56 p-1.5 shadow-xl border-slate-100 bg-white">
                <DropdownMenuItem onClick={handleDownloadPdf} className="rounded-xl cursor-pointer p-2.5 font-medium gap-2 hover:bg-slate-50">
                  <FileDown className="h-4 w-4 text-primary shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800 text-xs">Télécharger le PDF</span>
                    <span className="text-[10px] text-slate-500">Exporter en fichier .pdf</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDirectPrint} className="rounded-xl cursor-pointer p-2.5 font-medium gap-2 hover:bg-slate-50">
                  <Printer className="h-4 w-4 text-slate-700 shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800 text-xs">Imprimer la grille</span>
                    <span className="text-[10px] text-slate-500">Ouvrir l'impression navigateur</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" size="sm" className="rounded-xl h-10 px-4 hover:bg-red-50 text-red-600 border-red-200 font-medium" onClick={handleReset} disabled={isSaving}>
              <RotateCcw className="h-4 w-4 mr-2 text-red-500" />
              Réinitialiser
            </Button>
          </div>
        </div>

        <Card id="printable-document" className="printable-area border-none shadow-xl rounded-3xl overflow-hidden bg-white/40 backdrop-blur-md print:shadow-none print:rounded-none print:bg-white">
          <CardContent className="p-0">
            {/* Print Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 print:bg-white">
              <div className="flex items-center gap-4">
                {schoolInfo?.logo_url && (
                  <img src={schoolInfo.logo_url} alt="Logo Établissement" className="h-12 w-12 object-contain" />
                )}
                <div>
                  <h2 className="font-extrabold text-base text-slate-900 uppercase">{schoolInfo?.nom || "MonÉcole+ Groupe Scolaire"}</h2>
                  <p className="text-xs text-slate-500 font-medium">Emploi du Temps Officiel • {initialClasses.find(c => c.id === selectedClassId)?.nom || "Classe"}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-black uppercase text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full print:border print:border-indigo-200">
                  Année {schoolInfo?.activeSchoolYear || "2026-2027"}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="py-4 px-6 text-left text-xs font-black text-slate-400 uppercase tracking-widest w-24">
                      <Clock className="h-4 w-4" />
                    </th>
                    {days.map((day) => (
                      <th key={day} className="py-4 px-4 text-center text-xs font-black text-slate-500 uppercase tracking-widest">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {hours.map((hour) => (
                    <tr key={hour} className="group hover:bg-slate-50/30 transition-colors">
                      <td className="py-4 px-6 text-sm font-bold text-slate-400 bg-slate-50/20">
                        {hour}
                      </td>
                      {days.map((day) => {
                        const item = grid[day]?.[hour]
                        return (
                          <td 
                            key={`${day}-${hour}`} 
                            className="p-2 min-w-[150px]"
                            onDragOver={onDragOver}
                            onDrop={(e) => onDrop(e, day, hour)}
                          >
                            {item ? (
                              <div 
                                draggable
                                onDragStart={(e) => onDragStart(e, item)}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleOpenEditModal(item)
                                }}
                                className={cn(
                                    "rounded-2xl p-4 text-white min-h-[90px] shadow-lg cursor-pointer transition-all hover:scale-[1.03] hover:shadow-2xl relative group/card overflow-hidden",
                                    colorMap[item.matiere] || colorMap.default
                                )}
                              >
                                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center gap-1">
                                    <Edit3 className="h-3.5 w-3.5 text-white/90" />
                                    <GripVertical className="h-4 w-4 text-white/50" />
                                </div>
                                <p className="font-black text-sm tracking-tight mb-1">{item.matiere}</p>
                                <p className="text-[11px] opacity-90 font-bold flex items-center gap-1">
                                    {item.user?.nom || "Enseignant non renseigné"}
                                </p>
                                <p className="text-[10px] opacity-70 mt-2 font-medium bg-black/10 w-fit px-2 py-0.5 rounded-lg">
                                    {item.salle || "Sans salle"}
                                </p>
                              </div>
                            ) : hour === "12:00" || hour === "13:00" ? (
                                <div className="bg-slate-100/50 rounded-2xl p-4 min-h-[90px] flex items-center justify-center border-2 border-dashed border-slate-200/50">
                                  <span className="text-[10px] text-slate-300 uppercase font-black tracking-widest">Pause</span>
                                </div>
                              ) : (
                              <div className={cn(
                                "min-h-[90px] rounded-2xl border-2 border-dashed border-slate-100 transition-all flex items-center justify-center",
                                "hover:border-primary/30 hover:bg-primary/5 group/slot"
                              )}>
                                <div className="opacity-0 group-hover/slot:opacity-100 transition-opacity text-[10px] text-primary/40 font-black uppercase tracking-widest">
                                    Déposer ici
                                </div>
                              </div>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Edit Course Dialog */}
      <Dialog open={!!editingCourse} onOpenChange={(open) => !open && setEditingCourse(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <form onSubmit={handleSaveCourseEdit} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-primary" />
                Modifier le cours
              </DialogTitle>
              <DialogDescription>
                Modifiez les détails du créneau de cours directement.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="edit-matiere">Matière</Label>
                <Input
                  id="edit-matiere"
                  value={editMatiere}
                  onChange={(e) => setEditMatiere(e.target.value)}
                  placeholder="Ex: Mathématiques"
                  className="rounded-xl"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-teacher">Enseignant</Label>
                <Select value={editTeacherId} onValueChange={setEditTeacherId}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Choisir un enseignant" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {initialTeachers.map(t => (
                      <SelectItem key={t.id} value={t.id.toString()}>{t.nom}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-salle">Salle</Label>
                <Input
                  id="edit-salle"
                  value={editSalle}
                  onChange={(e) => setEditSalle(e.target.value)}
                  placeholder="Ex: Salle 101"
                  className="rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Jour</Label>
                  <Select value={editJour} onValueChange={setEditJour}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {days.map(d => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Heure de début</Label>
                  <Select value={editHour} onValueChange={setEditHour}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {hours.map(h => (
                        <SelectItem key={h} value={h}>{h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                type="button"
                variant="destructive"
                className="rounded-xl gap-2 font-bold w-full sm:w-auto"
                onClick={handleDeleteCourse}
                disabled={isSaving}
              >
                <Trash2 className="h-4 w-4" />
                Supprimer
              </Button>
              <div className="flex gap-2 ml-auto w-full sm:w-auto justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => setEditingCourse(null)}
                  disabled={isSaving}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="rounded-xl font-bold bg-primary text-white hover:bg-primary/90"
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
