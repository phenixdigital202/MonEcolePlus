import { LandingHeader } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { Button } from "@/components/ui/button"
import { PlayCircle, Shield, Award, Users, BookOpen } from "lucide-react"

export default function DemoPage() {
  const demos = [
    {
      role: "Espace Administration",
      icon: Shield,
      description: "Visualisez l'ERP complet avec comptabilité, gestion des inscriptions et configuration des classes.",
      cta: "Découvrir la démo Admin",
      color: "text-indigo-400",
      bg: "bg-indigo-500/10"
    },
    {
      role: "Espace Enseignant",
      icon: Award,
      description: "Saisissez les notes, enregistrez les absences, gérez le cahier de textes et l'emploi du temps.",
      cta: "Découvrir la démo Enseignant",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10"
    },
    {
      role: "Espace Parent",
      icon: Users,
      description: "Suivez en temps réel les notes de vos enfants, leur présence et effectuez les règlements de scolarité.",
      cta: "Découvrir la démo Parent",
      color: "text-amber-400",
      bg: "bg-amber-500/10"
    },
    {
      role: "Espace Élève",
      icon: BookOpen,
      description: "Accédez à l'emploi du temps interactif, aux cours en ligne de la bibliothèque et aux relevés de notes.",
      cta: "Découvrir la démo Élève",
      color: "text-rose-400",
      bg: "bg-rose-500/10"
    }
  ]

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <LandingHeader />
      
      <main className="max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-24 space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Démonstration Interactive
          </h1>
          <p className="text-base sm:text-lg text-[#a1a1aa] leading-relaxed">
            Essayez les différents espaces utilisateurs de la plateforme MonÉcole+ avec des données pré-remplies.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {demos.map((d, i) => (
            <div key={i} className="p-6 rounded-2xl border border-[#27272a] bg-neutral-950/40 hover:bg-neutral-900/60 hover:border-indigo-500/30 transition-all flex flex-col justify-between items-start space-y-6">
              <div className="space-y-4">
                <div className={`h-12 w-12 rounded-xl ${d.bg} flex items-center justify-center`}>
                  <d.icon className={`h-6 w-6 ${d.color}`} />
                </div>
                <h3 className="text-lg font-bold text-white">{d.role}</h3>
                <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed">
                  {d.description}
                </p>
              </div>
              
              <Button className="w-full bg-[#18181b] hover:bg-[#27272a] text-white border border-[#27272a] h-11 rounded-xl font-bold flex items-center justify-center gap-2">
                <PlayCircle className="h-4 w-4" />
                {d.cta}
              </Button>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
