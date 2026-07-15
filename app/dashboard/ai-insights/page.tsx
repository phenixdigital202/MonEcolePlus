"use client"

import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Sparkles, 
  AlertTriangle, 
  TrendingUp,
  TrendingDown,
  Users,
  Brain,
  Lightbulb,
  Target,
  RefreshCw,
  ChevronRight,
  Clock,
  BookOpen
} from "lucide-react"

const aiInsights = [
  {
    id: 1,
    category: "Alerte",
    title: "Élèves en difficulté détectés",
    description: "L'analyse des résultats récents indique que 3 élèves de la classe 4B montrent des signes de difficulté en mathématiques avec une baisse de plus de 3 points sur les 2 derniers mois.",
    recommendation: "Recommandation : Mettre en place des séances de soutien individualisées et contacter les parents pour un suivi rapproché.",
    students: ["Ibrahim S.", "Mariama B.", "Ousmane T."],
    priority: "high",
    icon: AlertTriangle,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
  {
    id: 2,
    category: "Prédiction",
    title: "Risque d'absentéisme élevé",
    description: "Basé sur les patterns historiques et les données météorologiques, nous prévoyons un risque élevé d'absence pour 5 élèves cette semaine.",
    recommendation: "Action suggérée : Envoyer un rappel préventif aux parents concernés et planifier un suivi rapproché.",
    students: ["Fatou D.", "Amadou K.", "Aïssatou M.", "Jean P.", "Sophie L."],
    priority: "medium",
    icon: Clock,
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
  },
  {
    id: 3,
    category: "Tendance positive",
    title: "Amélioration en Français",
    description: "La moyenne de Français a augmenté de 1.2 points ce trimestre par rapport au trimestre précédent. Les méthodes pédagogiques actuelles montrent des résultats positifs.",
    recommendation: "Suggestion : Partager les méthodes de Mme Kouadio avec les autres enseignants lors du prochain conseil pédagogique.",
    priority: "low",
    icon: TrendingUp,
    color: "text-chart-3",
    bgColor: "bg-chart-3/10",
  },
  {
    id: 4,
    category: "Opportunité",
    title: "Élèves à fort potentiel identifiés",
    description: "5 élèves montrent un potentiel exceptionnel en sciences (Physique + SVT) avec des performances constantes au-dessus de 17/20.",
    recommendation: "Suggestion : Proposer des activités d'enrichissement ou des préparations aux concours scientifiques.",
    students: ["Ibrahim S. (Term S)", "Fatoumata K. (Term S)", "Moussa D. (1ère S)"],
    priority: "info",
    icon: Target,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
]

const suggestions = [
  {
    title: "Optimisation des emplois du temps",
    description: "Déplacer les cours de mathématiques le matin pourrait améliorer les performances de 8%.",
    icon: BookOpen,
  },
  {
    title: "Groupes de niveau",
    description: "Créer des groupes de niveau en anglais pourrait réduire les écarts de 15%.",
    icon: Users,
  },
  {
    title: "Révision du programme",
    description: "Augmenter le temps consacré à la géométrie en 3ème pour combler les lacunes identifiées.",
    icon: Lightbulb,
  },
]

const stats = [
  { label: "Élèves analysés", value: "1,247", icon: Users },
  { label: "Insights générés", value: "24", icon: Brain },
  { label: "Taux de précision", value: "94%", icon: Target },
  { label: "Actions recommandées", value: "12", icon: Lightbulb },
]

export default function AIInsightsPage() {
  return (
    <>
      <DashboardHeader 
        title="Insights IA" 
        subtitle="Recommandations intelligentes basées sur l'analyse des données"
      />
      
      <main className="p-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          {stats.map((stat) => (
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
              <p className="text-sm text-muted-foreground">Les insights sont mis à jour automatiquement chaque jour</p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Insights */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Insights prioritaires
            </h2>
            
            {aiInsights.map((insight) => {
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
                            {insight.students.map((student) => (
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
                        
                        <div className="mt-4 flex gap-2">
                          <Button size="sm">Prendre action</Button>
                          <Button size="sm" variant="outline">Ignorer</Button>
                        </div>
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
                  Suggestions d&apos;amélioration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {suggestions.map((suggestion, idx) => (
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
                  Notre système d&apos;IA analyse quotidiennement les données de votre établissement pour identifier les tendances, prédire les risques et suggérer des améliorations.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Modèle</span>
                    <span className="font-medium text-foreground">MonÉcole AI v2.1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Données analysées</span>
                    <span className="font-medium text-foreground">15,420 points</span>
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
