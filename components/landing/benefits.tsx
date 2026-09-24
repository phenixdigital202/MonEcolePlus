"use client"

import { Brain, Sparkles, TrendingUp, ShieldAlert, Award, CheckCircle2, Zap } from "lucide-react"

export function BenefitsSection() {
  const highlights = [
    {
      title: "Index Synthétique de Performance",
      description: "Suivez un indice synthétique en temps réel évaluant la réussite scolaire, l'assiduité et la santé financière de votre établissement.",
      icon: TrendingUp,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20"
    },
    {
      title: "Prévention du Décrochage Scolaire",
      description: "Notre IA identifie de manière précoce les élèves en difficulté d'apprentissage ou d'assiduité afin de proposer un tutorat adapté.",
      icon: ShieldAlert,
      color: "text-rose-400",
      bg: "bg-rose-500/10 border-rose-500/20"
    },
    {
      title: "Recommandations Pédagogiques IA",
      description: "Générez des rapports automatiques d'aide à la décision pour orienter les enseignants et guider les familles vers la réussite.",
      icon: Brain,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10 border-indigo-500/20"
    }
  ]

  return (
    <section id="benefits" className="bg-[#090a0f] text-white py-28 border-b border-white/10 relative overflow-hidden">
      <div className="absolute top-1/3 right-10 h-[450px] w-[650px] rounded-full bg-purple-600/10 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-14 lg:grid-cols-2 items-center relative">
        {/* Left Column: Text & List */}
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Copilote Intelligence Artificielle</span>
          </div>
          
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Un assistant intelligent pour la direction et les professeurs
          </h2>
          
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Grâce à ses modèles prédictifs intégrés, MonÉcole+ analyse vos données pour fournir des conseils pédagogiques personnalisés et des rapports décisionnels automatisés.
          </p>

          <div className="space-y-4 pt-2">
            {highlights.map((h, i) => (
              <div key={i} className="flex gap-4 p-5 rounded-2xl border border-white/10 bg-slate-950/60 backdrop-blur-xl hover:border-indigo-500/30 transition-all">
                <div className={`h-12 w-12 rounded-xl ${h.bg} flex items-center justify-center shrink-0`}>
                  <h.icon className={`h-6 w-6 ${h.color}`} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white">{h.title}</h4>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{h.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: High Tech Preview Box */}
        <div className="p-8 rounded-3xl border border-white/15 bg-slate-950/80 backdrop-blur-2xl shadow-2xl relative overflow-hidden space-y-6">
          <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white">
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Index de Réussite Scolaire</h4>
                <p className="text-xs text-slate-400">Évaluation analytique globale</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              92.8% Excellent
            </span>
          </div>

          {/* Progress Gauges */}
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-300">Taux de Réussite aux Évaluations</span>
                <span className="text-emerald-400">92.8% (+3.4%)</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-900 overflow-hidden p-0.5 border border-white/10">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: "92.8%" }} />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-300">Taux d&apos;Assiduité de la Semaine</span>
                <span className="text-indigo-400">97.2%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-900 overflow-hidden p-0.5 border border-white/10">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-400 rounded-full" style={{ width: "97.2%" }} />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                <Award className="h-4 w-4 text-amber-400" />
                <span>Recommandation Générée par l&apos;IA</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-900/60 p-3 rounded-xl border border-white/5">
                &ldquo;Les résultats en Physique-Chimie ont augmenté de 1.5 pt suite au tutorat. Il est conseillé de planifier la composition du 2nd trimestre le 15 Décembre.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
