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
      color: "text-indigo-400",
      bg: "bg-indigo-500/10 border-indigo-500/20",
      tag: "Isolation DB Physique"
    },
    {
      title: "Bulletins & Rangs Automatisés",
      description: "Saisie rapide par les enseignants, calcul automatique des moyennes de classe, des coefficients, des rangs et génération PDF signed.",
      icon: FileText,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
      tag: "Génération &lt; 1 sec"
    },
    {
      title: "Comptabilité & Reçus Officiels",
      description: "Recouvrement automatique des frais de scolarité avec impression de reçus sécurisés et suivi financier des versements.",
      icon: DollarSign,
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
      tag: "Reçus Numérotés"
    },
    {
      title: "Certificats avec QR Code",
      description: "Délivrance instantanée de certificats de scolarité officiels sécurisés par un QR Code d'authentification unique infalsifiable.",
      icon: QrCode,
      color: "text-purple-400",
      bg: "bg-purple-500/10 border-purple-500/20",
      tag: "Anti-Fraude"
    },
    {
      title: "Meta WhatsApp Cloud API",
      description: "Canal officiel WhatsApp pour l'envoi direct des reçus de scolarité, alertes d'absences et communications aux parents.",
      icon: MessageSquare,
      color: "text-rose-400",
      bg: "bg-rose-500/10 border-rose-500/20",
      tag: "SMS &amp; WhatsApp"
    },
    {
      title: "Copilote IA & Recommandations",
      description: "Modèles prédictifs d'intelligence artificielle pour détecter le risque d'échec ou d'absence et proposer des tuteurs.",
      icon: Brain,
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
      tag: "IA Générative"
    }
  ]

  return (
    <section id="features" className="bg-[#090a0f] text-white py-28 border-b border-white/10 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 h-[400px] w-[600px] rounded-full bg-indigo-600/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 h-[300px] w-[450px] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Architecture SaaS de Niveau Entreprise</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Une suite complète pour piloter votre établissement
          </h2>

          <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
            MonÉcole+ rassemble tous les outils nécessaires à la gestion administrative, pédagogique et financière des écoles modernes.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div 
              key={i} 
              className="group p-8 rounded-3xl border border-white/10 bg-slate-950/60 backdrop-blur-xl hover:bg-slate-900/80 hover:border-indigo-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10 relative overflow-hidden flex flex-col justify-between"
            >
              {/* Subtle Card Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              <div className="space-y-6 relative">
                <div className="flex justify-between items-center">
                  <div className={`h-14 w-14 rounded-2xl border ${f.bg} flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg`}>
                    <f.icon className={`h-7 w-7 ${f.color}`} />
                  </div>

                  <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-slate-300">
                    {f.tag}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {f.description}
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-white/5 flex items-center justify-between text-xs font-bold text-indigo-400 group-hover:text-indigo-300">
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
