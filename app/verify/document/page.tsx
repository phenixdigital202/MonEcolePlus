"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { ShieldCheck, ShieldAlert, Loader2, FileText, Calendar, Building, User } from "lucide-react"

export default function VerifyDocumentPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center text-white">
          <Building className="h-12 w-12 mx-auto mb-3" />
          <h1 className="text-2xl font-black tracking-tight">MonÉcole+</h1>
          <p className="text-blue-100 text-sm mt-1">Portail d'Authentification des Pièces Officielles</p>
        </div>
        
        <VerificationContent />
        
        <div className="bg-slate-50 p-6 text-center border-t border-slate-100 text-xs text-slate-400">
          <p>© 2026 MonÉcole+. Tous droits réservés.</p>
          <p className="mt-1">Ce document contient une signature électronique et un condensat cryptographique SHA256 infalsifiable.</p>
        </div>
      </div>
    </main>
  )
}

function VerificationContent() {
  const searchParams = useSearchParams()
  const docId = searchParams.get("id")
  
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!docId) {
      setError("Aucun identifiant de document n'a été spécifié.")
      setLoading(false)
      return
    }

    async function fetchVerification() {
      try {
        const response = await fetch(`/api/verify-document?id=${docId}`)
        const data = await response.json()
        if (data.success) {
          setResult(data.data)
        } else {
          setError(data.error || "Document introuvable ou invalide.")
        }
      } catch (err) {
        setError("Erreur réseau lors de la vérification du document.")
      } finally {
        setLoading(false)
      }
    }

    fetchVerification()
  }, [docId])

  if (loading) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-medium">Analyse des signatures de sécurité en cours...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl flex items-center justify-center space-x-2 border border-rose-100 mb-6">
          <ShieldAlert className="h-6 w-6 shrink-0" />
          <span className="font-bold text-sm">ÉCHEC D'AUTHENTIFICATION</span>
        </div>
        <p className="text-slate-600 text-sm font-medium">{error}</p>
        <p className="text-slate-400 text-xs mt-2">Attention : Si vous avez scanné un QR Code officiel et que cette page apparaît, le document a probablement été falsifié.</p>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl flex items-center justify-center space-x-2 border border-emerald-100">
        <ShieldCheck className="h-6 w-6 shrink-0" />
        <span className="font-black text-sm uppercase tracking-wider">Document Authentique & Certifié</span>
      </div>

      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <FileText className="h-5 w-5 text-slate-400 mt-0.5" />
          <div>
            <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Type de Document</p>
            <p className="text-slate-800 font-bold capitalize">{result.typeDocument}</p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <FileText className="h-5 w-5 text-slate-400 mt-0.5" />
          <div>
            <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Numéro Unique</p>
            <p className="text-slate-800 font-black font-mono">{result.numeroUnique}</p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
          <div>
            <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Date de Génération</p>
            <p className="text-slate-800 font-semibold">{new Date(result.dateGeneration).toLocaleString("fr-FR")}</p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Building className="h-5 w-5 text-slate-400 mt-0.5" />
          <div>
            <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Établissement Émetteur</p>
            <p className="text-slate-800 font-extrabold">{result.schoolName}</p>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4 space-y-2">
          <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Empreinte Numérique (SHA256)</p>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 font-mono text-[10px] text-slate-500 break-all select-all">
            {result.hashSha256}
          </div>
        </div>
      </div>
    </div>
  )
}
