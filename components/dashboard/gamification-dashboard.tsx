"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  Trophy, 
  Target, 
  Rocket, 
  Crown, 
  Star, 
  Lock,
  User,
  Zap,
  TrendingUp,
  Calculator,
  UserCheck,
  BookOpen,
  GraduationCap,
  Award,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"

const iconMap: Record<string, any> = {
  Calculator,
  UserCheck,
  Star,
  Trophy,
  Rocket,
  Crown,
  BookOpen,
  GraduationCap,
  Award
}

interface GamificationDashboardProps {
  stats: {
    points: number
    level: number
    nextLevelXP: number
    currentXP: number
    earnedBadges: any[]
    allBadges: any[]
    overallAverage?: number | null
    subjectAverages?: Array<{ subject: string; average: number; notesCount: number }>
    notesCount?: number
    absencesCount?: number
    className?: string
  }
  leaderboard: any[]
  currentUserId: number
}

export function GamificationDashboard({ stats, leaderboard, currentUserId }: GamificationDashboardProps) {
  const userRankIndex = leaderboard.findIndex(s => s.id === currentUserId)
  const userRank = userRankIndex !== -1 ? userRankIndex + 1 : leaderboard.length + 1

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* XP & Level Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-indigo-600 to-blue-600 p-6 md:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 grid gap-8 md:grid-cols-2 items-center">
          <div>
             <div className="flex items-center gap-3 mb-2 flex-wrap">
                <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                   <Rocket className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-3xl font-black italic tracking-tight">Niveau {stats.level}</h2>
                  <p className="text-xs text-blue-200 font-semibold">{stats.className || "Élève MonÉcole+"}</p>
                </div>
             </div>
             <p className="text-blue-100 font-medium text-sm mb-6 mt-3">Continue tes efforts pour débloquer le Niveau {stats.level + 1} !</p>
             <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                   <span>XP de progression</span>
                   <span>{stats.currentXP} / {stats.nextLevelXP} XP</span>
                </div>
                <div className="h-4 w-full bg-white/20 rounded-full overflow-hidden border border-white/30 p-1">
                   <div 
                    className="h-full bg-white rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(255,255,255,0.5)]" 
                    style={{ width: `${Math.min(100, Math.max(5, (stats.currentXP / stats.nextLevelXP) * 100))}%` }}
                   />
                </div>
             </div>
          </div>
          <div className="flex justify-center md:justify-end gap-6 sm:gap-8 flex-wrap">
             <div className="text-center">
                <p className="text-4xl md:text-5xl font-black mb-1">{stats.points}</p>
                <p className="text-[10px] uppercase font-bold text-blue-200 tracking-wider">Points Totaux</p>
             </div>
             <div className="h-14 w-px bg-white/20 hidden sm:block" />
             <div className="text-center">
                <p className="text-4xl md:text-5xl font-black mb-1">{stats.earnedBadges.length}</p>
                <p className="text-[10px] uppercase font-bold text-blue-200 tracking-wider">Badges Obtenus</p>
             </div>
             <div className="h-14 w-px bg-white/20 hidden sm:block" />
             <div className="text-center">
                <p className="text-4xl md:text-5xl font-black mb-1">#{userRank}</p>
                <p className="text-[10px] uppercase font-bold text-blue-200 tracking-wider">Rang Classe</p>
             </div>
          </div>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="rounded-3xl border-slate-200 shadow-md bg-white">
          <CardContent className="p-6 flex items-center gap-4">
             <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                <GraduationCap className="h-6 w-6" />
             </div>
             <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Moyenne Générale</p>
                <p className={`text-2xl font-black ${stats.overallAverage && stats.overallAverage >= 14 ? 'text-emerald-600' : stats.overallAverage && stats.overallAverage >= 10 ? 'text-primary' : 'text-slate-800'}`}>
                  {stats.overallAverage !== null && stats.overallAverage !== undefined ? `${stats.overallAverage}/20` : '—'}
                </p>
             </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200 shadow-md bg-white">
          <CardContent className="p-6 flex items-center gap-4">
             <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-bold shrink-0">
                <BookOpen className="h-6 w-6" />
             </div>
             <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Évaluations</p>
                <p className="text-2xl font-black text-slate-800">{stats.notesCount ?? 0} note(s)</p>
             </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200 shadow-md bg-white">
          <CardContent className="p-6 flex items-center gap-4">
             <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 font-bold shrink-0">
                <UserCheck className="h-6 w-6" />
             </div>
             <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Absences</p>
                <p className="text-2xl font-black text-slate-800">{stats.absencesCount ?? 0} absence(s)</p>
             </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200 shadow-md bg-white">
          <CardContent className="p-6 flex items-center gap-4">
             <div className="h-12 w-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-600 font-bold shrink-0">
                <Trophy className="h-6 w-6" />
             </div>
             <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Position</p>
                <p className="text-2xl font-black text-purple-600">Top {userRank <= 3 ? '1-3 🔥' : `${userRank}`}</p>
             </div>
          </CardContent>
        </Card>
      </div>

      {/* Subject Performance Breakdown */}
      {stats.subjectAverages && stats.subjectAverages.length > 0 && (
        <Card className="rounded-3xl border-slate-200 shadow-xl bg-white overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b">
             <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800">
                <TrendingUp className="h-5 w-5 text-primary" />
                Performance par Matière
             </CardTitle>
             <CardDescription className="text-xs">Consultez vos résultats calculés en direct pour chaque discipline.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {stats.subjectAverages.map((sub, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                     <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800 text-sm">{sub.subject}</span>
                        <Badge className={`${sub.average >= 14 ? 'bg-emerald-500' : sub.average >= 10 ? 'bg-primary' : 'bg-rose-500'} text-white border-none text-xs font-black`}>
                          {sub.average}/20
                        </Badge>
                     </div>
                     <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                           <span>Niveau d&apos;acquisition</span>
                           <span>{sub.notesCount} note(s)</span>
                        </div>
                        <Progress value={(sub.average / 20) * 100} className="h-2 rounded-full" />
                     </div>
                  </div>
                ))}
             </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Badges Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
             <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                <Trophy className="h-5 w-5 text-primary" />
                Ma Collection de Badges
             </h3>
             <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
               {stats.earnedBadges.length} / {stats.allBadges.length} Débloqués
             </span>
          </div>

          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
             {stats.allBadges.map((badge) => {
               const Icon = iconMap[badge.icon_name] || Star
               return (
                 <Card key={badge.id} className={cn(
                   "relative overflow-hidden transition-all duration-300 group hover:scale-105 rounded-3xl bg-white",
                   badge.isLocked ? "opacity-50 grayscale border-slate-200" : "border-primary/20 shadow-lg"
                 )}>
                   <CardContent className="p-6 text-center">
                      <div className={cn(
                        "h-14 w-14 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-transform group-hover:rotate-12",
                        badge.isLocked ? "bg-slate-100 text-slate-400" : "bg-primary/10 text-primary shadow-inner"
                      )}>
                        {badge.isLocked ? <Lock className="h-6 w-6 text-slate-400" /> : <Icon className="h-8 w-8" />}
                      </div>
                      <p className="font-bold text-sm text-slate-800 mb-1">{badge.nom}</p>
                      <p className="text-[10px] text-slate-500 leading-tight italic">{badge.description}</p>
                      
                      {!badge.isLocked && (
                        <div className="absolute top-3 right-3">
                           <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
                        </div>
                      )}
                   </CardContent>
                 </Card>
               )
             })}
          </div>
        </div>

        {/* Leaderboard Section */}
        <div className="space-y-6">
           <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800">
              <Crown className="h-5 w-5 text-amber-500" />
              Classement de la Classe
           </h3>
           <Card className="shadow-xl border-slate-200 rounded-3xl bg-white overflow-hidden">
              <CardContent className="p-0">
                 <div className="divide-y divide-slate-100">
                    {leaderboard.length > 0 ? (
                      leaderboard.map((student, index) => (
                        <div 
                          key={student.id} 
                          className={cn(
                            "flex items-center justify-between p-4 transition-colors",
                            student.id === currentUserId ? "bg-primary/10 font-bold" : "hover:bg-slate-50"
                          )}
                        >
                          <div className="flex items-center gap-4">
                             <div className="w-6 text-center shrink-0">
                                {index === 0 ? <Crown className="h-5 w-5 text-amber-500 mx-auto" /> : 
                                 index === 1 ? <div className="h-3 w-3 rounded-full bg-slate-300 mx-auto" /> :
                                 index === 2 ? <div className="h-3 w-3 rounded-full bg-amber-600 mx-auto" /> :
                                 <span className="text-xs font-bold text-slate-400">{index + 1}</span>}
                             </div>
                             <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                                   {student.name ? student.name.substring(0, 2).toUpperCase() : "EL"}
                                </div>
                                <div>
                                   <p className="text-sm font-bold text-slate-800 truncate max-w-[120px]">{student.name}</p>
                                   <p className="text-[10px] text-slate-400 font-semibold">Niveau {student.level || 1}</p>
                                </div>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className="text-sm font-black text-primary">{student.points}</p>
                             <p className="text-[8px] uppercase font-bold text-slate-400">Points</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-xs text-slate-400 italic">
                         Aucun classement disponible pour le moment.
                      </div>
                    )}
                 </div>
              </CardContent>
           </Card>

           <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 shadow-sm">
              <div className="flex gap-3 items-center">
                 <TrendingUp className="h-5 w-5 text-amber-600 shrink-0" />
                 <p className="text-xs text-amber-900 font-bold">
                    {leaderboard.length > 0 && leaderboard.findIndex(s => s.id === currentUserId) === 0 
                      ? "Félicitations ! Vous êtes en tête du classement de votre classe."
                      : leaderboard.length > 0
                        ? `Continuez de participer aux devoirs pour grimper dans le classement !`
                        : "Participez aux devoirs et aux cours pour accumuler vos premiers points !"
                    }
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
