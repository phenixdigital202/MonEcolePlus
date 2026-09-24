"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check, ArrowRight, Sparkles, Zap } from "lucide-react"

const plans = [
  {
    name: "Découverte",
    price: "0 FCFA",
    period: "/ 14 jours",
    description: "Idéal pour tester toutes les fonctionnalités de MonÉcole+.",
    features: [
      "Jusqu'à 150 élèves",
      "Calcul des moyennes &amp; rangs",
      "Impression Bulletins &amp; Reçus",
      "Fiche Établissement",
      "Support par email"
    ],
    cta: "Essai gratuit 14 jours",
    highlighted: false,
  },
  {
    name: "Pro Établissement",
    price: "49 000 FCFA",
    period: "/ mois",
    description: "Pour les écoles exigeantes voulant l'isolation DB &amp; WhatsApp.",
    features: [
      "Élèves &amp; Classes illimités",
      "Database physique dédiée par École",
      "Assistant IA MonÉcole+ inclus",
      "WhatsApp Cloud API &amp; SMS",
      "Certificats de scolarité QR Code",
      "Support prioritaire 24/7"
    ],
    cta: "Créer mon école Pro",
    highlighted: true,
  },
  {
    name: "Réseaux &amp; Groupe",
    price: "Sur Mesure",
    description: "Solutions sur mesure pour les groupes scolaires multi-sites.",
    features: [
      "Gestion Multi-Établissements",
      "Master DB Centralisée + API Dedicated",
      "Sauvegardes automatiques quotidiennes",
      "Formation du personnel sur site",
      "Directeur de compte dédié"
    ],
    cta: "Contacter l'équipe",
    highlighted: false,
  },
]

export function PricingTeaser() {
  return (
    <section className="bg-[#090a0f] text-white py-28 border-b border-white/10 relative overflow-hidden">
      <div className="absolute bottom-10 left-1/3 h-[400px] w-[600px] bg-indigo-600/10 blur-[150px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Tarification Transparente &amp; Sans Surprise</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Des formules adaptées à chaque établissement
          </h2>

          <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
            Profitez de 14 jours d&apos;essai gratuit sans carte bancaire requis.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col justify-between rounded-3xl p-8 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 ${
                plan.highlighted
                  ? "border-2 border-indigo-500 bg-gradient-to-b from-indigo-950/40 via-slate-950/80 to-slate-950 shadow-2xl shadow-indigo-500/20"
                  : "border border-white/10 bg-slate-950/60 hover:border-white/20"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-1 text-xs font-extrabold text-white uppercase tracking-wider shadow-lg">
                    Recommandé pour les Écoles
                  </div>
                </div>
              )}
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-3xl sm:text-4xl font-black text-white">{plan.price}</span>
                    {plan.period && (
                      <span className="text-slate-400 text-xs font-medium ml-1.5">{plan.period}</span>
                    )}
                  </div>
                  <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">{plan.description}</p>
                </div>

                <ul className="space-y-3.5 border-t border-white/10 pt-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-xs sm:text-sm text-slate-200">
                      <div className="h-5 w-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 text-emerald-400" />
                      </div>
                      <span dangerouslySetInnerHTML={{ __html: feature }} />
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                <Button
                  asChild
                  size="lg"
                  className={`w-full font-extrabold h-12 rounded-2xl ${
                    plan.highlighted
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-xl shadow-indigo-600/30"
                      : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
                  }`}
                >
                  <Link href="/signup" className="flex items-center justify-center gap-2">
                    <span>{plan.cta}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
