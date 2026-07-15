import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Users, Calendar, BarChart3 } from "lucide-react"
import { TenantSelector } from "./tenant-selector"

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/10 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-8 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary ring-1 ring-inset ring-primary/20">
              <Sparkles className="h-4 w-4" />
              <span>Propulsé par l&apos;Intelligence Artificielle</span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl text-balance">
            MonÉcole<span className="text-primary">+</span>
            <br />
            <span className="text-3xl sm:text-5xl lg:text-6xl text-muted-foreground font-medium">
              L&apos;école intelligente propulsée par l&apos;IA
            </span>
          </h1>

          {/* Description */}
          <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto text-pretty">
            La plateforme tout-en-un qui connecte administrateurs, enseignants, élèves et parents.
            Automatisez la gestion scolaire, gagnez du temps et améliorez les résultats grâce à l&apos;intelligence artificielle.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="text-base px-8 h-12" asChild>
              <Link href="/signup">
                Commencer gratuitement
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-base px-8 h-12" asChild>
              <Link href="#features">
                Découvrir les fonctionnalités
              </Link>
            </Button>
          </div>

          {/* Tenant Selector */}
          <div className="mt-16">
            <TenantSelector />
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-8">
            <div className="flex flex-col items-center p-4 rounded-xl bg-card border border-border">
              <Users className="h-6 w-6 text-primary mb-2" />
              <span className="text-2xl font-bold text-foreground">5,000+</span>
              <span className="text-sm text-muted-foreground">Établissements</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-xl bg-card border border-border">
              <Calendar className="h-6 w-6 text-primary mb-2" />
              <span className="text-2xl font-bold text-foreground">500k+</span>
              <span className="text-sm text-muted-foreground">Élèves gérés</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-xl bg-card border border-border">
              <BarChart3 className="h-6 w-6 text-primary mb-2" />
              <span className="text-2xl font-bold text-foreground">98%</span>
              <span className="text-sm text-muted-foreground">Satisfaction</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-xl bg-card border border-border">
              <Sparkles className="h-6 w-6 text-primary mb-2" />
              <span className="text-2xl font-bold text-foreground">40%</span>
              <span className="text-sm text-muted-foreground">Temps gagné</span>
            </div>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="mt-20 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
          <div className="relative mx-auto max-w-5xl">
            <div className="rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-chart-4/60" />
                  <div className="w-3 h-3 rounded-full bg-chart-3/60" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 rounded-md bg-muted text-xs text-muted-foreground">
                    dashboard.monecole.app
                  </div>
                </div>
              </div>
              <div className="p-6 bg-gradient-to-br from-card to-muted/20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-lg bg-background p-4 border border-border">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-muted-foreground">Total Élèves</span>
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">1,247</p>
                    <p className="text-xs text-chart-3 mt-1">+12% ce mois</p>
                  </div>
                  <div className="rounded-lg bg-background p-4 border border-border">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-muted-foreground">Taux de Présence</span>
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">94.5%</p>
                    <p className="text-xs text-chart-3 mt-1">+2.1% vs semaine dernière</p>
                  </div>
                  <div className="rounded-lg bg-background p-4 border border-border">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-muted-foreground">Moyenne Générale</span>
                      <BarChart3 className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">14.2/20</p>
                    <p className="text-xs text-chart-3 mt-1">+0.4 pts ce trimestre</p>
                  </div>
                </div>
                <div className="mt-4 rounded-lg bg-primary/5 border border-primary/20 p-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Insight IA</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        3 élèves montrent des signes de difficulté en mathématiques. Recommandation : séances de soutien ciblées.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
