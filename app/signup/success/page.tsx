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

  const schoolUrl = "/dashboard"

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
                Une base de données physique dédiée a été générée pour votre établissement pour une sécurité maximale.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Globe className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Accès Centralisé</CardTitle>
              <CardDescription>
                Connectez-vous simplement avec votre email depuis n'importe où, nous vous redirigeons vers votre environnement.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle>Accéder à votre tableau de bord</CardTitle>
            <CardDescription>
              Votre compte a été connecté automatiquement. Cliquez ci-dessous pour ouvrir votre espace d'administration.
            </CardDescription>
          </CardHeader>

          <CardFooter className="pt-6">
            <Link
              href={schoolUrl}
              className="w-full"
            >
              <Button className="w-full text-lg h-12">
                Lancer le Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
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