"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GraduationCap, ArrowRight, ShieldCheck, Sparkles, Activity } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#09090b] text-white pt-32 pb-24 lg:pt-40 lg:pb-32 border-b border-[#27272a]/40">
      {/* Background Gradients & Grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[600px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center space-y-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold tracking-wider uppercase animate-pulse mx-auto">
          <Sparkles className="h-3 w-3" />
          MonÉcole+ v1.0 Premium est disponible
        </div>

        {/* Title */}
        <h1 className="max-w-4xl mx-auto text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] bg-gradient-to-b from-white via-white to-slate-400 bg-clip-text text-transparent">
          La plateforme intelligente qui révolutionne la gestion scolaire en Afrique.
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-[#a1a1aa] leading-relaxed">
          Gérez votre établissement, automatisez votre administration et améliorez la réussite scolaire grâce à l&apos;intelligence artificielle.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button asChild size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-12 px-6 rounded-xl">
            <Link href="/signup">
              Créer mon établissement
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-[#27272a] hover:bg-neutral-800 text-white font-bold h-12 px-6 rounded-xl bg-neutral-900/50">
            <Link href="/demo">
              Demander une démo
            </Link>
          </Button>
        </div>

        {/* Mockup Dashboard Preview */}
        <div className="relative mt-16 max-w-5xl mx-auto border border-[#27272a] rounded-2xl bg-neutral-950/70 p-2 shadow-2xl backdrop-blur-md">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none" />
          <div className="border border-[#27272a] rounded-xl overflow-hidden bg-neutral-900">
            {/* Window bar */}
            <div className="h-10 border-b border-[#27272a] bg-neutral-950 flex items-center justify-between px-4">
              <div className="flex gap-2">
                <div className="h-3 w-3 rounded-full bg-rose-500" />
                <div className="h-3 w-3 rounded-full bg-amber-500" />
                <div className="h-3 w-3 rounded-full bg-emerald-500" />
              </div>
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">mon-ecole-plus.ci</span>
              <div className="w-12" />
            </div>
            
            {/* Visual content of dashboard preview */}
            <div className="p-6 grid grid-cols-3 gap-6 bg-[#09090b] text-left">
              <div className="col-span-2 space-y-4">
                <div className="h-8 w-48 rounded bg-neutral-800" />
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-24 rounded-xl border border-[#27272a] bg-neutral-900 p-4 space-y-2">
                    <div className="h-3 w-16 bg-neutral-800 rounded" />
                    <div className="h-6 w-10 bg-neutral-700 rounded" />
                  </div>
                  <div className="h-24 rounded-xl border border-[#27272a] bg-neutral-900 p-4 space-y-2">
                    <div className="h-3 w-16 bg-neutral-800 rounded" />
                    <div className="h-6 w-10 bg-neutral-700 rounded" />
                  </div>
                  <div className="h-24 rounded-xl border border-[#27272a] bg-neutral-900 p-4 space-y-2">
                    <div className="h-3 w-16 bg-neutral-800 rounded" />
                    <div className="h-6 w-10 bg-neutral-700 rounded" />
                  </div>
                </div>
                <div className="h-48 rounded-xl border border-[#27272a] bg-neutral-900" />
              </div>
              <div className="space-y-4">
                <div className="h-8 w-24 bg-neutral-800 rounded" />
                <div className="h-80 rounded-xl border border-[#27272a] bg-neutral-900" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
