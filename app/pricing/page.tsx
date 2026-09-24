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
      classe: "5 classes",
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
      classe: "Illimité",
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
      classe: "Illimité",
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 text-slate-900 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md shadow-blue-500/20 transition-transform duration-300 group-hover:scale-110">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">
              MonÉcole<span className="text-blue-600 font-black">+</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="font-bold text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl" asChild>
              <Link href="/login">Connexion</Link>
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20" asChild>
              <Link href="/signup">Commencer</Link>
            </Button>
          </div>
        </nav>
      </header>

      <main className="py-16 lg:py-24 relative z-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-16">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l&apos;accueil
          </Link>

          {/* Header */}
          <div className="mx-auto max-w-3xl text-center space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/80 px-4 py-1.5 text-xs font-bold text-blue-700 shadow-sm uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              <span>Tarification Transparente</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-6xl text-balance leading-tight">
              Choisissez le plan adapté à votre établissement
            </h1>
            <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
              Tous les plans incluent un essai gratuit de 14 jours. Aucune carte bancaire requise pour commencer.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-3 items-stretch">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col justify-between rounded-3xl p-8 sm:p-9 transition-all duration-300 ${
                  plan.highlighted
                    ? "bg-white/95 border-2 border-blue-600 shadow-2xl shadow-blue-500/15 ring-4 ring-blue-500/10 scale-[1.02]"
                    : "bg-white/80 backdrop-blur-xl border border-slate-200/80 hover:border-blue-300 shadow-xl hover:shadow-2xl"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-1 text-[10px] font-black text-white uppercase tracking-widest shadow-md shadow-blue-500/25">
                      Le plus populaire
                    </div>
                  </div>
                )}

                <div className="mb-6 space-y-4">
                  <h3 className="text-xl font-black text-slate-900">{plan.name}</h3>
                  <div className="flex items-baseline">
                    {plan.price.monthly !== "Sur mesure" ? (
                      <>
                        <span className="text-4xl font-black text-slate-900 tracking-tight">{plan.price.monthly}€</span>
                        <span className="text-slate-500 text-xs font-bold ml-1.5">/mois</span>
                      </>
                    ) : (
                      <span className="text-3xl font-black text-slate-900 tracking-tight">{plan.price.monthly}</span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">{plan.description}</p>
                </div>

                <Button
                  className={`w-full mb-8 h-12 rounded-2xl font-bold text-sm transition-all duration-300 ${
                    plan.highlighted
                      ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-lg shadow-blue-500/25 hover:scale-[1.02]"
                      : "bg-slate-900 hover:bg-slate-800 text-white shadow-md"
                  }`}
                  asChild
                >
                  <Link href={plan.name === "Enterprise" ? "#contact" : "/signup"}>
                    {plan.cta}
                  </Link>
                </Button>

                <ul className="flex-1 space-y-3.5 border-t border-slate-100 pt-6">
                  {featuresList.map((feature) => {
                    const value = plan.features[feature.key as keyof typeof plan.features]
                    const isIncluded = feature.isBoolean ? value === true : true

                    return (
                      <li key={feature.key} className="flex items-center gap-3 text-xs sm:text-sm font-medium">
                        {feature.isBoolean ? (
                          value ? (
                            <div className="h-5 w-5 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-blue-600">
                              <Check className="h-3.5 w-3.5" />
                            </div>
                          ) : (
                            <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-300">
                              <X className="h-3.5 w-3.5" />
                            </div>
                          )
                        ) : (
                          <div className="h-5 w-5 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-blue-600">
                            <Check className="h-3.5 w-3.5" />
                          </div>
                        )}
                        <span className={!isIncluded && feature.isBoolean ? "text-slate-400 line-through" : "text-slate-700"}>
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
          <div className="mt-24 bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-8 shadow-xl">
            <h2 className="text-2xl font-black text-slate-900 text-center mb-10 tracking-tight">
              Comparaison détaillée des fonctionnalités
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80">
                    <th className="py-4 px-4 text-left text-xs font-black uppercase text-slate-500 tracking-wider">Fonctionnalité</th>
                    {plans.map((plan) => (
                      <th key={plan.name} className="py-4 px-4 text-center text-sm font-black text-slate-900">
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {featuresList.map((feature, idx) => (
                    <tr key={feature.key} className={idx % 2 === 0 ? "bg-slate-50/50" : ""}>
                      <td className="py-3.5 px-4 text-xs sm:text-sm font-bold text-slate-800">{feature.label}</td>
                      {plans.map((plan) => {
                        const value = plan.features[feature.key as keyof typeof plan.features]
                        return (
                          <td key={plan.name} className="py-3.5 px-4 text-center text-xs sm:text-sm">
                            {feature.isBoolean ? (
                              value ? (
                                <Check className="h-5 w-5 text-blue-600 mx-auto" />
                              ) : (
                                <X className="h-5 w-5 text-slate-300 mx-auto" />
                              )
                            ) : (
                              <span className="font-bold text-slate-700">{value as string}</span>
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
          <div className="mt-24 mx-auto max-w-3xl space-y-10">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 text-center tracking-tight">
              Questions fréquentes
            </h2>
            <div className="space-y-4">
              {[
                { q: "Puis-je changer de plan à tout moment ?", a: "Oui, vous pouvez passer à un plan supérieur ou modifier vos options à tout moment. La mise à jour est immédiate." },
                { q: "Y a-t-il un engagement de durée ?", a: "Non, tous nos abonnements sont 100% sans engagement. Vous pouvez arrêter quand vous le désirez." },
                { q: "Comment fonctionne l'essai gratuit ?", a: "L'essai gratuit de 14 jours débloque l'intégralité des fonctionnalités Pro. Aucune carte bancaire n'est demandée." }
              ].map((faq, i) => (
                <div key={i} className="rounded-3xl border border-slate-200/80 p-6 bg-white/80 backdrop-blur-xl shadow-sm hover:shadow-md transition-all">
                  <h3 className="font-bold text-sm text-slate-900">{faq.q}</h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white/60 py-8 relative z-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <p className="text-xs text-slate-500 font-medium">
            &copy; {new Date().getFullYear()} MonÉcole+. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  )
}
