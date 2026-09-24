"use client"

import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  FileText, 
  DollarSign, 
  Trophy, 
  MessageSquare, 
  Brain,
  ShieldCheck,
  Zap,
  Sparkles,
  QrCode
} from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      title: "Gestion Scolaire & Multi-Tenant",
      description: "Contrôlez les inscriptions, les classes, l'assiduité et les dossiers administratifs sur une base de données physique isolée par école.",
      icon: Users,
      color: "text-indigo-600",
      bg: "bg-indigo-50 border-indigo-200",
      tag: "Isolation DB Physique"
    },
    {
      title: "Bulletins & Rangs Automatisés",
      description: "Saisie rapide par les enseignants, calcul automatique des moyennes de classe, des coefficients, des rangs et génération PDF signée.",
      icon: FileText,
      color: "text-emerald-600",
      bg: "bg-emerald-50 border-emerald-200",
      tag: "Génération &lt; 1 sec"
    },
    {
      title: "Comptabilité & Reçus Officiels",
      description: "Recouvrement automatique des frais de scolarité avec impression de reçus sécurisés et suivi financier des versements.",
      icon: DollarSign,
      color: "text-amber-600",
      bg: "bg-amber-50 border-amber-200",
      tag: "Reçus Numérotés"
    },
    {
      title: "Certificats avec QR Code",
      description: "Délivrance instantanée de certificats de scolarité officiels sécurisés par un QR Code d'authentification unique infalsifiable.",
      icon: QrCode,
      color: "text-purple-600",
      bg: "bg-purple-50 border-purple-200",
      tag: "Anti-Fraude"
    },
    {
      title: "Meta WhatsApp Cloud API",
      description: "Canal officiel WhatsApp pour l'envoi direct des reçus de scolarité, alertes d'absences et communications aux parents.",
      icon: MessageSquare,
      color: "text-rose-600",
      bg: "bg-rose-50 border-rose-200",
      tag: "SMS &amp; WhatsApp"
    },
    {
      title: "Copilote IA & Recommandations",
      description: "Modèles prédictifs d'intelligence artificielle pour détecter le risque d'échec ou d'absence et proposer des tuteurs.",
      icon: Brain,
      color: "text-blue-600",
      bg: "bg-blue-50 border-blue-200",
      tag: "IA Générative"
    }
  ]

  return (
    <section id="features" className="bg-white text-slate-900 py-28 border-b border-slate-200/80 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 h-[400px] w-[600px] rounded-full bg-indigo-100/60 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 h-[300px] w-[450px] rounded-full bg-purple-100/60 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            <span>Architecture SaaS de Niveau Entreprise</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Une suite complète pour piloter votre établissement
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            MonÉcole+ rassemble tous les outils nécessaires à la gestion administrative, pédagogique et financière des écoles modernes.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div 
              key={i} 
              className="group p-8 rounded-3xl border border-slate-200/80 bg-slate-50/70 backdrop-blur-xl hover:bg-white hover:border-indigo-400/50 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden flex flex-col justify-between shadow-sm"
            >
              {/* Subtle Card Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/40 via-transparent to-purple-50/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              <div className="space-y-6 relative">
                <div className="flex justify-between items-center">
                  <div className={`h-14 w-14 rounded-2xl border ${f.bg} flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm`}>
                    <f.icon className={`h-7 w-7 ${f.color}`} />
                  </div>

                  <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full border border-slate-200 bg-white text-slate-700 shadow-xs">
                    {f.tag}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {f.description}
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-indigo-600 group-hover:text-indigo-700">
                <span>Découvrir le module</span>
                <Zap className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
