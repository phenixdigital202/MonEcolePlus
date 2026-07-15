"use client"

import { 
  Trophy, 
  Star, 
  Zap, 
  Target,
  Flame,
  Award,
  Medal,
  Crown,
  Sparkles,
  TrendingUp,
  BookOpen,
  Clock,
  Calendar,
  Lock
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

const achievements = [
  { 
    id: 1, 
    name: "Premier de classe", 
    description: "Obtenir la meilleure moyenne du trimestre",
    icon: Crown,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    unlocked: true,
    date: "Mars 2026",
    xp: 500
  },
  { 
    id: 2, 
    name: "Assiduité parfaite", 
    description: "Aucune absence pendant un mois",
    icon: Target,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    unlocked: true,
    date: "Février 2026",
    xp: 300
  },
  { 
    id: 3, 
    name: "Mathématicien", 
    description: "Obtenir 18/20 ou plus en maths",
    icon: Sparkles,
    color: "text-primary",
    bgColor: "bg-primary/10",
    unlocked: true,
    date: "Janvier 2026",
    xp: 250
  },
  { 
    id: 4, 
    name: "Série en feu", 
    description: "Connexion 30 jours consécutifs",
    icon: Flame,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    unlocked: true,
    date: "Janvier 2026",
    xp: 200
  },
  { 
    id: 5, 
    name: "Polyglotte", 
    description: "Moyenne de 16+ dans 2 langues",
    icon: BookOpen,
    color: "text-accent",
    bgColor: "bg-accent/10",
    unlocked: false,
    progress: 75,
    xp: 350
  },
  { 
    id: 6, 
    name: "Scientifique", 
    description: "Moyenne de 15+ en sciences",
    icon: Zap,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    unlocked: false,
    progress: 90,
    xp: 400
  },
  { 
    id: 7, 
    name: "Mentor", 
    description: "Aider 5 camarades (validé par prof)",
    icon: Star,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    unlocked: false,
    progress: 40,
    xp: 450
  },
  { 
    id: 8, 
    name: "Légende", 
    description: "Atteindre le niveau 50",
    icon: Trophy,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    unlocked: false,
    progress: 0,
    xp: 1000
  },
]

const leaderboard = [
  { rank: 1, name: "Emma Petit", class: "Terminale S", xp: 4850, avatar: "EP" },
  { rank: 2, name: "Lucas Bernard", class: "Terminale S", xp: 4720, avatar: "LB", isCurrentUser: true },
  { rank: 3, name: "Sophie Martin", class: "Terminale ES", xp: 4580, avatar: "SM" },
  { rank: 4, name: "Thomas Durand", class: "Terminale S", xp: 4320, avatar: "TD" },
  { rank: 5, name: "Julie Moreau", class: "Terminale L", xp: 4150, avatar: "JM" },
]

const weeklyQuests = [
  { name: "Rendre tous les devoirs à temps", progress: 80, xp: 100, deadline: "3 jours" },
  { name: "Participer 5 fois en classe", progress: 60, xp: 75, deadline: "3 jours" },
  { name: "Obtenir une note > 15", progress: 100, xp: 150, deadline: "Terminé" },
]

export default function AchievementsPage() {
  const userStats = {
    level: 24,
    currentXP: 2450,
    nextLevelXP: 3000,
    totalXP: 4720,
    streak: 12,
    unlockedAchievements: 4,
    totalAchievements: achievements.length
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Succès et Récompenses</h1>
        <p className="text-muted-foreground">Suivez votre progression et débloquez des récompenses</p>
      </div>

      {/* User Progress */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border/50 md:col-span-2 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent">
          <CardContent className="flex items-center gap-6 p-6">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent">
                <span className="text-3xl font-bold text-white">{userStats.level}</span>
              </div>
              <Badge className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-accent">
                Niveau
              </Badge>
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Progression vers niveau {userStats.level + 1}</span>
                  <span className="text-muted-foreground">{userStats.currentXP}/{userStats.nextLevelXP} XP</span>
                </div>
                <Progress value={(userStats.currentXP / userStats.nextLevelXP) * 100} className="mt-2 h-3" />
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span><strong>{userStats.streak}</strong> jours consécutifs</span>
                </div>
                <div className="flex items-center gap-1">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span><strong>{userStats.unlockedAchievements}</strong>/{userStats.totalAchievements} succès</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">XP Total</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{userStats.totalXP.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              +320 cette semaine
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Classement</CardTitle>
            <Medal className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">#2</div>
            <p className="text-sm text-muted-foreground mt-1">Sur 1,247 élèves</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Achievements Grid */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Tous les succès
              </CardTitle>
              <CardDescription>
                {userStats.unlockedAchievements} sur {userStats.totalAchievements} débloqués
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {achievements.map((achievement) => {
                  const Icon = achievement.icon
                  return (
                    <div 
                      key={achievement.id}
                      className={`relative rounded-lg border p-4 transition-all ${
                        achievement.unlocked 
                          ? 'border-border/50 bg-background hover:shadow-md' 
                          : 'border-dashed border-border/30 bg-muted/20'
                      }`}
                    >
                      <div className="flex gap-4">
                        <div className={`rounded-xl p-3 ${achievement.unlocked ? achievement.bgColor : 'bg-muted'}`}>
                          <Icon className={`h-6 w-6 ${achievement.unlocked ? achievement.color : 'text-muted-foreground'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className={`font-semibold ${!achievement.unlocked && 'text-muted-foreground'}`}>
                                {achievement.name}
                              </h3>
                              <p className="text-sm text-muted-foreground">{achievement.description}</p>
                            </div>
                            {!achievement.unlocked && (
                              <Lock className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          
                          {achievement.unlocked ? (
                            <div className="mt-2 flex items-center justify-between text-sm">
                              <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                                +{achievement.xp} XP
                              </Badge>
                              <span className="text-muted-foreground">{achievement.date}</span>
                            </div>
                          ) : (
                            <div className="mt-2 space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">{achievement.progress}%</span>
                                <Badge variant="outline">+{achievement.xp} XP</Badge>
                              </div>
                              <Progress value={achievement.progress} className="h-1.5" />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {achievement.unlocked && (
                        <div className="absolute -right-1 -top-1">
                          <div className="rounded-full bg-green-500 p-1">
                            <Award className="h-3 w-3 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Weekly Quests */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-accent" />
                Quêtes de la semaine
              </CardTitle>
              <CardDescription>Terminez-les pour gagner des XP bonus</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {weeklyQuests.map((quest, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{quest.name}</span>
                    <Badge variant={quest.progress === 100 ? "default" : "outline"} className={quest.progress === 100 ? "bg-green-500" : ""}>
                      +{quest.xp} XP
                    </Badge>
                  </div>
                  <Progress value={quest.progress} className="h-2" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{quest.progress}%</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {quest.deadline}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Leaderboard */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Medal className="h-5 w-5 text-primary" />
                Classement
              </CardTitle>
              <CardDescription>Top 5 de l&apos;établissement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {leaderboard.map((user) => (
                <div 
                  key={user.rank}
                  className={`flex items-center gap-3 rounded-lg border p-3 ${
                    user.isCurrentUser 
                      ? 'border-primary/50 bg-primary/5' 
                      : 'border-border/50'
                  }`}
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold ${
                    user.rank === 1 ? 'bg-yellow-500 text-white' :
                    user.rank === 2 ? 'bg-gray-300 text-gray-700' :
                    user.rank === 3 ? 'bg-amber-600 text-white' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {user.rank}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {user.name}
                      {user.isCurrentUser && <span className="text-primary ml-1">(vous)</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">{user.class}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{user.xp.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">XP</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Next Reward */}
          <Card className="border-border/50 bg-gradient-to-br from-accent/10 to-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent" />
                Prochaine récompense
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-accent/20">
                  <Crown className="h-8 w-8 text-accent" />
                </div>
                <h3 className="font-semibold">Badge &quot;Expert&quot;</h3>
                <p className="text-sm text-muted-foreground">Encore 550 XP pour débloquer</p>
                <Progress value={80} className="mt-3 h-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
