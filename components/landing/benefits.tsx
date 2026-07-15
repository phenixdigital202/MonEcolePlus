import { 
  Zap, 
  Brain, 
  Clock,
  TrendingUp,
  Sparkles
} from "lucide-react"

const benefits = [
  {
    title: "Gain de temps considérable",
    description: "Automatisez les tâches administratives répétitives et libérez du temps pour l'essentiel : l'éducation.",
    icon: Clock,
    stat: "40%",
    statLabel: "de temps économisé",
  },
  {
    title: "Intelligence Artificielle intégrée",
    description: "Bénéficiez de recommandations personnalisées, détection précoce des difficultés et prédictions d'absentéisme.",
    icon: Brain,
    stat: "95%",
    statLabel: "de précision IA",
  },
  {
    title: "Performance optimisée",
    description: "Suivez les indicateurs clés en temps réel et prenez des décisions éclairées pour améliorer les résultats.",
    icon: TrendingUp,
    stat: "+15%",
    statLabel: "de réussite scolaire",
  },
  {
    title: "Déploiement rapide",
    description: "Installation et configuration en quelques heures. Formation incluse pour votre équipe.",
    icon: Zap,
    stat: "24h",
    statLabel: "pour démarrer",
  },
]

export function BenefitsSection() {
  return (
    <section id="benefits" className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent ring-1 ring-inset ring-accent/20 mb-4">
            <Sparkles className="h-4 w-4" />
            <span>Avantages</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Pourquoi choisir MonÉcole+ ?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            Une plateforme pensée pour transformer votre établissement et améliorer la réussite de vos élèves.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-5xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {benefits.map((benefit, index) => (
              <div
                key={benefit.title}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card to-muted/20 border border-border p-8"
              >
                <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-primary/5" />
                <div className="relative">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <benefit.icon className="h-6 w-6" />
                    </div>
                    <div className="text-right ml-auto">
                      <div className="text-3xl font-bold text-primary">{benefit.stat}</div>
                      <div className="text-xs text-muted-foreground">{benefit.statLabel}</div>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">
                    {benefit.title}
                  </h3>
                  <p className="mt-2 text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
