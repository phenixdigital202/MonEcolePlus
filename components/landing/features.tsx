"use client"

import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  FileText, 
  DollarSign, 
  Trophy, 
  MessageSquare, 
  Brain 
} from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      title: "Gestion Scolaire Intégrée",
      description: "Contrôlez les inscriptions, les classes, l'assiduité et les dossiers administratifs depuis un espace unique.",
      icon: Users,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10"
    },
    {
      title: "Bulletins & Notes Automatisés",
      description: "Saisie rapide des évaluations par les enseignants et génération automatisée des bulletins de notes.",
      icon: FileText,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    },
    {
      title: "Comptabilité & Mobile Money",
      description: "Recouvrement automatique des frais de scolarité via Orange Money, MTN MoMo, Wave et Cartes Bancaires.",
      icon: DollarSign,
      color: "text-amber-500",
      bg: "bg-amber-500/10"
    },
    {
      title: "Examens Nationaux",
      description: "Planification des sessions (BAC, BEPC, Blancs) avec attribution automatique des numéros de table.",
      icon: Trophy,
      color: "text-purple-500",
      bg: "bg-purple-500/10"
    },
    {
      title: "Messagerie & WhatsApp",
      description: "Canal de communication directe entre l'administration, les enseignants, les parents et les élèves.",
      icon: MessageSquare,
      color: "text-rose-500",
      bg: "bg-rose-500/10"
    },
    {
      title: "Bibliothèque Numérique",
      description: "Partage instantané de cours, fiches de révision, exercices corrigés et livres au format PDF.",
      icon: BookOpen,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    }
  ]

  return (
    <section className="bg-[#09090b] text-white py-24 border-b border-[#27272a]/40 relative">
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 h-[300px] w-[500px] rounded-full bg-purple-500/5 blur-[100px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-16 relative">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Une suite complète pour piloter votre établissement
          </h2>
          <p className="text-sm sm:text-base text-[#a1a1aa] leading-relaxed">
            MonÉcole+ rassemble tous les outils nécessaires à la gestion administrative, pédagogique et financière des écoles modernes.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div key={i} className="group p-6 rounded-2xl border border-[#27272a] bg-neutral-950/40 hover:bg-neutral-900/60 hover:border-indigo-500/30 transition-all duration-300">
              <div className={`h-12 w-12 rounded-xl ${f.bg} flex items-center justify-center mb-6`}>
                <f.icon className={`h-6 w-6 ${f.color}`} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                {f.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
