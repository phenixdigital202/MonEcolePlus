"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ShieldAlert, RefreshCw, Home, Terminal } from "lucide-react"
import Link from "next/link"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string; cause?: any }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[CRITICAL_DASHBOARD_ERROR]", {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      cause: error.cause
    })
  }, [error])

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="bg-slate-950 text-slate-100 rounded-3xl p-6 md:p-8 shadow-2xl border border-rose-500/30 space-y-6">
        <div className="flex items-center gap-3 border-b border-rose-500/20 pb-4">
          <div className="h-12 w-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-rose-400">Erreur Dashboard Détectée (Debug MonÉcole+)</h2>
            <p className="text-xs text-slate-400 font-mono">Digest: {error.digest || "N/A"}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-4 bg-rose-950/40 rounded-2xl border border-rose-800/40 text-left">
            <p className="text-xs font-bold text-rose-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5" /> Error Message:
            </p>
            <p className="text-sm font-mono font-bold text-rose-200 break-words">{error.message || "Aucun message d'erreur"}</p>
          </div>

          {error.stack && (
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-left overflow-x-auto max-h-[300px] custom-scrollbar">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Stack Trace:</p>
              <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap break-all">{error.stack}</pre>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button 
            onClick={() => reset()} 
            className="flex-1 rounded-2xl font-bold bg-rose-600 text-white hover:bg-rose-700 gap-2 h-12 shadow-lg shadow-rose-900/50"
          >
            <RefreshCw className="h-4 w-4" /> Réessayer (reset())
          </Button>
          <Link href="/dashboard" className="flex-1">
            <Button variant="outline" className="w-full rounded-2xl font-bold border-slate-700 text-slate-200 hover:bg-slate-800 h-12 gap-2">
              <Home className="h-4 w-4" /> Recharger le Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
