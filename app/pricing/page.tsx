import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check, X, ArrowLeft, GraduationCap, Sparkles } from "lucide-react"

export const metadata: Metadata = {
  title: "Tarifs | MonÉcole+",
  description: "Découvrez nos offres adaptées à chaque établissement scolaire.",
}

const plans = [
  {
    name: "Starter",
    description: "Parfait pour les petits établissements qui démarrent.",
    price: { monthly: "0", yearly: "0" },
    features: {
      students: "100 élèves max",
      classes: "5 classes",
      teachers: "10 enseignants",
      storage: "1 Go stockage",
      support: "Email uniquement",
      ai: false,
      analytics: "Basiques",
      api: false,
      sso: false,
      multisite: false,
    },
    cta: "Commencer gratuitement",
    highlighted: false,
  },
  {
    name: "Pro",
    description: "Pour les établissements en croissance avec des besoins avancés.",
    price: { monthly: "49", yearly: "39" },
    features: {
      students: "Illimité",
      classes: "Illimité",
      teachers: "Illimité",
      storage: "50 Go stockage",
      support: "Prioritaire",
      ai: true,
      analytics: "Avancés",
      api: true,
      sso: false,
      multisite: false,
    },
    cta: "Essai gratuit 14 jours",
    highlighted: true,
  },
  {
    name: "Enterprise",
    description: "Solutions personnalisées pour les grands groupes scolaires.",
    price: { monthly: "Sur mesure", yearly: "Sur mesure" },
    features: {
      students: "Illimité",
      classes: "Illimité",
      teachers: "Illimité",
      storage: "Illimité",
      support: "Dédié 24/7",
      ai: true,
      analytics: "Personnalisés",
      api: true,
      sso: true,
      multisite: true,
    },
    cta: "Contactez-nous",
    highlighted: false,
  },
]

const featuresList = [
  { key: "students", label: "Nombre d'élèves" },
  { key: "classes", label: "Nombre de classes" },
  { key: "teachers", label: "Nombre d'enseignants" },
  { key: "storage", label: "Stockage documents" },
  { key: "support", label: "Support technique" },
  { key: "ai", label: "Fonctionnalités IA", isBoolean: true },
  { key: "analytics", label: "Analytics" },
  { key: "api", label: "Accès API", isBoolean: true },
  { key: "sso", label: "SSO / SAML", isBoolean: true },
  { key: "multisite", label: "Multi-établissements", isBoolean: true },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">
              MonÉcole<span className="text-primary">+</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Connexion</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Commencer</Link>
            </Button>
          </div>
        </nav>
      </header>

      <main className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l&apos;accueil
          </Link>

          {/* Header */}
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary ring-1 ring-inset ring-primary/20 mb-4">
              <Sparkles className="h-4 w-4" />
              <span>Tarifs transparents</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl text-balance">
              Choisissez le plan adapté à votre établissement
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Tous les plans incluent un essai gratuit de 14 jours. Aucune carte bancaire requise.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl border p-8 ${
                  plan.highlighted
                    ? "border-primary bg-primary/5 shadow-xl ring-2 ring-primary"
                    : "border-border bg-card"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                      Le plus populaire
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-foreground">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline">
                    {plan.price.monthly !== "Sur mesure" ? (
                      <>
                        <span className="text-4xl font-bold text-foreground">{plan.price.monthly}€</span>
                        <span className="text-muted-foreground ml-1">/mois</span>
                      </>
                    ) : (
                      <span className="text-3xl font-bold text-foreground">{plan.price.monthly}</span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                </div>

                <Button
                  variant={plan.highlighted ? "default" : "outline"}
                  className="w-full mb-8"
                  asChild
                >
                  <Link href={plan.name === "Enterprise" ? "#contact" : "/signup"}>
                    {plan.cta}
                  </Link>
                </Button>

                <ul className="flex-1 space-y-3">
                  {featuresList.map((feature) => {
                    const value = plan.features[feature.key as keyof typeof plan.features]
                    const isIncluded = feature.isBoolean ? value === true : true

                    return (
                      <li key={feature.key} className="flex items-center gap-3 text-sm">
                        {feature.isBoolean ? (
                          value ? (
                            <Check className="h-4 w-4 text-primary flex-shrink-0" />
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
                          )
                        ) : (
                          <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        )}
                        <span className={!isIncluded && feature.isBoolean ? "text-muted-foreground/50" : "text-foreground"}>
                          {feature.isBoolean ? feature.label : `${feature.label}: ${value}`}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>

          {/* Comparison Table */}
          <div className="mt-24">
            <h2 className="text-2xl font-bold text-foreground text-center mb-12">
              Comparaison détaillée des plans
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-4 px-4 text-left text-sm font-semibold text-foreground">Fonctionnalité</th>
                    {plans.map((plan) => (
                      <th key={plan.name} className="py-4 px-4 text-center text-sm font-semibold text-foreground">
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {featuresList.map((feature, idx) => (
                    <tr key={feature.key} className={idx % 2 === 0 ? "bg-muted/30" : ""}>
                      <td className="py-3 px-4 text-sm text-foreground">{feature.label}</td>
                      {plans.map((plan) => {
                        const value = plan.features[feature.key as keyof typeof plan.features]
                        return (
                          <td key={plan.name} className="py-3 px-4 text-center text-sm">
                            {feature.isBoolean ? (
                              value ? (
                                <Check className="h-5 w-5 text-primary mx-auto" />
                              ) : (
                                <X className="h-5 w-5 text-muted-foreground/40 mx-auto" />
                              )
                            ) : (
                              <span className="text-foreground">{value as string}</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-24 mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold text-foreground text-center mb-12">
              Questions fréquentes
            </h2>
            <div className="space-y-6">
              <div className="rounded-lg border border-border p-6 bg-card">
                <h3 className="font-semibold text-foreground">Puis-je changer de plan à tout moment ?</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Oui, vous pouvez passer à un plan supérieur à tout moment. Le changement est effectif immédiatement et la différence de prix est calculée au prorata.
                </p>
              </div>
              <div className="rounded-lg border border-border p-6 bg-card">
                <h3 className="font-semibold text-foreground">Y a-t-il un engagement de durée ?</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Non, tous nos plans sont sans engagement. Vous pouvez annuler votre abonnement à tout moment.
                </p>
              </div>
              <div className="rounded-lg border border-border p-6 bg-card">
                <h3 className="font-semibold text-foreground">Comment fonctionne l&apos;essai gratuit ?</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  L&apos;essai gratuit de 14 jours vous donne accès à toutes les fonctionnalités du plan Pro. Aucune carte bancaire n&apos;est requise pour commencer.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} MonÉcole+. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  )
}
