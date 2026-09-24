"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GraduationCap, Check, AlertCircle, Loader2 } from "lucide-react"
import { registerUser } from "@/lib/auth-actions"

const benefits = [
  "14 jours d'essai gratuit",
  "Aucune carte bancaire requise",
  "Accès à toutes les fonctionnalités",
  "Support prioritaire inclus",
]

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    }>
      <SignupFormContent />
    </Suspense>
  )
}

function SignupFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [isProvisioning, setIsProvisioning] = useState(false)

  useEffect(() => {
    const urlError = searchParams.get("error")
    if (urlError) {
      setError(urlError)
    }
  }, [searchParams])

  async function handleSubmit(formData: FormData) {
    setPending(true)
    setError(null)
    
    // Most signups will involve provisioning
    setIsProvisioning(true)
    
    const result = await registerUser(formData)
    
    if (result?.error) {
      setError(result.error)
      setPending(false)
      setIsProvisioning(false)
    } else if (result?.url) {
      router.push(result.url)
    }
  }

  const isLoading = pending || isProvisioning

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 relative overflow-hidden">
      {/* Loading Overlay */}
      {isProvisioning && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/90 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="relative">
            <div className="h-24 w-24 rounded-3xl bg-blue-600/10 flex items-center justify-center animate-pulse">
              <GraduationCap className="h-12 w-12 text-blue-600" />
            </div>
            <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-3xl animate-spin" />
          </div>
          <h2 className="mt-8 text-2xl font-black text-slate-900 tracking-tight">Préparation de votre base de données...</h2>
          <p className="mt-2 text-slate-500 font-medium animate-pulse text-sm">Ceci peut prendre jusqu'à 30 secondes pour configurer votre environnement isolé.</p>
          <div className="mt-8 w-64 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 animate-[shimmer_2s_infinite_linear]" style={{ width: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)', backgroundSize: '200% 100%' }} />
          </div>
        </div>
      )}

      {/* Left side - Image/Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-700 items-center justify-center p-12 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-96 w-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="max-w-lg relative z-10">
          <div className="flex mb-8">
            <div className="h-24 w-24 rounded-3xl bg-white/15 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-xl">
              <GraduationCap className="h-12 w-12 text-white" />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight leading-tight">
            Commencez votre essai gratuit
          </h2>
          <p className="text-blue-100/90 text-base leading-relaxed mb-8 font-medium">
            Découvrez comment MonÉcole+ peut transformer la gestion de votre établissement grâce aux fonctionnalités IA de pointe.
          </p>
          <ul className="space-y-4">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-3 text-white text-sm font-semibold">
                <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Check className="h-4 w-4" />
                </div>
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12 relative z-10">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Link href="/" className="flex items-center justify-center gap-3 mb-8 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900">
              MonÉcole<span className="text-blue-600 font-black">+</span>
            </span>
          </Link>
          
          <h1 className="text-2xl md:text-3xl font-black text-center text-slate-900 tracking-tight">
            Créez votre compte
          </h1>
          <p className="mt-2 text-center text-slate-500 text-sm font-medium">
            Commencez votre essai gratuit de 14 jours
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-3xl px-8 py-10 shadow-2xl shadow-blue-500/10">
            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-center gap-3 text-rose-600 text-xs font-bold animate-in fade-in">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            <form className="space-y-4" action={handleSubmit}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="firstName" className="block text-xs font-black uppercase text-slate-500 tracking-wider mb-1.5">
                    Prénom
                  </label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    placeholder="Jean"
                    className="rounded-2xl border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 text-slate-900 text-sm font-medium transition-all h-11"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-xs font-black uppercase text-slate-500 tracking-wider mb-1.5">
                    Nom
                  </label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    placeholder="Dupont"
                    className="rounded-2xl border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 text-slate-900 text-sm font-medium transition-all h-11"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="school" className="block text-xs font-black uppercase text-slate-500 tracking-wider mb-1.5">
                  Nom de l&apos;établissement
                </label>
                <Input
                  id="school"
                  name="school"
                  type="text"
                  required
                  placeholder="Lycée Victor Hugo"
                  className="rounded-2xl border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 text-slate-900 text-sm font-medium transition-all h-11"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-black uppercase text-slate-500 tracking-wider mb-1.5">
                  Adresse email professionnelle
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="vous@etablissement.fr"
                  className="rounded-2xl border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 text-slate-900 text-sm font-medium transition-all h-11"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-black uppercase text-slate-500 tracking-wider mb-1.5">
                  Mot de passe
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="Minimum 8 caractères"
                  className="rounded-2xl border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 text-slate-900 text-sm font-medium transition-all h-11"
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-xs font-black uppercase text-slate-500 tracking-wider mb-1.5">
                  Votre rôle
                </label>
                <select
                  id="role"
                  name="role"
                  className="w-full h-11 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 text-slate-900 text-sm font-medium transition-all px-3.5"
                  defaultValue="admin"
                >
                  <option value="admin">Administrateur / Directeur</option>
                  <option value="teacher">Enseignant</option>
                </select>
              </div>

              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="terms"
                  name="terms"
                  required
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="terms" className="text-xs text-slate-500 font-medium">
                  J&apos;accepte les{" "}
                  <Link href="#" className="font-bold text-blue-600 hover:underline">
                    conditions d&apos;utilisation
                  </Link>{" "}
                  et la{" "}
                  <Link href="#" className="font-bold text-blue-600 hover:underline">
                    politique de confidentialité
                  </Link>
                </label>
              </div>

              <Button type="submit" className="w-full h-12 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-[1.01] mt-2" disabled={isLoading}>
                {isLoading ? "Veuillez patienter..." : "Créer mon compte"}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200/80" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-slate-400 font-bold uppercase tracking-wider">ou</span>
                </div>
              </div>

              <div className="mt-6">
                <Button 
                  variant="outline" 
                  className="w-full h-12 border-slate-200/90 bg-white hover:bg-slate-50 font-bold text-xs text-slate-700 rounded-2xl shadow-sm hover:shadow transition-all" 
                  type="button"
                  onClick={() => window.location.href = '/api/auth/google?from=signup'}
                >
                  <svg className="h-5 w-5 mr-2 shrink-0" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continuer avec Google
                </Button>
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-slate-500 font-medium">
            Déjà un compte ?{" "}
            <Link href="/login" className="font-bold text-blue-600 hover:text-blue-700">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
