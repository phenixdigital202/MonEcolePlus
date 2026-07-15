"use client"

import { useState, useTransition } from "react"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Brain, Clock, Wand2, CheckCircle2, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { generateAIScheduleAll } from "@/lib/schedule-actions"
import { toast } from "sonner"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"

export default function ScheduleAIPage() {
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<"idle" | "generating" | "success" | "error">("idle")
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState("")

  const steps = [
    { message: "Analyse du cursus et des contraintes professeurs...", progress: 20 },
    { message: "Optimisation de la répartition des salles...", progress: 45 },
    { message: "Résolution des conflits d'horaires...", progress: 70 },
    { message: "Finalisation et insertion dans la base de données...", progress: 90 },
  ]

  const handleGenerate = () => {
    setStatus("generating")
    setProgress(0)
    
    // Simulate multi-step UI progress
    let stepIdx = 0
    const interval = setInterval(() => {
      if (stepIdx < steps.length) {
        setCurrentStep(steps[stepIdx].message)
        setProgress(steps[stepIdx].progress)
        stepIdx++
      } else {
        clearInterval(interval)
      }
    }, 1500)

    startTransition(async () => {
      const result = await generateAIScheduleAll()
      
      // Wait for at least the animation time
      setTimeout(() => {
        if (result.success) {
          setStatus("success")
          setProgress(100)
          toast.success(`${result.count} cours générés avec succès pour toutes les classes !`)
        } else {
          setStatus("error")
          toast.error(result.error || "Une erreur est survenue")
        }
      }, 6500)
    })
  }

  return (
    <>
      <DashboardHeader 
        title="Génération IA - Emploi du Temps" 
        subtitle="Optimisez automatiquement le planning de tout l'établissement"
      />
      
      <main className="p-6">
        <div className="max-w-4xl mx-auto">
          {status === "idle" || status === "generating" ? (
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-primary/20 bg-primary/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Sparkles className="h-24 w-24 text-primary" />
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-6 w-6 text-primary" />
                    Optimisation Globale
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-muted-foreground leading-relaxed">
                    Cette action générera automatiquement un emploi du temps complet pour **toutes les classes** en respectant les contraintes pédagogiques. 
                    <br /><br />
                    <span className="text-destructive font-semibold">Attention :</span> Cela remplacera les emplois du temps existants.
                  </p>
                  
                  {status === "generating" ? (
                    <div className="space-y-4 pt-4">
                      <div className="flex justify-between text-sm font-medium">
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          {currentStep}
                        </span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  ) : (
                    <Button className="w-full h-12 text-lg shadow-lg" onClick={handleGenerate}>
                      <Wand2 className="h-5 w-5 mr-2" />
                      Lancer la génération globale
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 italic">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    Historique des versions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "Version Printemps 2026", date: "Aujourd'hui, 10:24", status: "Brouillon" },
                      { name: "Session Automne 2025", date: "15 Janv. 2026", status: "Publié" },
                    ].map((v, i) => (
                      <div key={i} className="flex justify-between items-center p-4 rounded-xl bg-muted/30 border border-border/50">
                        <div>
                          <p className="text-sm font-bold">{v.name}</p>
                          <p className="text-xs text-muted-foreground">{v.date}</p>
                        </div>
                        <span className="text-[10px] px-2 py-1 rounded-full bg-background border font-bold uppercase tracking-wider">{v.status}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : status === "success" ? (
            <Card className="border-emerald-500/20 bg-emerald-500/5 text-center p-12">
              <CardContent className="space-y-6">
                <div className="h-20 w-20 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-foreground">Génération Terminée !</h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Le nouvel emploi du temps pour toutes les classes a été généré avec succès et est maintenant actif dans tout l'établissement.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                  <Link href="/dashboard/schedule">
                    <Button size="lg" className="px-8">
                      Voir le planning global
                    </Button>
                  </Link>
                  <Button variant="outline" size="lg" onClick={() => setStatus("idle")}>
                    Recommencer
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-destructive/20 bg-destructive/5 text-center p-12">
              <CardContent className="space-y-4">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
                <h2 className="text-2xl font-bold">Erreur de génération</h2>
                <p className="text-muted-foreground">Impossible de générer le planning. Vérifiez si vous avez assez d'enseignants et de classes enregistrés.</p>
                <Button variant="outline" onClick={() => setStatus("idle")}>Réessayer</Button>
              </CardContent>
            </Card>
          )}

          <div className="mt-12 p-6 rounded-2xl bg-primary/5 border border-primary/10 flex gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-bold text-primary mb-1">Comment fonctionne l'IA ?</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Notre intelligence artificielle utilise un moteur de résolution de contraintes pour s'assurer qu'aucun enseignant 
                n'est présent dans deux salles à la fois et que les heures de cours sont réparties équitablement sur la semaine.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
