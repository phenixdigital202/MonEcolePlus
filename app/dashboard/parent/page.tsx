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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

const children = [
  { 
    id: 1, 
    name: "Lucas Bernard", 
    class: "Terminale S", 
    avatar: "LB",
    averageGrade: 14.5,
    previousAverage: 13.8,
    absences: 2,
    rank: 5,
    totalStudents: 32
  },
  { 
    id: 2, 
    name: "Emma Bernard", 
    class: "Seconde A", 
    avatar: "EB",
    averageGrade: 15.2,
    previousAverage: 15.5,
    absences: 0,
    rank: 3,
    totalStudents: 30
  },
]

const recentGrades = [
  { subject: "Mathématiques", grade: 16, max: 20, date: "15 avril", child: "Lucas", trend: "up" },
  { subject: "Physique-Chimie", grade: 14, max: 20, date: "14 avril", child: "Lucas", trend: "stable" },
  { subject: "Français", grade: 17, max: 20, date: "13 avril", child: "Emma", trend: "up" },
  { subject: "Histoire-Géo", grade: 13, max: 20, date: "12 avril", child: "Emma", trend: "down" },
  { subject: "Anglais", grade: 15, max: 20, date: "11 avril", child: "Lucas", trend: "up" },
]

const upcomingEvents = [
  { type: "exam", title: "Contrôle de Mathématiques", child: "Lucas", date: "20 avril", time: "10:00" },
  { type: "meeting", title: "Réunion parents-profs", child: "Tous", date: "25 avril", time: "18:00" },
  { type: "trip", title: "Sortie scolaire - Musée", child: "Emma", date: "28 avril", time: "08:30" },
  { type: "deadline", title: "Rendu projet SVT", child: "Lucas", date: "30 avril", time: "23:59" },
]

const notifications = [
  { type: "grade", message: "Nouvelle note en Mathématiques pour Lucas", time: "Il y a 2h", read: false },
  { type: "absence", message: "Absence justifiée enregistrée pour Emma", time: "Hier", read: true },
  { type: "message", message: "Message de Mme Laurent (Mathématiques)", time: "Il y a 2 jours", read: true },
]

export default function ParentDashboardPage() {
  const [selectedChild, setSelectedChild] = useState(children[0])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Espace Parent</h1>
          <p className="text-muted-foreground">Suivez la scolarité de vos enfants</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" asChild>
            <Link href="/dashboard/messages">
              <MessageSquare className="h-4 w-4" />
              Messages
            </Link>
          </Button>
          <Button className="gap-2">
            <Bell className="h-4 w-4" />
            <Badge variant="secondary" className="ml-1 bg-white/20">3</Badge>
          </Button>
        </div>
      </div>

      {/* Children Selector */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {children.map((child) => (
          <Card 
            key={child.id}
            className={`min-w-[280px] cursor-pointer transition-all hover:shadow-md ${
              selectedChild.id === child.id 
                ? 'border-primary ring-2 ring-primary/20' 
                : 'border-border/50'
            }`}
            onClick={() => setSelectedChild(child)}
          >
            <CardContent className="flex items-center gap-4 p-4">
              <Avatar className="h-14 w-14">
                <AvatarImage src={`/placeholder-${child.id}.jpg`} />
                <AvatarFallback className="bg-primary/10 text-primary text-lg">
                  {child.avatar}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold">{child.name}</h3>
                <p className="text-sm text-muted-foreground">{child.class}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-lg font-bold text-primary">{child.averageGrade}/20</span>
                  {child.averageGrade > child.previousAverage ? (
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

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Overview Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Moyenne générale</CardTitle>
                <GraduationCap className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{selectedChild.averageGrade}</span>
                  <span className="text-muted-foreground">/20</span>
                </div>
                <div className="mt-1 flex items-center gap-1 text-sm">
                  {selectedChild.averageGrade > selectedChild.previousAverage ? (
                    <>
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      <span className="text-green-500">+{(selectedChild.averageGrade - selectedChild.previousAverage).toFixed(1)}</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-3 w-3 text-red-500" />
                      <span className="text-red-500">{(selectedChild.averageGrade - selectedChild.previousAverage).toFixed(1)}</span>
                    </>
                  )}
                  <span className="text-muted-foreground">vs trimestre précédent</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Classement</CardTitle>
                <Award className="h-4 w-4 text-accent" />
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
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Notes récentes</CardTitle>
                <CardDescription>Dernières évaluations de vos enfants</CardDescription>
              </div>
              <Button variant="ghost" className="gap-1 text-primary" asChild>
                <Link href="/dashboard/grades">
                  Voir tout
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentGrades.map((grade, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-border/50 p-4">
                    <div className="flex items-center gap-4">
                      <div className={`rounded-lg p-2 ${
                        grade.grade >= 15 ? 'bg-green-500/10' : 
                        grade.grade >= 10 ? 'bg-yellow-500/10' : 'bg-red-500/10'
                      }`}>
                        <BookOpen className={`h-5 w-5 ${
                          grade.grade >= 15 ? 'text-green-500' : 
                          grade.grade >= 10 ? 'text-yellow-500' : 'text-red-500'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">{grade.subject}</p>
                        <p className="text-sm text-muted-foreground">{grade.child} - {grade.date}</p>
                      </div>
                    </div>
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
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance by Subject */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Performance par matière</CardTitle>
              <CardDescription>Moyennes de {selectedChild.name} par discipline</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { subject: "Mathématiques", grade: 15.5, classAvg: 12.3 },
                { subject: "Physique-Chimie", grade: 14.2, classAvg: 13.1 },
                { subject: "Français", grade: 13.8, classAvg: 12.8 },
                { subject: "Anglais", grade: 16.0, classAvg: 13.5 },
                { subject: "Histoire-Géo", grade: 12.5, classAvg: 11.9 },
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{item.subject}</span>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-primary font-semibold">{item.grade}/20</span>
                      <span className="text-muted-foreground">Classe: {item.classAvg}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={(item.grade / 20) * 100} className="h-2 flex-1" />
                    <div 
                      className="h-2 w-1 rounded-full bg-muted-foreground/50"
                      style={{ marginLeft: `calc(${(item.classAvg / 20) * 100}% - 2px - 100%)` }}
                      title={`Moyenne de classe: ${item.classAvg}`}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Notifications */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {notifications.map((notif, i) => (
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
              ))}
              <Button variant="ghost" className="w-full text-primary">
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
              {upcomingEvents.map((event, i) => (
                <div key={i} className="flex gap-3 rounded-lg border border-border/50 p-3">
                  <div className={`mt-0.5 rounded-lg p-2 ${
                    event.type === 'exam' ? 'bg-red-500/10' :
                    event.type === 'meeting' ? 'bg-primary/10' :
                    event.type === 'trip' ? 'bg-green-500/10' : 'bg-accent/10'
                  }`}>
                    {event.type === 'exam' && <Star className={`h-4 w-4 text-red-500`} />}
                    {event.type === 'meeting' && <MessageSquare className={`h-4 w-4 text-primary`} />}
                    {event.type === 'trip' && <GraduationCap className={`h-4 w-4 text-green-500`} />}
                    {event.type === 'deadline' && <Clock className={`h-4 w-4 text-accent`} />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.child}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {event.date}
                      <Clock className="h-3 w-3 ml-1" />
                      {event.time}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button variant="outline" className="justify-start gap-2">
                <MessageSquare className="h-4 w-4" />
                Contacter un enseignant
              </Button>
              <Button variant="outline" className="justify-start gap-2">
                <Calendar className="h-4 w-4" />
                Justifier une absence
              </Button>
              <Button variant="outline" className="justify-start gap-2">
                <BookOpen className="h-4 w-4" />
                Voir les devoirs
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
