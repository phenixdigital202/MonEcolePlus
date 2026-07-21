"use server"

import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Sparkles, 
  AlertTriangle, 
  TrendingUp,
  Users,
  Brain,
  Lightbulb,
  Target,
  RefreshCw,
  ChevronRight,
  Clock,
  BookOpen
} from "lucide-react"
import { getPrisma } from "@/lib/tenant-context"
import { cookies } from "next/headers"

export default async function AIInsightsPage() {
  const prisma = await getPrisma()
  const cookieStore = await cookies()
  const userId = cookieStore.get("user_id")?.value

  if (!userId) return null

  const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } })
  if (!user) return null

  const isTeacher = user.role === "teacher"

  // ── Teacher-specific data ──────────────────────────────────────────────────
  let teacherStats = {
    studentCount: 0,
    classCount: 0,
    subjectName: user.matiere || "Matière",
    avgGrade: 0,
    atRiskCount: 0,
    absentCount: 0,
  }

  let teacherInsights: any[] = []
  let teacherSuggestions: any[] = []

  if (isTeacher) {
    // 1. Get teacher's classes
    const schedules = await prisma.emploiDuTemps.findMany({
      where: { id_enseignant: user.id },
      include: {
        classe: {
          include: {
            inscriptions: { include: { user: true } }
          }
        }
      },
      distinct: ["id_classe"]
    })

    const classIds: number[] = []
    const studentIdSet = new Set<number>()
    const classNames: string[] = []

    for (const s of schedules) {
      if (s.id_classe) classIds.push(s.id_classe)
      if (s.classes) {
        if (!classNames.includes(s.classe.nom)) classNames.push(s.classe.nom)
        for (const ins of s.classe.inscriptions) {
          studentIdSet.add(ins.id_eleve)
        }
      }
    }

    teacherStats.classCount = classIds.length
    teacherStats.studentCount = studentIdSet.size

    // Subject from schedule or user
    const firstScheduleWithSubject = schedules.find(s => s.matiere)
    if (firstScheduleWithSubject?.matiere) {
      teacherStats.subjectName = firstScheduleWithSubject.matiere
    }

    // 2. Average grade for teacher's classes/subject
    if (classIds.length > 0) {
      const dbSubjects = await prisma.emploiDuTemps.findMany({
        where: { id_enseignant: user.id },
        select: { matiere: true },
        distinct: ["matiere"]
      })
      const subjects = dbSubjects.map(s => s.matiere).filter(Boolean) as string[]

      const notesAgg = await prisma.note.aggregate({
        _avg: { valeur: true },
        where: {
          evaluation: {
            id_classe: { in: classIds },
            ...(subjects.length > 0 ? { matiere: { in: subjects } } : {})
          }
        }
      })
      teacherStats.avgGrade = Math.round((Number(notesAgg._avg.valeur) || 0) * 10) / 10

      // 3. At-risk students (average < 10)
      const lowNotes = await prisma.note.groupBy({
        by: ["id_eleve"],
        _avg: { valeur: true },
        where: {
          evaluation: {
            id_classe: { in: classIds },
            ...(subjects.length > 0 ? { matiere: { in: subjects } } : {})
          }
        },
        having: { valeur: { _avg: { lt: 10 } } }
      })
      teacherStats.atRiskCount = lowNotes.length

      // 4. Recent absences count in the last 7 days for teacher's students
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      const recentAbsences = await prisma.absence.count({
        where: {
          id_eleve: { in: Array.from(studentIdSet) },
          date_absence: { gte: oneWeekAgo }
        }
      })
      teacherStats.absentCount = recentAbsences
    }

    // Build dynamic insights
    teacherInsights = [
      ...(teacherStats.atRiskCount > 0 ? [{
        id: 1,
        category: "Alerte",
        title: `${teacherStats.atRiskCount} élève${teacherStats.atRiskCount > 1 ? "s" : ""} en difficulté`,
        description: `${teacherStats.atRiskCount} élève${teacherStats.atRiskCount > 1 ? "s" : ""} de vos classes ont une moyenne en ${teacherStats.subjectName} inférieure à 10/20. Une attention particulière est recommandée.`,
        recommendation: "Recommandation IA : Organiser des séances de soutien ciblées et informer les parents concernés pour un suivi rapproché.",
        priority: "high",
        icon: AlertTriangle,
        color: "text-destructive",
        bgColor: "bg-destructive/10",
      }] : []),
      ...(teacherStats.absentCount > 0 ? [{
        id: 2,
        category: "Prédiction",
        title: `${teacherStats.absentCount} absence${teacherStats.absentCount > 1 ? "s" : ""} cette semaine`,
        description: `${teacherStats.absentCount} absence${teacherStats.absentCount > 1 ? "s" : ""} ont été enregistrées dans vos classes au cours des 7 derniers jours.`,
        recommendation: "Action suggérée : Vérifier les justificatifs et contacter les familles si nécessaire.",
        priority: "medium",
        icon: Clock,
        color: "text-chart-4",
        bgColor: "bg-chart-4/10",
      }] : []),
      {
        id: 3,
        category: "Tendance",
        title: `Moyenne générale en ${teacherStats.subjectName}`,
        description: teacherStats.avgGrade > 0
          ? `La moyenne actuelle de vos élèves en ${teacherStats.subjectName} est de ${teacherStats.avgGrade}/20.`
          : `Aucune note saisie pour le moment en ${teacherStats.subjectName}.`,
        recommendation: teacherStats.avgGrade >= 14
          ? "Excellents résultats ! Maintenez les méthodes pédagogiques en place et identifiez les profils à fort potentiel."
          : teacherStats.avgGrade >= 10
          ? "Résultats satisfaisants. Pensez à valoriser les progrès individuels et à organiser des révisions ciblées."
          : "Résultats à améliorer. Une révision des approches pédagogiques et un soutien renforcé sont conseillés.",
        priority: teacherStats.avgGrade >= 14 ? "low" : teacherStats.avgGrade >= 10 ? "medium" : "high",
        icon: TrendingUp,
        color: "text-chart-3",
        bgColor: "bg-chart-3/10",
      }
    ]

    teacherSuggestions = [
      {
        title: "Saisie des notes à jour",
        description: `Assurez-vous que toutes les évaluations en ${teacherStats.subjectName} sont enregistrées pour un suivi précis.`,
        icon: BookOpen,
      },
      {
        title: "Suivi des absences",
        description: "Marquez les présences régulièrement pour des statistiques fiables.",
        icon: Clock,
      },
      {
        title: "Communication parents",
        description: "La messagerie vous permet de contacter directement les familles de vos élèves.",
        icon: Users,
      },
    ]
  }

  // ── Admin / General stats ──────────────────────────────────────────────────
  const adminStudentCount = !isTeacher ? await prisma.user.count({ where: { role: "student" } }) : 0

  const displayStats = isTeacher
    ? [
        { label: "Élèves dans mes classes", value: teacherStats.studentCount.toString(), icon: Users },
        { label: "Classes assignées", value: teacherStats.classCount.toString(), icon: Brain },
        { label: `Moyenne en ${teacherStats.subjectName}`, value: teacherStats.avgGrade > 0 ? `${teacherStats.avgGrade}/20` : "—", icon: Target },
        { label: "Élèves en difficulté", value: teacherStats.atRiskCount.toString(), icon: AlertTriangle },
      ]
    : [
        { label: "Élèves analysés", value: adminStudentCount.toLocaleString("fr"), icon: Users },
        { label: "Insights générés", value: "24", icon: Brain },
        { label: "Taux de précision", value: "94%", icon: Target },
        { label: "Actions recommandées", value: "12", icon: Lightbulb },
      ]

  const adminInsights = [
    {
      id: 1, category: "Alerte", title: "Élèves en difficulté détectés",
      description: "L'analyse des résultats récents indique que 3 élèves de la classe 4B montrent des signes de difficulté en mathématiques avec une baisse de plus de 3 points sur les 2 derniers mois.",
      recommendation: "Recommandation : Mettre en place des séances de soutien individualisées et contacter les parents pour un suivi rapproché.",
      students: ["Ibrahim S.", "Mariama B.", "Ousmane T."],
      priority: "high", icon: AlertTriangle, color: "text-destructive", bgColor: "bg-destructive/10",
    },
    {
      id: 2, category: "Prédiction", title: "Risque d'absentéisme élevé",
      description: "Basé sur les patterns historiques, nous prévoyons un risque élevé d'absence pour 5 élèves cette semaine.",
      recommendation: "Action suggérée : Envoyer un rappel préventif aux parents concernés.",
      students: ["Fatou D.", "Amadou K.", "Aïssatou M.", "Jean P.", "Sophie L."],
      priority: "medium", icon: Clock, color: "text-chart-4", bgColor: "bg-chart-4/10",
    },
    {
      id: 3, category: "Tendance positive", title: "Amélioration en Français",
      description: "La moyenne de Français a augmenté de 1.2 points ce trimestre par rapport au précédent.",
      recommendation: "Suggestion : Partager les méthodes pédagogiques lors du prochain conseil pédagogique.",
      priority: "low", icon: TrendingUp, color: "text-chart-3", bgColor: "bg-chart-3/10",
    },
  ]

  const adminSuggestions = [
    { title: "Optimisation des emplois du temps", description: "Déplacer les cours de mathématiques le matin pourrait améliorer les performances de 8%.", icon: BookOpen },
    { title: "Groupes de niveau", description: "Créer des groupes de niveau en anglais pourrait réduire les écarts de 15%.", icon: Users },
    { title: "Révision du programme", description: "Augmenter le temps consacré à la géométrie en 3ème.", icon: Lightbulb },
  ]

  const insights = isTeacher ? teacherInsights : adminInsights
  const suggestions = isTeacher ? teacherSuggestions : adminSuggestions

  return (
    <>
      <DashboardHeader 
        title="Insights IA" 
        subtitle={isTeacher
          ? `Recommandations personnalisées pour vos ${teacherStats.classCount} classe${teacherStats.classCount > 1 ? "s" : ""}`
          : "Recommandations intelligentes basées sur l'analyse des données"
        }
      />
      
      <main className="p-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          {displayStats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Refresh Notice */}
        <div className="mb-6 p-4 rounded-lg bg-muted/50 border border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">Dernière analyse : Il y a 2 heures</p>
              <p className="text-sm text-muted-foreground">
                {isTeacher ? "Les insights sont mis à jour à chaque connexion" : "Les insights sont mis à jour automatiquement chaque jour"}
              </p>
            </div>
          </div>
          <form>
            <Button variant="outline" size="sm" type="submit" formAction="?">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </form>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Insights */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              {isTeacher ? "Insights de vos classes" : "Insights prioritaires"}
            </h2>
            
            {insights.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="p-12 text-center text-muted-foreground">
                  <Sparkles className="h-10 w-10 mx-auto mb-4 opacity-30" />
                  <p className="font-semibold">Aucun insight disponible</p>
                  <p className="text-sm mt-1">Commencez par saisir des notes et marquer des présences pour recevoir des recommandations.</p>
                </CardContent>
              </Card>
            )}

            {insights.map((insight: any) => {
              const Icon = insight.icon
              return (
                <Card key={insight.id} className={`border-l-4 ${
                  insight.priority === "high" ? "border-l-destructive" :
                  insight.priority === "medium" ? "border-l-chart-4" :
                  insight.priority === "low" ? "border-l-chart-3" :
                  "border-l-primary"
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`h-10 w-10 rounded-lg ${insight.bgColor} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`h-5 w-5 ${insight.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${insight.bgColor} ${insight.color}`}>
                            {insight.category}
                          </span>
                        </div>
                        <h3 className="font-semibold text-foreground mb-2">{insight.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                        
                        {insight.students && (
                          <div className="mb-3 flex flex-wrap gap-2">
                            {insight.students.map((student: string) => (
                              <span key={student} className="text-xs px-2 py-1 rounded-md bg-muted text-foreground">
                                {student}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        <div className="p-3 rounded-lg bg-muted/50 border border-border">
                          <p className="text-sm text-foreground">
                            <span className="font-medium">Recommandation IA :</span> {insight.recommendation}
                          </p>
                        </div>
                        
                        {!isTeacher && (
                          <div className="mt-4 flex gap-2">
                            <Button size="sm">Prendre action</Button>
                            <Button size="sm" variant="outline">Ignorer</Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-chart-4" />
                  {isTeacher ? "Conseils pédagogiques" : "Suggestions d'amélioration"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {suggestions.map((suggestion: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="h-8 w-8 rounded-lg bg-chart-4/10 flex items-center justify-center flex-shrink-0">
                      <suggestion.icon className="h-4 w-4 text-chart-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground">{suggestion.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{suggestion.description}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* AI Model Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  À propos de l&apos;IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {isTeacher
                    ? "Le moteur IA analyse vos résultats de classe, les absences et les tendances pour vous fournir des recommandations pédagogiques adaptées."
                    : "Notre système d'IA analyse quotidiennement les données de votre établissement pour identifier les tendances et suggérer des améliorations."}
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Modèle</span>
                    <span className="font-medium text-foreground">MonÉcole AI v2.1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{isTeacher ? "Élèves suivis" : "Données analysées"}</span>
                    <span className="font-medium text-foreground">
                      {isTeacher ? `${teacherStats.studentCount} élèves` : "15,420 points"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Précision</span>
                    <span className="font-medium text-chart-3">94.2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  )
}
