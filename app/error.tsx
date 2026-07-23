"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ShieldAlert, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[RootError] Caught error:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-200 text-center space-y-6">
        <div className="h-16 w-16 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900">Oups ! Une interruption est survenue</h1>
          <p className="text-sm text-slate-500">
            Une erreur temporaire s&apos;est produite lors du chargement de cette page. Votre session reste active.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button 
            onClick={() => reset()} 
            className="flex-1 rounded-2xl font-bold bg-primary text-white hover:bg-primary/90 gap-2 h-12 shadow-lg shadow-primary/20"
          >
            <RefreshCw className="h-4 w-4" /> Réessayer
          </Button>
          <Link href="/dashboard" className="flex-1">
            <Button variant="outline" className="w-full rounded-2xl font-bold border-slate-200 h-12 gap-2">
              <Home className="h-4 w-4" /> Accueil
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
