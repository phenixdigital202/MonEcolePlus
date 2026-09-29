"use client"

import { useState } from "react"
import React from "react"
import { LandingHeader } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { Button } from "@/components/ui/button"
import { Check, Sparkles, ArrowRight, X } from "lucide-react"
import Link from "next/link"
import { PRICING_PLANS, DETAILED_COMPARISON_FEATURES } from "@/lib/pricing-config"

export default function TarifsPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 text-slate-900 relative overflow-hidden">
      {/* Background Ambient Orbs */}
      <div className="absolute top-20 left-1/3 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-1/3 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

      <LandingHeader />
      
      <main className="max-w-7xl mx-auto px-6 lg:px-8 pt-36 pb-24 space-y-16 relative z-10">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-200/80 bg-blue-50/80 text-blue-700 text-xs font-bold uppercase tracking-wider shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>Tarification Transparente &amp; Sans Surprise</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 leading-tight">
            Des tarifs adaptés à chaque établissement
          </h1>
          <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
            Profitez de 14 jours d&apos;essai gratuit sans engagement. Choisissez la formule qui convient à votre école.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="pt-2 flex justify-center items-center">
            <div className="inline-flex items-center p-1.5 rounded-2xl bg-slate-200/80 border border-slate-300/80 shadow-inner">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 ${
                  billingCycle === "monthly"
                    ? "bg-white text-slate-900 shadow-md scale-[1.02]"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Paiement Mensuel
              </button>

              <button
                type="button"
                onClick={() => setBillingCycle("yearly")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 ${
                  billingCycle === "yearly"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 scale-[1.02]"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>Paiement Annuel</span>
                <span className="bg-emerald-400 text-slate-950 font-black text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full">
                  2 mois offerts
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-3 items-stretch">
          {PRICING_PLANS.map((p) => {
            const priceDisplay = billingCycle === "yearly" ? p.priceYearly : p.priceMonthly
            const periodDisplay = billingCycle === "yearly" ? p.periodYearly : p.periodMonthly

            return (
              <div 
                key={p.id} 
                className={`p-8 sm:p-9 rounded-3xl transition-all duration-300 flex flex-col justify-between relative ${
                  p.highlighted 
                    ? "bg-white/95 border-2 border-blue-600 shadow-2xl shadow-blue-500/15 ring-4 ring-blue-500/10 md:-translate-y-2 scale-[1.02]" 
                    : "bg-white/80 backdrop-blur-xl border border-slate-200/80 hover:border-blue-300 shadow-xl hover:shadow-2xl"
                }`}
              >
                {p.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap">
                    <span className="inline-flex items-center text-[10px] sm:text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 border border-white/30">
                      {p.badge}
                    </span>
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{p.name}</h3>
                    
                    <div className="mt-4 flex flex-col">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{priceDisplay}</span>
                        {periodDisplay && <span className="text-xs font-bold text-slate-500">{periodDisplay}</span>}
                      </div>
                      {billingCycle === "yearly" && p.priceYearlyTotal && p.id !== "entreprise" && (
                        <span className="text-[11px] font-extrabold text-blue-600 mt-1">
                          Facturé {p.priceYearlyTotal}
                        </span>
                      )}
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
                    p.highlighted 
                      ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-lg shadow-blue-500/25 hover:scale-[1.02]" 
                      : "bg-slate-900 hover:bg-slate-800 text-white shadow-md"
                  }`}
                >
                  <Link href="/signup">
                    {p.cta} <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            )
          })}
        </div>

        {/* Detailed Feature Comparison */}
        <div className="mt-20 bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-8 shadow-xl space-y-8">
          <h2 className="text-2xl font-black text-slate-900 text-center tracking-tight">
            Comparaison détaillée des fonctionnalités
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="py-4 px-4 text-left font-black uppercase text-slate-500 tracking-wider">Fonctionnalité</th>
                  {PRICING_PLANS.map((p) => (
                    <th key={p.id} className="py-4 px-4 text-center font-black text-slate-900">
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {DETAILED_COMPARISON_FEATURES.map((cat, catIdx) => (
                  <React.Fragment key={catIdx}>
                    <tr className="bg-slate-100/70">
                      <td colSpan={4} className="py-2.5 px-4 font-black uppercase text-[10px] tracking-widest text-blue-700">
                        {cat.category}
                      </td>
                    </tr>
                    {cat.items.map((item, itemIdx) => (
                      <tr key={itemIdx} className="hover:bg-slate-50/80">
                        <td className="py-3.5 px-4 font-bold text-slate-800">{item.name}</td>
                        <td className="py-3.5 px-4 text-center font-semibold text-slate-700">
                          {item.starter === "Oui" ? <Check className="h-5 w-5 text-emerald-600 mx-auto" /> : item.starter === "Non" ? <X className="h-5 w-5 text-slate-300 mx-auto" /> : item.starter}
                        </td>
                        <td className="py-3.5 px-4 text-center font-semibold text-blue-700 bg-blue-50/30">
                          {item.pro === "Oui" ? <Check className="h-5 w-5 text-emerald-600 mx-auto" /> : item.pro === "Non" ? <X className="h-5 w-5 text-slate-300 mx-auto" /> : item.pro}
                        </td>
                        <td className="py-3.5 px-4 text-center font-semibold text-slate-700">
                          {item.entreprise === "Oui" ? <Check className="h-5 w-5 text-emerald-600 mx-auto" /> : item.entreprise === "Non" ? <X className="h-5 w-5 text-slate-300 mx-auto" /> : item.entreprise}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
