"use client"

import { Quote, Star, ShieldCheck } from "lucide-react"

const testimonials = [
  {
    quote: "MonÉcole+ a métamorphosé notre gestion administrative. Les bulletins qui prenaient des jours se génèrent maintenant en quelques secondes avec une précision chirurgicale.",
    author: "Marie Kouadio",
    role: "Directrice Générale",
    school: "Lycée International Excellence",
    location: "Abidjan, Côte d'Ivoire",
    avatar: "MK",
    rating: 5,
  },
  {
    quote: "L'isolation physique multi-tenant nous garantit une confidentialité totale. L'intégration WhatsApp pour les reçus et absences a ravi tous les parents d'élèves.",
    author: "Jean-Pierre Mbeki",
    role: "Proviseur Établissement",
    school: "Complexe Scolaire Saint-Joseph",
    location: "Dakar, Sénégal",
    avatar: "JM",
    rating: 5,
  },
  {
    quote: "En tant que parent, recevoir immédiatement le reçu de scolarité PDF et le bulletin de mon enfant sur WhatsApp me donne une confiance absolue dans l'établissement.",
    author: "Fatou Diallo",
    role: "Parent d'élève & Présidente APE",
    school: "Groupe Scolaire Les Étoiles",
    location: "Conakry, Guinée",
    avatar: "FD",
    rating: 5,
  },
]

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="bg-[#090a0f] text-white py-28 border-b border-white/10 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] bg-indigo-600/10 blur-[160px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Témoignages Vérifiés</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Ce que disent nos directeurs &amp; parents
          </h2>

          <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
            Plus de 500 établissements scolaires nous font confiance à travers l&apos;Afrique pour gérer leurs écoles avec sérénité.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, index) => (
            <div
              key={index}
              className="relative flex flex-col justify-between rounded-3xl border border-white/10 bg-slate-950/60 p-8 backdrop-blur-xl hover:border-indigo-500/40 hover:bg-slate-900/80 transition-all duration-300 hover:-translate-y-1 shadow-2xl space-y-6"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex gap-1">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <Quote className="h-8 w-8 text-indigo-500/30" />
                </div>

                <blockquote className="text-xs sm:text-sm text-slate-200 leading-relaxed italic">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
              </div>

              <div className="pt-6 border-t border-white/10 flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 border border-white/20 flex items-center justify-center font-bold text-white text-sm shrink-0">
                  {t.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{t.author}</h4>
                  <p className="text-xs text-slate-400">{t.role}</p>
                  <p className="text-xs font-bold text-indigo-400 mt-0.5">{t.school}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
