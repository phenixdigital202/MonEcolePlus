"use client"

import { useState, useMemo } from "react"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { 
  GripVertical, 
  Clock, 
  Save, 
  RotateCcw,
  AlertCircle
} from "lucide-react"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { updateCoursePosition, checkCourseConflict, optimizeSchedule } from "@/lib/schedule-actions"
import { toast } from "sonner"

const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
const hours = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"]

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
  initialSchedule: any[]
  selectedClassId: number
}

export function ScheduleDndView({ initialClasses, initialSchedule, selectedClassId }: ScheduleDndViewProps) {
  const router = useRouter()
  const [schedule, setSchedule] = useState(initialSchedule)
  const [isSaving, setIsSaving] = useState(false)
  const [draggedItem, setDraggedItem] = useState<any | null>(null)
  const [viewMode, setViewMode] = useState<"weekly" | "monthly">("weekly")

  const handleClassChange = (id: string) => {
    router.push(`/dashboard/schedule/edit?classId=${id}`)
  }

  // Organize schedule into a grid-friendly format
  const grid = useMemo(() => {
    const res: Record<string, Record<string, any>> = {}
    schedule.forEach(item => {
      const hour = new Date(item.heure_debut).toISOString().substring(11, 16)
      if (!res[item.jour]) res[item.jour] = {}
      res[item.jour][hour] = item
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

    // 1. Check for conflicts before applying updates
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

    // Update local state for immediate feedback
    const updatedSchedule = schedule.map(item => {
      if (item.id === courseId) {
        // Construct new date with the target hour
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

    // Save to DB
    const res = await updateCoursePosition(courseId, day as any, hour)
    if (res.success) {
      toast.success("Cours déplacé avec succès")
    } else {
      toast.error("Erreur lors du déplacement")
      // Revert on error
      setSchedule(initialSchedule)
    }
    setIsSaving(false)
  }

  // Handle Automatic Optimization
  const handleAutoOptimize = async () => {
    setIsSaving(true)
    const res = await optimizeSchedule(selectedClassId)
    if (res.success) {
      toast.success(`${res.resolvedCount} conflit(s) résolu(s) automatiquement !`)
      router.refresh()
    } else {
      toast.error(res.error || "Erreur de résolution automatique")
    }
    setIsSaving(false)
  }

  return (
    <>
      <DashboardHeader 
        title="Gestion Drag & Drop" 
        subtitle="Réorganisez l'emploi du temps en faisant glisser les cours vers de nouveaux créneaux."
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

          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" className="rounded-xl h-10 px-4 gap-1.5 font-bold" onClick={handleAutoOptimize}>
              <Sparkles className="h-4 w-4 text-primary" />
              Résolution IA
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl h-10 px-4" onClick={() => window.print()}>
              Imprimer / PDF
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl h-10 px-4" onClick={() => router.refresh()}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
          </div>
        </div>

        <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white/40 backdrop-blur-md">
          <CardContent className="p-0">
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
                                className={cn(
                                    "rounded-2xl p-4 text-white min-h-[90px] shadow-lg cursor-grab active:cursor-grabbing transition-all hover:scale-[1.02] hover:shadow-2xl relative group/card overflow-hidden",
                                    colorMap[item.matiere] || colorMap.default
                                )}
                              >
                                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                    <GripVertical className="h-4 w-4 text-white/50" />
                                </div>
                                <p className="font-black text-sm tracking-tight mb-1">{item.matiere}</p>
                                <p className="text-[11px] opacity-90 font-bold flex items-center gap-1">
                                    {item.user.nom}
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
    </>
  )
}
