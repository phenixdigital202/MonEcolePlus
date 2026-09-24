import { LandingHeader } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { Button } from "@/components/ui/button"
import { Check, Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function TarifsPage() {
  const plans = [
    {
      name: "Starter",
      price: "25 000 FCFA",
      period: "/ mois",
      description: "Idéal pour débuter la numérisation des notes et de l'administration scolaire.",
      features: [
        "Jusqu'à 150 élèves",
        "Gestion administrative & Inscriptions",
        "Saisie des notes & bulletins PDF",
        "Fiche Établissement dédiée",
        "Support réactif par email"
      ],
      cta: "Démarrer l'essai gratuit",
      popular: false
    },
    {
      name: "Pro Établissement",
      price: "75 000 FCFA",
      period: "/ mois",
      description: "Le plan recommandé pour les écoles exigeantes voulant l'isolation DB & WhatsApp.",
      features: [
        "Nombre d'élèves & classes illimités",
        "Base de données dédiée par École",
        "Assistant IA MonÉcole+ inclus",
        "WhatsApp Cloud API & SMS auto",
        "Certificats de scolarité QR Code",
        "Paiements Mobile Money intégrés",
        "Support prioritaire 24/7"
      ],
      cta: "Créer mon école Pro",
      popular: true
    },
    {
      name: "Réseaux & Groupe",
      price: "Sur Mesure",
      period: "",
      description: "Pour les grands groupes scolaires multi-sites nécessitant un accompagnement dédié.",
      features: [
        "Gestion Multi-Établissements centralisée",
        "Master DB Centralisée + API Dedicated",
        "Sauvegardes automatiques quotidiennes",
        "Accompagnement & formation sur site",
        "SLA de disponibilité 99.9%",
        "Directeur de compte dédié"
      ],
      cta: "Contacter notre équipe",
      popular: false
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 text-slate-900 relative overflow-hidden">
      {/* Background Ambient Orbs */}
      <div className="absolute top-20 left-1/3 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-1/3 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

      <LandingHeader />
      
      <main className="max-w-7xl mx-auto px-6 lg:px-8 pt-36 pb-24 space-y-16 relative z-10">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-200/80 bg-blue-50/80 text-blue-700 text-xs font-bold uppercase tracking-wider shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>Tarification Transparente &amp; Sans Surprise</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 leading-tight">
            Des tarifs simples pour booster votre école
          </h1>
          <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
            Profitez de 14 jours d&apos;essai gratuit sans carte bancaire requise. Choisissez la formule adaptée à votre établissement.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 items-stretch">
          {plans.map((p, i) => (
            <div 
              key={i} 
              className={`p-8 sm:p-9 rounded-3xl transition-all duration-300 flex flex-col justify-between relative ${
                p.popular 
                  ? "bg-white/95 border-2 border-blue-600 shadow-2xl shadow-blue-500/15 ring-4 ring-blue-500/10 md:-translate-y-2 scale-[1.02]" 
                  : "bg-white/80 backdrop-blur-xl border border-slate-200/80 hover:border-blue-300 shadow-xl hover:shadow-2xl"
              }`}
            >
              {p.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25">
                    Recommandé pour les Écoles
                  </span>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900">{p.name}</h3>
                  
                  <div className="mt-4 flex items-baseline gap-1.5">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{p.price}</span>
                    {p.period && <span className="text-xs font-bold text-slate-500">{p.period}</span>}
                  </div>
                  
                  <p className="mt-3 text-xs sm:text-sm text-slate-500 font-medium leading-relaxed min-h-[40px]">
                    {p.description}
                  </p>
                </div>
                
                <div className="h-px bg-slate-100" />
                
                <ul className="space-y-3.5 text-xs sm:text-sm text-slate-600">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3 font-medium">
                      <div className="h-5 w-5 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-blue-600">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-slate-700">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button 
                asChild
                className={`w-full mt-8 h-12 rounded-2xl font-bold text-sm transition-all duration-300 ${
                  p.popular 
                    ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-lg shadow-blue-500/25 hover:scale-[1.02]" 
                    : "bg-slate-900 hover:bg-slate-800 text-white shadow-md"
                }`}
              >
                <Link href="/signup">
                  {p.cta} <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
