"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"

import {
  GraduationCap,
  CheckCircle2,
  Globe,
  ArrowRight,
  ShieldCheck,
} from "lucide-react"

function SignupSuccessContent() {
  const searchParams = useSearchParams()

  const school = searchParams.get("school") || "votre établissement"
  const subdomain = searchParams.get("subdomain") || "demo"

  const schoolUrl =
    subdomain === "demo"
      ? "http://localhost:3000/dashboard"
      : `http://${subdomain}.localhost:3000/dashboard`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(schoolUrl)
      alert("Lien copié !")
    } catch {
      alert("Impossible de copier le lien.")
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 mb-6">
            <GraduationCap className="h-10 w-10 text-primary" />
          </div>

          <h1 className="text-4xl font-extrabold mb-4">
            C&apos;est prêt !
          </h1>

          <p className="text-xl text-slate-600">
            L&apos;environnement dédié pour{" "}
            <span className="font-bold text-primary">
              {school}
            </span>{" "}
            a été créé avec succès.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <ShieldCheck className="h-8 w-8 text-emerald-600 mb-2" />
              <CardTitle>Données isolées</CardTitle>
              <CardDescription>
                Une base de données dédiée a été créée pour votre établissement.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Globe className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>URL dédiée</CardTitle>
              <CardDescription>
                Votre établissement dispose de son propre sous-domaine.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle>Accéder à votre tableau de bord</CardTitle>
            <CardDescription>
              Utilisez le lien ci-dessous pour ouvrir votre espace.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="flex items-center gap-3">
              <code className="flex-1 rounded bg-slate-100 p-3 overflow-auto">
                {schoolUrl}
              </code>

              <Button
                variant="outline"
                onClick={copyToClipboard}
              >
                Copier
              </Button>
            </div>
          </CardContent>

          <CardFooter>
            <Link
              href={schoolUrl}
              className="w-full"
            >
              <Button className="w-full">
                Lancer le Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <div className="text-center mt-8 text-sm text-slate-500">
          <CheckCircle2 className="inline mr-2 h-4 w-4 text-green-600" />
          Un email de confirmation vous a été envoyé.
        </div>
      </div>
    </div>
  )
}

export default function SignupSuccess() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Chargement...
        </div>
      }
    >
      <SignupSuccessContent />
    </Suspense>
  )
}