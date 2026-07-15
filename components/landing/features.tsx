import { 
  Users, 
  Calendar, 
  FileText, 
  MessageSquare, 
  BarChart3, 
  Shield, 
  Sparkles,
  Clock,
  Bell,
  Folder
} from "lucide-react"

const features = [
  {
    name: "Gestion des Classes",
    description: "Organisez vos classes, affectez les élèves et suivez leur progression en temps réel.",
    icon: Users,
  },
  {
    name: "Emplois du Temps",
    description: "Créez et gérez les emplois du temps avec notre générateur intelligent assisté par IA.",
    icon: Calendar,
  },
  {
    name: "Gestion des Notes",
    description: "Saisie classique ou vocale, génération automatique de bulletins PDF.",
    icon: FileText,
  },
  {
    name: "Messagerie Intégrée",
    description: "Communiquez facilement entre enseignants, parents et administration.",
    icon: MessageSquare,
  },
  {
    name: "Analytics Avancés",
    description: "Tableaux de bord intelligents pour suivre les performances et identifier les tendances.",
    icon: BarChart3,
  },
  {
    name: "Suivi des Absences",
    description: "Marquez les présences, gérez les justificatifs et recevez des alertes automatiques.",
    icon: Clock,
  },
  {
    name: "Documents Officiels",
    description: "Générez certificats, attestations et bulletins en un clic.",
    icon: Folder,
  },
  {
    name: "Notifications Intelligentes",
    description: "Alertes personnalisées pour ne rien manquer d&apos;important.",
    icon: Bell,
  },
  {
    name: "Sécurité Renforcée",
    description: "Protection des données conforme RGPD avec authentification sécurisée.",
    icon: Shield,
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 lg:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary ring-1 ring-inset ring-primary/20 mb-4">
            <Sparkles className="h-4 w-4" />
            <span>Fonctionnalités</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Tout ce dont vous avez besoin pour gérer votre établissement
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            Une suite complète d&apos;outils conçus pour simplifier la gestion scolaire quotidienne.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-5xl">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.name}
                className="group relative rounded-2xl bg-card border border-border p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  {feature.name}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
