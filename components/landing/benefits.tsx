"use client"

import { Brain, Sparkles, TrendingUp, ShieldAlert, Award, CheckCircle2, Zap } from "lucide-react"

export function BenefitsSection() {
  const highlights = [
    {
      title: "Index Synthétique de Performance",
      description: "Suivez un indice synthétique en temps réel évaluant la réussite scolaire, l'assiduité et la santé financière de votre établissement.",
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50 border-emerald-200"
    },
    {
      title: "Prévention du Décrochage Scolaire",
      description: "Notre IA identifie de manière précoce les élèves en difficulté d'apprentissage ou d'assiduité afin de proposer un tutorat adapté.",
      icon: ShieldAlert,
      color: "text-rose-600",
      bg: "bg-rose-50 border-rose-200"
    },
    {
      title: "Recommandations Pédagogiques IA",
      description: "Générez des rapports automatiques d'aide à la décision pour orienter les enseignants et guider les familles vers la réussite.",
      icon: Brain,
      color: "text-indigo-600",
      bg: "bg-indigo-50 border-indigo-200"
    }
  ]

  return (
    <section id="benefits" className="bg-slate-50/80 text-slate-900 py-28 border-b border-slate-200/80 relative overflow-hidden">
      <div className="absolute top-1/3 right-10 h-[450px] w-[650px] rounded-full bg-purple-200/40 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-14 lg:grid-cols-2 items-center relative">
        {/* Left Column: Text & List */}
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            <span>Copilote Intelligence Artificielle</span>
          </div>
          
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Un assistant intelligent pour la direction et les professeurs
          </h2>
          
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Grâce à ses modèles prédictifs intégrés, MonÉcole+ analyse vos données pour fournir des conseils pédagogiques personnalisés et des rapports décisionnels automatisés.
          </p>

          <div className="space-y-4 pt-2">
            {highlights.map((h, i) => (
              <div key={i} className="flex gap-4 p-5 rounded-2xl border border-slate-200 bg-white backdrop-blur-xl hover:border-indigo-400/50 hover:shadow-md transition-all shadow-sm">
                <div className={`h-12 w-12 rounded-xl ${h.bg} flex items-center justify-center shrink-0`}>
                  <h.icon className={`h-6 w-6 ${h.color}`} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-slate-900">{h.title}</h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{h.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Luminous Preview Box */}
        <div className="p-8 rounded-3xl border-2 border-slate-200 bg-white shadow-2xl relative overflow-hidden space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Index de Réussite Scolaire</h4>
                <p className="text-xs text-slate-500">Évaluation analytique globale</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              92.8% Excellent
            </span>
          </div>

          {/* Progress Gauges */}
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-800">Taux de Réussite aux Évaluations</span>
                <span className="text-emerald-600">92.8% (+3.4%)</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden p-0.5 border border-slate-300">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" style={{ width: "92.8%" }} />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-800">Taux d&apos;Assiduité de la Semaine</span>
                <span className="text-indigo-600">97.2%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden p-0.5 border border-slate-300">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: "97.2%" }} />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-700">
                <Award className="h-4 w-4 text-amber-500" />
                <span>Recommandation Générée par l&apos;IA</span>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed font-sans bg-white p-3 rounded-xl border border-indigo-100 shadow-sm">
                &ldquo;Les résultats en Physique-Chimie ont augmenté de 1.5 pt suite au tutorat. Il est conseillé de planifier la composition du 2nd trimestre le 15 Décembre.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
