import { LandingHeader } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { Button } from "@/components/ui/button"
import { PlayCircle, Shield, Award, Users, BookOpen, Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function DemoPage() {
  const demos = [
    {
      role: "Espace Administration",
      icon: Shield,
      description: "Visualisez l'ERP complet avec comptabilité, gestion des inscriptions, bulletins et pilotage des classes.",
      cta: "Tester la démo Admin",
      href: "/login",
      color: "text-blue-600",
      bg: "bg-blue-50 border border-blue-100"
    },
    {
      role: "Espace Enseignant",
      icon: Award,
      description: "Saisissez les notes, enregistrez les absences, gérez le cahier de textes et l'emploi du temps interactif.",
      cta: "Tester la démo Enseignant",
      href: "/login",
      color: "text-purple-600",
      bg: "bg-purple-50 border border-purple-100"
    },
    {
      role: "Espace Parent",
      icon: Users,
      description: "Suivez en temps réel les notes de vos enfants, leur présence et effectuez les règlements de scolarité.",
      cta: "Tester la démo Parent",
      href: "/login",
      color: "text-emerald-600",
      bg: "bg-emerald-50 border border-emerald-100"
    },
    {
      role: "Espace Élève",
      icon: BookOpen,
      description: "Accédez à l'emploi du temps interactif, aux cours en ligne de la bibliothèque et aux relevés de notes.",
      cta: "Tester la démo Élève",
      href: "/login",
      color: "text-amber-600",
      bg: "bg-amber-50 border border-amber-100"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 text-slate-900 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-20 left-1/3 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-1/3 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

      <LandingHeader />
      
      <main className="max-w-7xl mx-auto px-6 lg:px-8 pt-36 pb-24 space-y-16 relative z-10">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-200/80 bg-blue-50/80 text-blue-700 text-xs font-bold uppercase tracking-wider shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>Démonstration Interactive Immédiate</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 leading-tight">
            Explorez MonÉcole+ en condition réelle
          </h1>
          <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
            Essayez les différents espaces utilisateurs de la plateforme MonÉcole+ avec des données pré-remplies sans aucune installation.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          {demos.map((d, i) => (
            <div 
              key={i} 
              className="p-8 sm:p-9 rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200/80 hover:border-blue-300 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between items-start space-y-8 hover:-translate-y-1 group"
            >
              <div className="space-y-4 w-full">
                <div className="flex items-center justify-between">
                  <div className={`h-14 w-14 rounded-2xl ${d.bg} flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-110`}>
                    <d.icon className={`h-7 w-7 ${d.color}`} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-slate-100 text-slate-500">
                    Accès Démo
                  </span>
                </div>
                
                <h3 className="text-xl font-black text-slate-900">{d.role}</h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                  {d.description}
                </p>
              </div>
              
              <Button 
                asChild
                className="w-full h-12 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-xs rounded-2xl shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-[1.01] flex items-center justify-center gap-2"
              >
                <Link href={d.href}>
                  <PlayCircle className="h-4 w-4" />
                  {d.cta}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
