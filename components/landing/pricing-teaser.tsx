import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check, ArrowRight } from "lucide-react"

const plans = [
  {
    name: "Starter",
    price: "Gratuit",
    description: "Parfait pour les petits établissements qui démarrent.",
    features: [
      "Jusqu'à 100 élèves",
      "Gestion des classes",
      "Emplois du temps basiques",
      "Support par email",
    ],
    cta: "Commencer gratuitement",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "49€",
    period: "/mois",
    description: "Pour les établissements en croissance avec des besoins avancés.",
    features: [
      "Élèves illimités",
      "Toutes les fonctionnalités",
      "IA intégrée",
      "Analytics avancés",
      "Support prioritaire",
    ],
    cta: "Essai gratuit 14 jours",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Sur mesure",
    description: "Solutions personnalisées pour les grands groupes scolaires.",
    features: [
      "Multi-établissements",
      "API dédiée",
      "Formation sur site",
      "SLA garanti",
      "Account manager dédié",
    ],
    cta: "Contactez-nous",
    highlighted: false,
  },
]

export function PricingTeaser() {
  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Des tarifs adaptés à chaque établissement
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Commencez gratuitement, évoluez selon vos besoins.
          </p>
        </div>

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
                <div className="mt-2 flex items-baseline">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  {plan.period && (
                    <span className="text-muted-foreground ml-1">{plan.period}</span>
                  )}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <ul className="flex-1 space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-foreground">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.highlighted ? "default" : "outline"}
                className="w-full"
                asChild
              >
                <Link href="/pricing">
                  {plan.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/pricing"
            className="text-sm font-medium text-primary hover:text-primary/80 inline-flex items-center gap-1"
          >
            Voir tous les détails des tarifs
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
