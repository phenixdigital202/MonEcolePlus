"use client"

import { useState } from "react"
import Link from "next/link"
import { forgotPasswordAction } from "@/lib/auth-actions"
import { Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await forgotPasswordAction(email)
      if (res.error) {
        setError(res.error)
      } else {
        setSuccess(res.message || "Un lien de réinitialisation vous a été envoyé.")
        setEmail("")
      }
    } catch (err) {
      setError("Une erreur inattendue est survenue.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 space-y-6">
        <div className="space-y-2">
          <Link href="/login" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Retour à la connexion
          </Link>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 pt-2">Mot de passe oublié ?</h1>
          <p className="text-slate-500 text-sm">Entrez votre adresse email ci-dessous pour recevoir un lien sécurisé de réinitialisation.</p>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl border border-rose-100 text-sm font-semibold">
            {error}
          </div>
        )}

        {success ? (
          <div className="bg-emerald-50 text-emerald-700 p-6 rounded-2xl border border-emerald-100 text-center space-y-3">
            <CheckCircle className="h-10 w-10 text-emerald-600 mx-auto" />
            <p className="font-bold text-sm">{success}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Adresse email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-medium text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-blue-600/10 hover:shadow-blue-700/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>Envoyer le lien de réinitialisation</>
              )}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
