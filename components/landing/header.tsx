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
      <header className="fixed top-0 left-0 right-0 z-[50] bg-[#090a0f]/80 backdrop-blur-xl border-b border-white/10 text-white">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <div className="flex lg:flex-1">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-lg shadow-indigo-600/30 transition-transform group-hover:scale-110">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                MonÉcole<span className="text-indigo-400 font-black">+</span>
              </span>
            </Link>
          </div>
          
          <div className="flex lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-xl p-2.5 text-white hover:bg-white/10"
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
                className="text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>
          
          <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-3">
            <Button variant="ghost" asChild className="text-white hover:bg-white/10 hover:text-white font-bold text-xs">
              <Link href="/login">Se connecter</Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-600/30 border border-indigo-400/30">
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
        className="fixed inset-0 bg-black/80 backdrop-blur-md" 
        onClick={() => setOpen(false)} 
      />
      
      <div className="fixed inset-y-0 right-0 z-[10000] w-full overflow-y-auto bg-[#090a0f] border-l border-white/10 px-6 py-6 sm:max-w-sm text-white">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-white">
              MonÉcole<span className="text-indigo-400">+</span>
            </span>
          </Link>
          <button
            type="button"
            className="-m-2.5 rounded-xl p-2.5 text-slate-400 hover:bg-white/10 transition-colors"
            onClick={() => setOpen(false)}
          >
            <span className="sr-only">Fermer le menu</span>
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="mt-2 flow-root">
          <div className="-my-6 divide-y divide-white/10">
            <div className="space-y-1 py-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="-mx-3 block rounded-xl px-4 py-3 text-sm font-bold leading-7 text-slate-300 hover:bg-white/5 hover:text-white transition-all"
                  onClick={() => setOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            <div className="py-8 space-y-4">
              <Button variant="outline" className="w-full justify-center h-12 rounded-xl text-sm font-bold border-white/20 text-white hover:bg-white/10" asChild>
                <Link href="/login">Se connecter</Link>
              </Button>
              <Button className="w-full justify-center h-12 rounded-xl text-sm font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-600/30" asChild>
                <Link href="/signup">S&apos;inscrire gratuitement</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
