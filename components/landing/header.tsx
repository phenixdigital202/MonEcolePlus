"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GraduationCap, Menu, X } from "lucide-react"

const navigation = [
  { name: "Fonctionnalités", href: "#features" },
  { name: "Avantages", href: "#benefits" },
  { name: "Témoignages", href: "#testimonials" },
  { name: "Tarifs", href: "/pricing" },
]

export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[40] bg-background/80 backdrop-blur-md border-b border-border">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <div className="flex lg:flex-1">
            <Link href="/" className="flex items-center gap-2 -m-1.5 p-1.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold text-foreground">
                MonÉcole<span className="text-primary">+</span>
              </span>
            </Link>
          </div>
          
          <div className="flex lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-foreground"
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
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>
          
          <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Connexion</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Commencer gratuitement</Link>
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
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={() => setOpen(false)} 
      />
      
      {/* Menu panel */}
      <div className="fixed inset-y-0 right-0 z-[10000] w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <Link href="/" className="flex items-center gap-2 -m-1.5 p-1.5" onClick={() => setOpen(false)}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-slate-900">
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
                  className="-mx-3 block rounded-xl px-4 py-3 text-base font-semibold leading-7 text-slate-900 hover:bg-primary/5 hover:text-primary transition-all"
                  onClick={() => setOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            <div className="py-8 space-y-4">
              <Button variant="outline" className="w-full justify-center h-12 rounded-xl text-base" asChild>
                <Link href="/login">Se connecter</Link>
              </Button>
              <Button className="w-full justify-center h-12 rounded-xl text-base shadow-lg shadow-primary/20" asChild>
                <Link href="/signup">S&apos;inscrire gratuitement</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
