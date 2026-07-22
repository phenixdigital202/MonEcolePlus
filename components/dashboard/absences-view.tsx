"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Clock, 
  CheckCircle,
  XCircle,
  Calendar,
  Bell,
  AlertTriangle
} from "lucide-react"
import { AbsencesList } from "@/components/dashboard/absences-list"
import { Button } from "@/components/ui/button"
import { AddAbsenceModal } from "./add-absence-modal"
import { useRouter } from "next/navigation"

interface AbsencesViewProps {
  initialAbsences: any[]
  stats: {
    total: number
    justified: number
    unjustified: number
    pending: number
  }
  userRole: string
  teacherClasses?: { id: number; nom: string }[]
}

export function AbsencesView({ initialAbsences, stats, userRole, teacherClasses = [] }: AbsencesViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()

  return (
    <>
      <DashboardHeader 
        title={
          userRole === 'student' ? "Mon Historique d'Assiduité" 
          : userRole === 'parent' ? "Assiduité de mes enfants" 
          : userRole === 'teacher' ? "Appel / Absences de mes Classes"
          : "Gestion des Absences"
        } 
        subtitle={
          userRole === 'student' ? "Suivez votre présence et justifiez vos absences" 
          : userRole === 'parent' ? "Suivez l'assiduité et justifiez les absences de vos enfants" 
          : userRole === 'teacher' ? "Enregistrez et suivez les absences de vos élèves"
          : "Suivez et gérez les absences des élèves"
        }
      >
        {userRole !== 'student' && userRole !== 'parent' && (
          <Button size="sm" className="rounded-xl h-9 px-2 md:px-3 shadow-lg" onClick={() => setIsModalOpen(true)}>
            <Clock className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Marquer une absence</span>
          </Button>
        )}
      </DashboardHeader>
      
      <main className="p-4 md:p-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-800">{stats.total}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Absences</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-800">{stats.justified}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Justifiées</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-800">{stats.unjustified}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Non justifiées</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-800">
                    {userRole === 'student' || userRole === 'parent' ? stats.pending : stats.unjustified}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {userRole === 'student' || userRole === 'parent' ? "En attente" : "Alertes SMS"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alert Banner - only for admin */}
        {stats.unjustified > 0 && userRole !== 'student' && userRole !== 'parent' && userRole !== 'teacher' && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 flex flex-col sm:flex-row items-start sm:items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 animate-pulse">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-slate-800 text-sm">Alertes Automatiques : {stats.unjustified} absences critiques</p>
              <p className="text-xs text-slate-500">Les parents ont été informés en temps réel par SMS et Email.</p>
            </div>
            <Button variant="outline" size="sm" className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs">
              Relancer tout
            </Button>
          </div>
        )}

        <AbsencesList initialAbsences={initialAbsences} isReadOnly={userRole === 'student' || userRole === 'parent'} />

        <AddAbsenceModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => router.refresh()}
          filteredClasses={userRole === 'teacher' ? teacherClasses : undefined}
        />
      </main>
    </>
  )
}
