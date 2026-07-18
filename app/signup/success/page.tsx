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

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 mb-6">
            <GraduationCap className="h-10 w-10 text-primary" />
          </div>

          <h1 className="text-4xl font-bold">
            C'est prêt !
          </h1>

          <p className="mt-4">
            L'environnement dédié pour <b>{school}</b> a été créé avec succès.
          </p>
        </div>

        <Card>

          <CardHeader>
            <CardTitle>Accéder au Dashboard</CardTitle>

            <CardDescription>
              Votre plateforme est prête.
            </CardDescription>
          </CardHeader>

          <CardContent>

            <code>{schoolUrl}</code>

          </CardContent>

          <CardFooter>

            <Link href={schoolUrl} className="w-full">

              <Button className="w-full">

                Ouvrir le Dashboard

                <ArrowRight className="ml-2 h-4 w-4" />

              </Button>

            </Link>

          </CardFooter>

        </Card>

      </div>
    </div>
  )
}

export default function SignupSuccess() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Chargement...</div>}>
      <SignupSuccessContent />
    </Suspense>
  )
}