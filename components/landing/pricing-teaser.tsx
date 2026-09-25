"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check, ArrowRight, Sparkles } from "lucide-react"
import { PRICING_PLANS } from "@/lib/pricing-config"

export function PricingTeaser() {
  return (
    <section className="bg-slate-50/80 text-slate-900 py-28 border-b border-slate-200/80 relative overflow-hidden">
      <div className="absolute bottom-10 left-1/3 h-[400px] w-[600px] bg-indigo-100/50 blur-[150px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            <span>Tarification Transparente &amp; Sans Surprise</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Des formules adaptées à chaque établissement
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Profitez de 14 jours d&apos;essai gratuit sans carte bancaire requis.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1 ${
                plan.highlighted
                  ? "border-2 border-primary bg-white shadow-2xl shadow-primary/10 ring-2 ring-primary/20"
                  : "border border-slate-200 bg-white hover:border-slate-300 shadow-sm"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="rounded-full bg-gradient-to-r from-primary to-indigo-600 px-4 py-1 text-[10px] font-black text-white uppercase tracking-wider shadow-md">
                    {plan.badge}
                  </div>
                </div>
              )}
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900">{plan.price}</span>
                    {plan.period && (
                      <span className="text-slate-500 text-xs font-bold ml-1.5">{plan.period}</span>
                    )}
                  </div>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">{plan.description}</p>
                </div>

                <ul className="space-y-3.5 border-t border-slate-100 pt-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-xs sm:text-sm text-slate-700 font-medium">
                      <div className="h-5 w-5 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 text-emerald-700" />
                      </div>
                      <span>{feature}</span>
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
                      ? "bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 text-white shadow-xl shadow-primary/20"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200"
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
