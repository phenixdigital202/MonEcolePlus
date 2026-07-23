"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw, LayoutDashboard } from "lucide-react"
import Link from "next/link"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[DashboardError] Caught error:", error)
  }, [error])

  return (
    <div className="flex-1 p-6 md:p-12 flex flex-col items-center justify-center text-center space-y-6">
      <div className="h-16 w-16 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-200">
        <AlertCircle className="h-8 w-8" />
      </div>

      <div className="max-w-md space-y-2">
        <h2 className="text-xl font-bold text-slate-900">Chargement interrompu</h2>
        <p className="text-xs text-slate-500">
          Les données de cette section n&apos;ont pas pu être récupérées temporairement. Cliquez sur Réessayer pour tenter un nouveau chargement.
        </p>
      </div>

      <div className="flex gap-3">
        <Button onClick={() => reset()} className="rounded-2xl font-bold bg-primary text-white gap-2">
          <RefreshCw className="h-4 w-4" /> Réessayer
        </Button>
        <Link href="/dashboard">
          <Button variant="outline" className="rounded-2xl font-bold border-slate-200 gap-2">
            <LayoutDashboard className="h-4 w-4" /> Tableau de bord
          </Button>
        </Link>
      </div>
    </div>
  )
}
