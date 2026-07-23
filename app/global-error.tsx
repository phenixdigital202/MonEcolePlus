"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ShieldAlert, RefreshCw } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[GlobalError] Unhandled error:", error)
  }, [error])

  return (
    <html lang="fr">
      <body className="bg-slate-50 min-h-screen flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl border border-slate-200 text-center space-y-6">
          <div className="h-16 w-16 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
            <ShieldAlert className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-900">Interruption du Service</h1>
            <p className="text-sm text-slate-500">
              Une erreur inattendue est survenue au niveau du serveur. Veuillez rafraîchir la page pour reprendre votre navigation.
            </p>
          </div>

          <Button 
            onClick={() => reset()} 
            className="w-full rounded-2xl font-bold bg-primary text-white hover:bg-primary/90 gap-2 h-12 shadow-lg shadow-primary/20"
          >
            <RefreshCw className="h-4 w-4" /> Recharger la page
          </Button>
        </div>
      </body>
    </html>
  )
}
