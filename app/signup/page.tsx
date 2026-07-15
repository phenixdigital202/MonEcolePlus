"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GraduationCap, Check, AlertCircle } from "lucide-react"
import { registerUser } from "@/lib/auth-actions"

const benefits = [
  "14 jours d'essai gratuit",
  "Aucune carte bancaire requise",
  "Accès à toutes les fonctionnalités",
  "Support prioritaire inclus",
]

export default function SignupPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [isProvisioning, setIsProvisioning] = useState(false)

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
    }
  }

  const isLoading = pending || isProvisioning

  return (
    <div className="min-h-screen flex relative">
      {/* Loading Overlay */}
      {isProvisioning && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/90 backdrop-blur-md animate-in fade-in duration-500">
          <div className="relative">
            <div className="h-24 w-24 rounded-2xl bg-primary/20 flex items-center justify-center animate-pulse">
              <GraduationCap className="h-12 w-12 text-primary" />
            </div>
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-2xl animate-spin" />
          </div>
          <h2 className="mt-8 text-2xl font-bold text-foreground">Préparation de votre base de données...</h2>
          <p className="mt-2 text-muted-foreground animate-pulse">Ceci peut prendre jusqu'à 30 secondes pour configurer votre environnement isolé.</p>
          <div className="mt-8 w-64 h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary animate-[shimmer_2s_infinite_linear]" style={{ width: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)', backgroundSize: '200% 100%' }} />
          </div>
        </div>
      )}

      {/* Left side - Image/Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-primary via-primary to-accent items-center justify-center p-12">
        <div className="max-w-lg">
          <div className="flex mb-8">
            <div className="h-20 w-20 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center">
              <GraduationCap className="h-10 w-10 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Commencez votre essai gratuit
          </h2>
          <p className="text-white/80 text-lg mb-8">
            Découvrez comment MonÉcole+ peut transformer la gestion de votre établissement.
          </p>
          <ul className="space-y-4">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-3 text-white">
                <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center">
                  <Check className="h-4 w-4" />
                </div>
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Link href="/" className="flex items-center justify-center gap-2 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-semibold text-foreground">
              MonÉcole<span className="text-primary">+</span>
            </span>
          </Link>
          
          <h1 className="text-2xl font-bold text-center text-foreground">
            Créez votre compte
          </h1>
          <p className="mt-2 text-center text-muted-foreground">
            Commencez votre essai gratuit de 14 jours
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-card border border-border rounded-xl px-8 py-10 shadow-sm">
            {error && (
              <div className="mb-6 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
            
            <form className="space-y-6" action={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-2">
                    Prénom
                  </label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    placeholder="Jean"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-2">
                    Nom
                  </label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    placeholder="Dupont"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="school" className="block text-sm font-medium text-foreground mb-2">
                  Nom de l&apos;établissement
                </label>
                <Input
                  id="school"
                  name="school"
                  type="text"
                  required
                  placeholder="Lycée Victor Hugo"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Adresse email professionnelle
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="vous@etablissement.fr"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                  Mot de passe
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="Minimum 8 caractères"
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-foreground mb-2">
                  Votre rôle
                </label>
                <select
                  id="role"
                  name="role"
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  defaultValue="admin"
                >
                  <option value="admin">Administrateur / Directeur</option>
                  <option value="teacher">Enseignant</option>
                </select>
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  name="terms"
                  required
                  className="mt-1 h-4 w-4 rounded border-input"
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground">
                  J&apos;accepte les{" "}
                  <Link href="#" className="text-primary hover:underline">
                    conditions d&apos;utilisation
                  </Link>{" "}
                  et la{" "}
                  <Link href="#" className="text-primary hover:underline">
                    politique de confidentialité
                  </Link>
                </label>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Veuillez patienter..." : "Créer mon compte"}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-card px-2 text-muted-foreground">ou</span>
                </div>
              </div>

              <div className="mt-6">
                <Button variant="outline" className="w-full" type="button">
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
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

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Déjà un compte ?{" "}
            <Link href="/login" className="font-medium text-primary hover:text-primary/80">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
