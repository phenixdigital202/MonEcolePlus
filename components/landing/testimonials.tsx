import { Quote, Star } from "lucide-react"

const testimonials = [
  {
    quote: "MonÉcole+ a révolutionné notre gestion quotidienne. Les bulletins qui prenaient des heures se génèrent maintenant en quelques clics.",
    author: "Marie Kouadio",
    role: "Directrice",
    school: "Lycée International de Dakar",
    rating: 5,
  },
  {
    quote: "L'IA nous aide à identifier les élèves en difficulté avant qu'il ne soit trop tard. Un outil indispensable pour tout établissement moderne.",
    author: "Jean-Pierre Mbeki",
    role: "Proviseur",
    school: "Collège Saint-Joseph, Abidjan",
    rating: 5,
  },
  {
    quote: "En tant que parent, je peux enfin suivre la scolarité de mes enfants en temps réel. Les notifications m'alertent immédiatement.",
    author: "Fatou Diallo",
    role: "Parent d'élève",
    school: "École Primaire Les Étoiles",
    rating: 5,
  },
]

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 lg:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Ce que disent nos utilisateurs
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Plus de 5,000 établissements nous font confiance à travers l&apos;Afrique.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative flex flex-col rounded-2xl bg-card border border-border p-8"
            >
              <Quote className="h-8 w-8 text-primary/20 mb-4" />
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-chart-4 text-chart-4" />
                ))}
              </div>
              <blockquote className="flex-1 text-foreground leading-relaxed">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <div className="mt-6 pt-6 border-t border-border">
                <div className="font-semibold text-foreground">{testimonial.author}</div>
                <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                <div className="text-sm text-primary">{testimonial.school}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
