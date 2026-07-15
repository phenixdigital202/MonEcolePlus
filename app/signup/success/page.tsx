"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { GraduationCap, CheckCircle2, Globe, ArrowRight, ShieldCheck } from "lucide-react"

export default function SignupSuccess() {
  const searchParams = useSearchParams()
  const school = searchParams.get("school") || "votre établissement"
  const subdomain = searchParams.get("subdomain") || "demo"
  
  const schoolUrl = subdomain === "demo" 
    ? "http://localhost:3000/dashboard" 
    : `http://${subdomain}.localhost:3000/dashboard`

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 mb-6 group transition-all hover:scale-110">
            <GraduationCap className="h-10 w-10 text-primary group-hover:rotate-12 transition-transform" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl mb-4">
            C&apos;est prêt !
          </h1>
          <p className="text-xl text-slate-600 max-w-lg mx-auto">
            L&apos;environnement dédié pour <span className="font-bold text-primary">{school}</span> a été provisionné avec succès.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card className="border-primary/20 shadow-lg shadow-primary/5 hover:border-primary/40 transition-all">
            <CardHeader className="pb-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center mb-2">
                <ShieldCheck className="h-6 w-6 text-emerald-600" />
              </div>
              <CardTitle className="text-lg">Données Isolées</CardTitle>
              <CardDescription>
                Une base de données physique exclusive a été créée pour vos données.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-primary/20 shadow-lg shadow-primary/5 hover:border-primary/40 transition-all">
            <CardHeader className="pb-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center mb-2">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">URL Dédiée</CardTitle>
              <CardDescription>
                Votre établissement est accessible via son propre sous-domaine sécurisé.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card className="border-2 border-primary bg-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <CheckCircle2 className="h-32 w-32 text-primary" />
          </div>
          
          <CardHeader>
            <CardTitle>Accéder à votre Dashboard</CardTitle>
            <CardDescription>
              Utilisez le lien ci-dessous pour vous connecter à votre nouvel espace administratif.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="bg-slate-50 border-y py-6">
            <div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-white border border-slate-200">
              <code className="text-primary font-mono font-medium truncate">
                {schoolUrl}
              </code>
              <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(schoolUrl)}>
                Copier
              </Button>
            </div>
          </CardContent>
          
          <CardFooter className="pt-6">
            <Link href={schoolUrl} className="w-full">
              <Button className="w-full h-14 text-lg font-semibold gap-2 shadow-lg shadow-primary/20">
                Lancer le Dashboard <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <p className="text-center mt-10 text-slate-500 text-sm">
          Un email de confirmation avec vos accès vous a été envoyé. <br/>
          Besoin d&apos;aide ? Contactez notre <Link href="#" className="text-primary hover:underline">support technique</Link>.
        </p>
      </div>
    </div>
  )
}
