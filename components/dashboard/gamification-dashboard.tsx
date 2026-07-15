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
  UserCheck
} from "lucide-react"
import { cn } from "@/lib/utils"

const iconMap: Record<string, any> = {
  Calculator,
  UserCheck,
  Star,
  Trophy,
  Rocket,
  Crown
}

interface GamificationDashboardProps {
  stats: {
    points: number
    level: number
    nextLevelXP: number
    currentXP: number
    earnedBadges: any[]
    allBadges: any[]
  }
  leaderboard: any[]
  currentUserId: number
}

export function GamificationDashboard({ stats, leaderboard, currentUserId }: GamificationDashboardProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* XP & Level Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-blue-600 p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="relative z-10 grid gap-8 md:grid-cols-2 items-center">
          <div>
             <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                   <Rocket className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-black italic tracking-tight">Niveau {stats.level}</h2>
             </div>
             <p className="text-blue-100 font-medium mb-6">Continue tes efforts pour débloquer le Niveau {stats.level + 1} !</p>
             <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold uppercase tracking-wider">
                   <span>XP de progression</span>
                   <span>{stats.currentXP} / {stats.nextLevelXP} XP</span>
                </div>
                <div className="h-4 w-full bg-white/20 rounded-full overflow-hidden border border-white/30 p-1">
                   <div 
                    className="h-full bg-white rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(255,255,255,0.5)]" 
                    style={{ width: `${(stats.currentXP / stats.nextLevelXP) * 100}%` }}
                   />
                </div>
             </div>
          </div>
          <div className="flex justify-center md:justify-end gap-8">
             <div className="text-center">
                <p className="text-5xl font-black mb-1">{stats.points}</p>
                <p className="text-xs uppercase font-bold text-blue-200">Points Totaux</p>
             </div>
             <div className="h-16 w-px bg-white/20" />
             <div className="text-center">
                <p className="text-5xl font-black mb-1">{stats.earnedBadges.length}</p>
                <p className="text-xs uppercase font-bold text-blue-200">Badges</p>
             </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Badges Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
             <h3 className="text-xl font-bold flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Ma Collection de Badges
             </h3>
             <span className="text-xs font-bold text-muted-foreground uppercase">{stats.earnedBadges.length} / {stats.allBadges.length} Débloqués</span>
          </div>

          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
             {stats.allBadges.map((badge) => {
               const Icon = iconMap[badge.icon_name] || Star
               return (
                 <Card key={badge.id} className={cn(
                   "relative overflow-hidden transition-all duration-300 group hover:scale-105",
                   badge.isLocked ? "opacity-50 grayscale" : "border-primary/20 shadow-md"
                 )}>
                   <CardContent className="p-6 text-center">
                      <div className={cn(
                        "h-14 w-14 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-transform group-hover:rotate-12",
                        badge.isLocked ? "bg-muted" : "bg-primary/10 text-primary shadow-inner"
                      )}>
                        {badge.isLocked ? <Lock className="h-6 w-6" /> : <Icon className="h-8 w-8" />}
                      </div>
                      <p className="font-bold text-sm mb-1">{badge.nom}</p>
                      <p className="text-[10px] text-muted-foreground leading-tight italic">{badge.description}</p>
                      
                      {!badge.isLocked && (
                        <div className="absolute top-2 right-2">
                           <Zap className="h-3 w-3 text-yellow-500 fill-yellow-500" />
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
           <h3 className="text-xl font-bold flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" />
              Classement de la Classe
           </h3>
           <Card className="shadow-lg border-primary/5">
              <CardContent className="p-0">
                 <div className="divide-y">
                    {leaderboard.map((student, index) => (
                      <div 
                        key={student.id} 
                        className={cn(
                          "flex items-center justify-between p-4 transition-colors",
                          student.id === currentUserId ? "bg-primary/10" : "hover:bg-muted/50"
                        )}
                      >
                        <div className="flex items-center gap-4">
                           <div className="w-6 text-center">
                              {index === 0 ? <Crown className="h-5 w-5 text-amber-500 mx-auto" /> : 
                               index === 1 ? <div className="h-2 w-2 rounded-full bg-slate-400 mx-auto" /> :
                               index === 2 ? <div className="h-2 w-2 rounded-full bg-amber-700 mx-auto" /> :
                               <span className="text-xs font-bold text-muted-foreground">{index + 1}</span>}
                           </div>
                           <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center font-bold text-xs">
                                 {student.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                 <p className="text-sm font-bold truncate max-w-[120px]">{student.name}</p>
                                 <p className="text-[10px] text-muted-foreground">Niveau {student.level}</p>
                              </div>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-sm font-black text-primary">{student.points}</p>
                           <p className="text-[8px] uppercase font-bold text-muted-foreground">Points</p>
                        </div>
                      </div>
                    ))}
                 </div>
              </CardContent>
           </Card>

           <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <div className="flex gap-3 items-center">
                 <TrendingUp className="h-5 w-5 text-amber-600" />
                 <p className="text-xs text-amber-800 font-medium">
                    {leaderboard.findIndex(s => s.id === currentUserId) === 0 
                      ? "Tu es premier ! Garde la tête du classement."
                      : `Tu es à ${leaderboard[0].points - stats.points} points de la 1ère place. Lâche rien !`}
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
