import { LandingHeader } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <LandingHeader />
      
      <main className="max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-24 grid gap-12 lg:grid-cols-2">
        {/* Contact Info */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Contactez Notre Équipe Commerciale
            </h1>
            <p className="text-sm sm:text-base text-[#a1a1aa] leading-relaxed">
              Une question sur nos tarifs, nos fonctionnalités, ou besoin d&apos;une démonstration physique ? Nous sommes à votre écoute.
            </p>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-[#a1a1aa]">
            <div className="flex items-center gap-4">
              <Mail className="h-5 w-5 text-indigo-400" />
              <span>contact@mon-ecole-plus.ci</span>
            </div>
            <div className="flex items-center gap-4">
              <Phone className="h-5 w-5 text-indigo-400" />
              <span>+225 07 00 00 00 00</span>
            </div>
            <div className="flex items-center gap-4">
              <MapPin className="h-5 w-5 text-indigo-400" />
              <span>Abidjan, Côte d&apos;Ivoire</span>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="p-8 rounded-2xl border border-[#27272a] bg-neutral-950/40 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-bold text-white uppercase tracking-wider">Prénom</label>
              <Input placeholder="Jean" className="bg-[#09090b] border-[#27272a] text-white h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-white uppercase tracking-wider">Nom</label>
              <Input placeholder="Koffi" className="bg-[#09090b] border-[#27272a] text-white h-11 rounded-xl" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-white uppercase tracking-wider">Nom de l&apos;établissement</label>
            <Input placeholder="Lycée Moderne..." className="bg-[#09090b] border-[#27272a] text-white h-11 rounded-xl" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-white uppercase tracking-wider">Adresse email</label>
            <Input placeholder="jean@exemple.com" className="bg-[#09090b] border-[#27272a] text-white h-11 rounded-xl" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-white uppercase tracking-wider">Message</label>
            <Textarea placeholder="Décrivez votre besoin..." className="bg-[#09090b] border-[#27272a] text-white rounded-xl min-h-[120px]" />
          </div>

          <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-12 rounded-xl">
            Envoyer ma demande
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  )
}
