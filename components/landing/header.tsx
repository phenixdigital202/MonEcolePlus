"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GraduationCap, Menu, X, ArrowRight, Sparkles } from "lucide-react"

const navigation = [
  { name: "Fonctionnalités", href: "#features" },
  { name: "Avantages IA", href: "#benefits" },
  { name: "Témoignages", href: "#testimonials" },
  { name: "Tarifs", href: "/pricing" },
]

export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[50] bg-white/80 backdrop-blur-xl border-b border-slate-200/80 text-slate-900 shadow-sm">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <div className="flex lg:flex-1">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary via-indigo-600 to-purple-600 shadow-lg shadow-primary/25 transition-transform group-hover:scale-110">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight text-slate-900">
                MonÉcole<span className="text-primary font-black">+</span>
              </span>
            </Link>
          </div>
          
          <div className="flex lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-xl p-2.5 text-slate-700 hover:bg-slate-100"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Ouvrir le menu</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          
          <div className="hidden lg:flex lg:gap-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-primary transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>
          
          <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-3">
            <Button variant="ghost" asChild className="text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-bold text-xs">
              <Link href="/login">Se connecter</Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-primary/20">
              <Link href="/signup" className="flex items-center gap-1.5">
                <span>Créer mon école</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </nav>
      </header>

      <MobileMenu 
        open={mobileMenuOpen} 
        setOpen={setMobileMenuOpen} 
        navigation={navigation} 
      />
    </>
  )
}

function MobileMenu({ open, setOpen, navigation }: { open: boolean, setOpen: (open: boolean) => void, navigation: any[] }) {
  if (!open) return null

  return (
    <div className="lg:hidden fixed inset-0 z-[9999]">
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" 
        onClick={() => setOpen(false)} 
      />
      
      <div className="fixed inset-y-0 right-0 z-[10000] w-full overflow-y-auto bg-white border-l border-slate-200 px-6 py-6 sm:max-w-sm text-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-indigo-600">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">
              MonÉcole<span className="text-primary">+</span>
            </span>
          </Link>
          <button
            type="button"
            className="-m-2.5 rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 transition-colors"
            onClick={() => setOpen(false)}
          >
            <span className="sr-only">Fermer le menu</span>
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="mt-2 flow-root">
          <div className="-my-6 divide-y divide-slate-100">
            <div className="space-y-1 py-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="-mx-3 block rounded-xl px-4 py-3 text-sm font-bold leading-7 text-slate-700 hover:bg-primary/5 hover:text-primary transition-all"
                  onClick={() => setOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            <div className="py-8 space-y-4">
              <Button variant="outline" className="w-full justify-center h-12 rounded-xl text-sm font-bold border-slate-200 text-slate-800 hover:bg-slate-50" asChild>
                <Link href="/login">Se connecter</Link>
              </Button>
              <Button className="w-full justify-center h-12 rounded-xl text-sm font-extrabold bg-gradient-to-r from-primary to-indigo-600 text-white shadow-xl shadow-primary/20" asChild>
                <Link href="/signup">S&apos;inscrire gratuitement</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
