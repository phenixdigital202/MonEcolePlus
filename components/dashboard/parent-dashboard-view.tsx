"use client"

import { useState } from "react"
import { 
  GraduationCap, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Bell,
  MessageSquare,
  Clock,
  BookOpen,
  Award,
  AlertTriangle,
  ChevronRight,
  Star
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

interface ChildData {
  id: number
  name: string
  avatar: string
  class: string
  averageGrade: number
  previousAverage: number
  absences: number
  rank: number
  totalStudents: number
  subjects: Array<{
    subject: string
    studentAvg: string
    classAvg: string
  }>
}

interface ParentDashboardViewProps {
  initialData: {
    children: ChildData[]
    recentGrades: Array<{
      subject: string
      grade: number
      max: number
      date: string
      child: string
      trend: "up" | "down" | "stable"
    }>
    upcomingEvents: Array<{
      type: string
      title: string
      child: string
      date: string
      time: string
    }>
    notifications: Array<{
      type: string
      message: string
      time: string
      read: boolean
    }>
  }
}

export function ParentDashboardView({ initialData }: ParentDashboardViewProps) {
  const { children, recentGrades, upcomingEvents, notifications } = initialData
  const [selectedChildId, setSelectedChildId] = useState<number | null>(
    children[0]?.id || null
  )

  const selectedChild = children.find(c => c.id === selectedChildId) || children[0]

  if (children.length === 0) {
    return (
      <div className="p-4 md:p-8 space-y-6">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center border rounded-xl bg-card p-6">
          <GraduationCap className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold">Aucun enfant trouvé</h2>
          <p className="text-muted-foreground mt-2 max-w-md">
            Aucun compte élève n&apos;est actuellement lié à votre compte parent. Veuillez contacter l&apos;administration de votre établissement.
          </p>
        </div>
      </div>
    )
  }

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="p-4 md:p-8 space-y-6 w-full max-w-full overflow-hidden">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Espace Parent</h1>
          <p className="text-muted-foreground">Suivez la scolarité de vos enfants</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-initial gap-2" asChild>
            <Link href="/dashboard/messages">
              <MessageSquare className="h-4 w-4" />
              Messages
            </Link>
          </Button>
          <Button className="flex-1 sm:flex-initial gap-2 relative">
            <Bell className="h-4 w-4" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-1 bg-white/20 text-white">
                {unreadCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Children Selector */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground">Sélectionner un enfant :</h2>
        <div className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
          {children.map((child) => (
            <Card 
              key={child.id}
              className={`w-full max-w-[300px] sm:w-[280px] shrink-0 cursor-pointer transition-all hover:shadow-md ${
                selectedChild.id === child.id 
                  ? 'border-primary ring-2 ring-primary/20' 
                  : 'border-border/50'
              }`}
              onClick={() => setSelectedChildId(child.id)}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {child.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{child.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{child.class}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-lg font-bold text-primary">{child.averageGrade.toFixed(2)}/20</span>
                    {child.averageGrade >= child.previousAverage ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Overview Cards */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Moyenne générale</CardTitle>
                <GraduationCap className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{selectedChild.averageGrade.toFixed(2)}</span>
                  <span className="text-muted-foreground">/20</span>
                </div>
                <div className="mt-1 flex items-center gap-1 text-sm flex-wrap">
                  {selectedChild.averageGrade >= selectedChild.previousAverage ? (
                    <>
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      <span className="text-green-500">
                        +{(selectedChild.averageGrade - selectedChild.previousAverage).toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-3 w-3 text-red-500" />
                      <span className="text-red-500">
                        {(selectedChild.averageGrade - selectedChild.previousAverage).toFixed(2)}
                      </span>
                    </>
                  )}
                  <span className="text-muted-foreground">vs trimestre précédent</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Classement</CardTitle>
                <Award className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{selectedChild.rank}</span>
                  <span className="text-muted-foreground">/{selectedChild.totalStudents}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Top {Math.round((selectedChild.rank / selectedChild.totalStudents) * 100)}% de la classe
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Absences</CardTitle>
                {selectedChild.absences > 3 ? (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                ) : (
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{selectedChild.absences}</div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedChild.absences === 0 ? 'Aucune absence' : 'ce trimestre'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Grades */}
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
              <div>
                <CardTitle>Notes récentes</CardTitle>
                <CardDescription>Dernières évaluations de vos enfants</CardDescription>
              </div>
              <Button variant="ghost" className="gap-1 text-primary w-full sm:w-auto" asChild>
                <Link href="/dashboard/grades">
                  Voir tout
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentGrades.length > 0 ? (
                  recentGrades.map((grade, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-border/50 p-4 gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`rounded-lg p-2 shrink-0 ${
                          grade.grade >= 15 ? 'bg-green-500/10' : 
                          grade.grade >= 10 ? 'bg-yellow-500/10' : 'bg-red-500/10'
                        }`}>
                          <BookOpen className={`h-5 w-5 ${
                            grade.grade >= 15 ? 'text-green-500' : 
                            grade.grade >= 10 ? 'text-yellow-500' : 'text-red-500'
                          }`} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{grade.subject}</p>
                          <p className="text-sm text-muted-foreground truncate">{grade.child} - {grade.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto border-t sm:border-0 pt-2 sm:pt-0">
                        <span className="text-sm text-muted-foreground sm:hidden">Note:</span>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className={`text-xl font-bold ${
                              grade.grade >= 15 ? 'text-green-500' : 
                              grade.grade >= 10 ? 'text-foreground' : 'text-red-500'
                            }`}>
                              {grade.grade}
                            </span>
                            <span className="text-muted-foreground">/{grade.max}</span>
                          </div>
                          {grade.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                          {grade.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-6 text-muted-foreground text-sm">
                    Aucune note récente enregistrée.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Performance by Subject */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Performance par matière</CardTitle>
              <CardDescription>Moyennes de {selectedChild.name} par discipline</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {selectedChild.subjects.length > 0 ? (
                selectedChild.subjects.map((item, i) => {
                  const studentAvgNum = parseFloat(item.studentAvg)
                  const classAvgNum = parseFloat(item.classAvg)
                  return (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium truncate text-sm sm:text-base">{item.subject}</span>
                        <div className="flex items-center gap-4 text-xs sm:text-sm shrink-0">
                          <span className="text-primary font-semibold">{studentAvgNum.toFixed(2)}/20</span>
                          <span className="text-muted-foreground">Classe: {classAvgNum.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="relative w-full h-2 bg-muted rounded-full overflow-visible mt-2">
                        <Progress value={(studentAvgNum / 20) * 100} className="h-full w-full rounded-full" />
                        <div 
                          className="absolute top-1/2 -translate-y-1/2 h-3.5 w-1.5 bg-amber-500 rounded-full border border-background shadow-xs hover:scale-125 transition-transform cursor-help"
                          style={{ left: `${(classAvgNum / 20) * 100}%` }}
                          title={`Moyenne de classe: ${classAvgNum}`}
                        />
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-center py-6 text-muted-foreground text-sm">
                  Aucune matière configurée pour cette classe.
                </p>
              )}
              {selectedChild.subjects.length > 0 && (
                <div className="flex items-center gap-4 text-xs justify-end pt-2 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-8 bg-primary rounded-full" />
                    <span>Moyenne de l&apos;élève</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-3.5 w-1.5 bg-amber-500 rounded-full" />
                    <span>Moyenne de la classe</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Notifications */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Annonces & Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {notifications.length > 0 ? (
                notifications.map((notif, i) => (
                  <div 
                    key={i} 
                    className={`rounded-lg border p-3 ${
                      notif.read ? 'border-border/50 bg-transparent' : 'border-primary/20 bg-primary/5'
                    }`}
                  >
                    <p className={`text-sm ${notif.read ? 'text-muted-foreground' : 'text-foreground font-medium'}`}>
                      {notif.message}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{notif.time}</p>
                  </div>
                ))
              ) : (
                <p className="text-center py-6 text-muted-foreground text-sm">
                  Aucune annonce pour le moment.
                </p>
              )}
              <Button variant="ghost" className="w-full text-primary text-xs">
                Voir toutes les notifications
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Événements à venir
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event, i) => (
                  <div key={i} className="flex gap-3 rounded-lg border border-border/50 p-3">
                    <div className={`mt-0.5 rounded-lg p-2 shrink-0 ${
                      event.type === 'exam' || event.type === 'controle' || event.type === 'examen' ? 'bg-red-500/10' :
                      event.type === 'meeting' ? 'bg-primary/10' :
                      event.type === 'trip' ? 'bg-green-500/10' : 'bg-accent/10'
                    }`}>
                      {(event.type === 'exam' || event.type === 'controle' || event.type === 'examen') && <Star className={`h-4 w-4 text-red-500`} />}
                      {event.type === 'meeting' && <MessageSquare className={`h-4 w-4 text-primary`} />}
                      {event.type === 'trip' && <GraduationCap className={`h-4 w-4 text-green-500`} />}
                      {event.type !== 'exam' && event.type !== 'controle' && event.type !== 'examen' && event.type !== 'meeting' && event.type !== 'trip' && <Clock className={`h-4 w-4 text-accent`} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{event.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{event.child}</p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 shrink-0" />
                          {event.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 shrink-0" />
                          {event.time}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-6 text-muted-foreground text-sm">
                  Aucun événement ou contrôle prévu.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button variant="outline" className="justify-start gap-2 w-full text-left" asChild>
                <Link href="/dashboard/messages">
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  Contacter un enseignant
                </Link>
              </Button>
              <Button variant="outline" className="justify-start gap-2 w-full text-left" asChild>
                <Link href="/dashboard/absences">
                  <Calendar className="h-4 w-4 shrink-0" />
                  Justifier une absence
                </Link>
              </Button>
              <Button variant="outline" className="justify-start gap-2 w-full text-left" asChild>
                <Link href="/dashboard/grades">
                  <BookOpen className="h-4 w-4 shrink-0" />
                  Voir les devoirs et notes
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
