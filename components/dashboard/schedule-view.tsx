"use client"

import { useState, useMemo } from "react"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Sparkles, 
  Clock 
} from "lucide-react"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { AddCourseModal } from "./add-course-modal"
import Link from "next/link"

const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
const hours = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"]

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

interface ScheduleViewProps {
  initialClasses: { id: number; nom: string }[]
  initialTeachers: { id: number; nom: string }[]
  initialSchedule: any[]
  initialClassId?: string
  isReadOnly?: boolean
  userRole?: string
}

export function ScheduleView({ initialClasses, initialTeachers, initialSchedule, initialClassId, isReadOnly = false, userRole = "admin" }: ScheduleViewProps) {
  const [selectedClassId, setSelectedClassId] = useState(initialClassId || initialClasses[0]?.id?.toString() || "")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Calculate week range
  const weekRange = useMemo(() => {
    const start = new Date(currentDate)
    start.setDate(currentDate.getDate() - currentDate.getDay() + 1)
    const end = new Date(start)
    end.setDate(start.getDate() + 5)
    
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' }
    return `${start.toLocaleDateString('fr-FR', options)} - ${end.toLocaleDateString('fr-FR', options)} ${end.getFullYear()}`
  }, [currentDate])

  const navigateWeek = (direction: 'next' | 'prev') => {
    const next = new Date(currentDate)
    next.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7))
    setCurrentDate(next)
  }

  // Organize schedule into a grid-friendly format
  const scheduleByDayAndHour = useMemo(() => {
    const grid: Record<string, Record<string, any>> = {}
    initialSchedule.forEach(item => {
      // Robust time extraction: Handles both Date objects and strings
      const dateObj = new Date(item.heure_debut)
      let hourStr = ""
      
      try {
        // We try to get the time in a way that ignores timezone shifts if it's just a time column
        // But since we store as UTC in actions, we can use UTC or Locale
        // To be safe and consistent with the 'hours' array, we format as HH:00
        const h = dateObj.getUTCHours()
        const m = dateObj.getUTCMinutes()
        hourStr = `${h < 10 ? '0' + h : h}:${m < 10 ? '0' + m : m}`
      } catch (e) {
        console.error("Date parsing error", e)
      }

      if (!grid[item.jour]) grid[item.jour] = {}
      grid[item.jour][hourStr] = {
        subject: item.matiere,
        teacher: userRole === "teacher" && item.classes?.nom ? `Classe : ${item.classes.nom}` : item.users.nom,
        room: item.salle,
        color: colorMap[item.matiere] || colorMap.default
      }
    })
    return grid
  }, [initialSchedule])

  return (
    <>
      <DashboardHeader 
        title="Emplois du temps" 
        subtitle="Vue calendrier, Génération IA et Drag & Drop pour une gestion simplifiée"
      />
      
      <main className="p-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-6 items-start lg:items-center justify-between">
          <div className="flex items-center gap-4">
            {userRole === "teacher" ? (
              <div className="text-sm font-bold text-primary bg-primary/10 px-4 py-2 rounded-xl">
                Mon Emploi du Temps
              </div>
            ) : (
              <Select value={selectedClassId} onValueChange={setSelectedClassId} disabled={isReadOnly}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Choisir une classe" />
                </SelectTrigger>
                <SelectContent>
                  {initialClasses.map(c => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => navigateWeek('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium text-foreground min-w-[200px] text-center">
                {weekRange}
              </span>
              <Button variant="outline" size="icon" onClick={() => navigateWeek('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {!isReadOnly && (
            <div className="flex gap-2">
              <Link href="/dashboard/schedule/ai">
                <Button variant="outline">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Génération IA
                </Button>
              </Link>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter cours
              </Button>
            </div>
          )}
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-3 px-4 text-left text-sm font-semibold text-foreground w-20">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </th>
                    {days.map((day) => (
                      <th key={day} className="py-3 px-4 text-center text-sm font-semibold text-foreground">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {hours.map((hour) => (
                    <tr key={hour} className="border-b border-border last:border-0">
                      <td className="py-2 px-4 text-xs font-medium text-muted-foreground">
                        {hour}
                      </td>
                      {days.map((day) => {
                        const slot = scheduleByDayAndHour[day]?.[hour]
                        return (
                          <td key={`${day}-${hour}`} className="py-2 px-2">
                            {slot ? (
                              <div className={`${slot.color} rounded-lg p-2 text-white min-h-[60px] shadow-sm`}>
                                <p className="font-bold text-xs">{slot.subject}</p>
                                <p className="text-[10px] opacity-90">{slot.teacher}</p>
                                <p className="text-[10px] opacity-75">{slot.room}</p>
                              </div>
                            ) : hour === "12:00" || hour === "13:00" ? (
                              <div className="bg-muted/50 rounded-lg p-2 min-h-[60px] flex items-center justify-center border border-dashed">
                                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Pause</span>
                              </div>
                            ) : (
                              <div className={cn(
                                "min-h-[60px] rounded-lg border border-dashed border-border transition-colors",
                                !isReadOnly && "hover:border-primary/50 hover:bg-primary/5 cursor-pointer"
                              )} 
                              onClick={() => !isReadOnly && setIsModalOpen(true)} />
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

      <AddCourseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        classes={initialClasses}
        teachers={initialTeachers}
      />
    </>
  )
}
