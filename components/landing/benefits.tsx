"use client"

import { Brain, Sparkles, TrendingUp, ShieldAlert, Award } from "lucide-react"

export function BenefitsSection() {
  const highlights = [
    {
      title: "Index de Santé & Performance",
      description: "Suivez un indice synthétique en temps réel évaluant la réussite scolaire, l'assiduité et la santé financière de votre établissement.",
      icon: TrendingUp,
      color: "text-emerald-400"
    },
    {
      title: "Prévention du Décrochage Scolaire",
      description: "Notre IA identifie de manière précoce les élèves en difficulté d'apprentissage ou d'assiduité afin de mettre en place un tutorat adapté.",
      icon: ShieldAlert,
      color: "text-rose-400"
    },
    {
      title: "Recommandations Pédagogiques",
      description: "Générez des rapports automatiques d'aide à la décision pour orienter les enseignants et aider les familles à soutenir leurs enfants.",
      icon: Brain,
      color: "text-indigo-400"
    }
  ]

  return (
    <section className="bg-[#09090b] text-white py-24 border-b border-[#27272a]/40 relative">
      <div className="absolute bottom-0 right-1/4 h-[350px] w-[500px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid gap-12 lg:grid-cols-2 items-center relative">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            Intelligence Artificielle Éducative
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent leading-[1.15]">
            Un copilote intelligent pour la direction et les enseignants
          </h2>
          
          <p className="text-sm sm:text-base text-[#a1a1aa] leading-relaxed">
            Grâce à l&apos;intégration des modèles prédictifs, MonÉcole+ ne se contente pas de stocker vos données scolaires. Elle les analyse pour vous fournir des recommandations pédagogiques et administratives concrètes.
          </p>

          <div className="space-y-4 pt-4">
            {highlights.map((h, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-xl border border-[#27272a] bg-neutral-950/20">
                <div className="flex-shrink-0">
                  <h.icon className={`h-6 w-6 ${h.color}`} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">{h.title}</h4>
                  <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed">{h.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visual Showcase Card */}
        <div className="p-6 rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/20 to-purple-950/20 relative overflow-hidden backdrop-blur-md">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#6366f115,transparent_50%)] pointer-events-none" />
          
          <div className="space-y-6 relative">
            <div className="flex justify-between items-center pb-4 border-b border-[#27272a]">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-indigo-400" />
                <span className="text-sm font-extrabold tracking-tight">Assistant IA MonÉcole+</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">Modèle Prédictif</span>
            </div>

            {/* AI Insights Card Mockup */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-neutral-950/50 border border-[#27272a] space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white">Indice de Réussite Estimé</span>
                  <span className="text-xs font-bold text-emerald-400">89.4% (+2.1%)</span>
                </div>
                <div className="h-2 w-full rounded bg-neutral-800 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded" style={{ width: "89.4%" }} />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-neutral-950/50 border border-[#27272a] space-y-3">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-bold text-white">Recommandation Pédagogique</span>
                </div>
                <p className="text-xs text-[#a1a1aa] leading-relaxed">
                  &ldquo;La classe de 3ème A affiche un ralentissement sur la moyenne en Mathématiques. Il est conseillé d&apos;organiser des sessions de soutien ciblées avant les compositions trimestrielles.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
