import Link from "next/link"
import { GraduationCap, ShieldCheck, CheckCircle2 } from "lucide-react"

const navigation = {
  product: [
    { name: "Fonctionnalités", href: "#features" },
    { name: "Avantages", href: "#benefits" },
    { name: "Témoignages", href: "#testimonials" },
    { name: "Tarifs", href: "/pricing" },
  ],
  company: [
    { name: "Connexion", href: "/login" },
    { name: "Créer une école", href: "/signup" },
    { name: "Demander une démo", href: "/demo" },
    { name: "Contact", href: "/contact" },
  ],
  legal: [
    { name: "Isolation DB Multi-Tenant", href: "#" },
    { name: "Confidentialité & Données", href: "#" },
    { name: "CGU MonÉcole+", href: "#" },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#090a0f] text-white">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 space-y-12">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8 space-y-8 xl:space-y-0">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-lg shadow-indigo-600/30">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                MonÉcole<span className="text-indigo-400">+</span>
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xs leading-relaxed">
              La plateforme SaaS de gestion scolaire propulsée par l&apos;IA avec isolation physique des bases de données par établissement.
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs font-mono text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Tous les services opérationnels (99.99%)</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 xl:col-span-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-4">Plateforme</h3>
              <ul className="space-y-3">
                {navigation.product.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-xs sm:text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-4">Accès Rapide</h3>
              <ul className="space-y-3">
                {navigation.company.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-xs sm:text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-4">Sécurité</h3>
              <ul className="space-y-3">
                {navigation.legal.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-xs sm:text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
                    >
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-mono">
          <p>&copy; {new Date().getFullYear()} MonÉcole+ SaaS. Tous droits réservés.</p>
          <p className="flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
            Plateforme IA de Gestion Scolaire Nouvelle Génération
          </p>
        </div>
      </div>
    </footer>
  )
}
