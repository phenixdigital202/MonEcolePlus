"use client"

import { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { resetPasswordAction } from "@/lib/auth-actions"
import { Lock, Eye, EyeOff, Loader2, CheckCircle } from "lucide-react"

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center space-y-4">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto" />
          <p className="text-slate-500 font-medium">Chargement du portail de sécurité...</p>
        </div>
      </main>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) {
      setError("Jeton de sécurité manquant.")
      return
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.")
      return
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await resetPasswordAction(token, password)
      if (res.error) {
        setError(res.error)
      } else {
        setSuccess(true)
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      }
    } catch (err) {
      setError("Une erreur inattendue est survenue.")
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center space-y-4">
          <p className="text-rose-600 font-bold">Lien de réinitialisation invalide.</p>
          <p className="text-slate-500 text-sm">Ce lien de sécurité est manquant ou altéré. Veuillez faire une nouvelle demande.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Définir un nouveau mot de passe</h1>
          <p className="text-slate-500 text-sm">Entrez votre nouveau mot de passe ci-dessous.</p>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl border border-rose-100 text-sm font-semibold">
            {error}
          </div>
        )}

        {success ? (
          <div className="bg-emerald-50 text-emerald-700 p-6 rounded-2xl border border-emerald-100 text-center space-y-3">
            <CheckCircle className="h-10 w-10 text-emerald-600 mx-auto animate-bounce" />
            <p className="font-bold text-sm">Mot de passe réinitialisé avec succès !</p>
            <p className="text-xs text-slate-500">Redirection vers la page de connexion...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Nouveau mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-12 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-medium text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Confirmer le mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-12 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-medium text-slate-800"
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
                <>Modifier mon mot de passe</>
              )}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
