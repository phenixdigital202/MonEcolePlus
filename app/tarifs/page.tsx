import { LandingHeader } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

export default function TarifsPage() {
  const plans = [
    {
      name: "Starter",
      price: "25 000 FCFA",
      period: "par mois",
      description: "Idéal pour débuter la numérisation des notes et de l'administration scolaire.",
      features: [
        "Jusqu'à 100 élèves",
        "Gestion administrative",
        "Saisie des notes & bulletins",
        "Support par email",
      ]
    },
    {
      name: "Professional",
      price: "75 000 FCFA",
      period: "par mois",
      description: "Le plan le plus populaire pour les établissements en pleine croissance scolaire.",
      features: [
        "Jusqu'à 500 élèves",
        "Messagerie interne & WhatsApp",
        "Paiements Mobile Money",
        "Modules d'Examens Blancs",
        "Support prioritaire",
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "150 000 FCFA",
      period: "par mois",
      description: "Pour les grands groupes scolaires nécessitant un accompagnement sur mesure.",
      features: [
        "Nombre d'élèves illimité",
        "Copilote IA et prédictions de réussite",
        "Double réseau d'API SMS/WhatsApp",
        "Accompagnement et formation physique",
        "SLA de disponibilité 99.9%",
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <LandingHeader />
      
      <main className="max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-24 space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Des tarifs simples et transparents
          </h1>
          <p className="text-base sm:text-lg text-[#a1a1aa] leading-relaxed">
            Choisissez la formule qui convient le mieux à la taille de votre établissement.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {plans.map((p, i) => (
            <div 
              key={i} 
              className={`p-8 rounded-2xl border ${
                p.popular ? "border-indigo-500 bg-indigo-950/10" : "border-[#27272a] bg-neutral-950/40"
              } space-y-6 flex flex-col justify-between`}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-white">{p.name}</h3>
                  {p.popular && (
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Populaire
                    </span>
                  )}
                </div>
                
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-white">{p.price}</span>
                  <span className="text-xs text-[#a1a1aa]">{p.period}</span>
                </div>
                
                <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed">
                  {p.description}
                </p>
                
                <div className="h-px bg-[#27272a]" />
                
                <ul className="space-y-3 text-xs sm:text-sm text-[#a1a1aa]">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <Button className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-11 rounded-xl">
                Essayer gratuitement
              </Button>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
