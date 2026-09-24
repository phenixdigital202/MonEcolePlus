"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  GraduationCap, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  MessageSquare,
  FileText,
  QrCode,
  CheckCircle2,
  Brain,
  Zap,
  TrendingUp,
  Award,
  Lock,
  ChevronRight,
  Send,
  Building2,
  BarChart3,
  Users
} from "lucide-react"

export function HeroSection() {
  const [activeTab, setActiveTab] = useState<"bulletin" | "whatsapp" | "certificat" | "ai">("bulletin")
  const [promptInput, setPromptInput] = useState("Générer la synthèse des notes et rangs de la classe de 6ème A")
  const [aiOutput, setAiOutput] = useState("Moyenne générale de la classe : 15.8/20 (Premier : KOUASSI Yao, 18.9/20). 23/24 élèves ont validé le trimestre.")
  const [isSimulating, setIsSimulating] = useState(false)

  // Interactive AI prompts for live demo
  const samplePrompts = [
    { label: "📊 Bulletins 6e A", prompt: "Générer la synthèse des notes et rangs de la classe de 6ème A", output: "Moyenne générale de la 6ème A : 15.8/20. Rang #1 : KOUASSI Yao (18.9/20). 23/24 élèves ont validé." },
    { label: "📱 Alerte WhatsApp", prompt: "Envoyer l'alerte de paiement WhatsApp pour l'élève DIALLO Mamadou", output: "Notification WhatsApp envoyée avec succès au +225 07 88 99 00. Reçu PDF #REC-2026-089 attaché." },
    { label: "📜 Certificat QR", prompt: "Vérifier l'authenticité du Certificat CERT-2026-0042", output: "Certificat AUTHENTIQUE et VALIDE. Délivré par le Lycée Excellence Abidjan pour KOUAMÉ Amenan." },
    { label: "🤖 Décrochage IA", prompt: "Analyser les élèves à risque d'absence ou d'échec ce mois-ci", output: "Analyse terminée : 2 élèves nécessitent un soutien ciblé en Mathématiques avant la composition." }
  ]

  const handleSelectPrompt = (item: typeof samplePrompts[0]) => {
    setIsSimulating(true)
    setPromptInput(item.prompt)
    setTimeout(() => {
      setAiOutput(item.output)
      setIsSimulating(false)
    }, 400)
  }

  return (
    <section className="relative overflow-hidden bg-[#090a0f] text-white pt-32 pb-24 lg:pt-40 lg:pb-36 border-b border-white/10 selection:bg-indigo-500 selection:text-white">
      {/* Background Gradients & Animated Mesh */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none" />
      
      {/* Glowing Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[750px] rounded-full bg-gradient-to-tr from-indigo-600/20 via-purple-600/20 to-pink-500/10 blur-[130px] pointer-events-none animate-pulse" />
      <div className="absolute top-1/3 left-10 h-[300px] w-[300px] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 h-[350px] w-[350px] rounded-full bg-emerald-500/10 blur-[110px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        {/* Animated AI Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-indigo-500/40 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-indigo-500/20 backdrop-blur-md text-indigo-300 text-xs font-bold tracking-wider uppercase shadow-lg shadow-indigo-500/10 animate-bounce mx-auto">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          <span>MONÉCOLE+ IA 2.0 — LA RÉVOLUTION GESTION SCOLAIRE SAAS</span>
        </div>

        {/* Hero Title */}
        <h1 className="max-w-4xl mx-auto text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] text-white">
          La plateforme <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">intelligente</span> qui métamorphose les écoles.
        </h1>

        {/* Subtitle */}
        <p className="max-w-3xl mx-auto text-base sm:text-xl text-slate-300 font-normal leading-relaxed">
          Gérez votre établissement scolaire avec une précision absolue : <strong className="text-white">Bulletins automatisés</strong>, <strong className="text-white">Alertes WhatsApp &amp; SMS</strong>, <strong className="text-white">Certificats QR infalsifiables</strong> et <strong className="text-white">Bases de données multi-tenant physiques dédiées</strong>.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Button asChild size="lg" className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold h-14 px-8 rounded-2xl shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 border border-indigo-400/30">
            <Link href="/signup" className="flex items-center gap-2">
              <span>Créer mon établissement</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-white/15 hover:bg-white/10 text-white font-bold h-14 px-8 rounded-2xl bg-white/5 backdrop-blur-md transition-all hover:scale-105">
            <Link href="/demo" className="flex items-center gap-2">
              <span>Demander une démonstration</span>
              <ChevronRight className="h-4 w-4 text-indigo-400" />
            </Link>
          </Button>
        </div>

        {/* Live Metrics Counter Bar */}
        <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-center">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="text-2xl sm:text-3xl font-black text-white flex items-center justify-center gap-1">
              <span>500+</span>
            </div>
            <div className="text-xs text-slate-400 font-medium mt-1">Établissements Actifs</div>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 flex items-center justify-center gap-1">
              <span>250K+</span>
            </div>
            <div className="text-xs text-slate-400 font-medium mt-1">Élèves &amp; Parents</div>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="text-2xl sm:text-3xl font-black text-indigo-400 flex items-center justify-center gap-1">
              <span>&lt; 1 sec</span>
            </div>
            <div className="text-xs text-slate-400 font-medium mt-1">Génération Bulletin</div>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="text-2xl sm:text-3xl font-black text-purple-400 flex items-center justify-center gap-1">
              <span>100%</span>
            </div>
            <div className="text-xs text-slate-400 font-medium mt-1">Isolé Multi-Tenant DB</div>
          </div>
        </div>

        {/* Dribbble Style Interactive Showcase Frame */}
        <div className="relative mt-12 max-w-5xl mx-auto">
          {/* Ambient Glow behind frame */}
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-30 blur-2xl pointer-events-none"></div>

          {/* Floating Glassmorphic Badges */}
          <div className="hidden lg:block absolute -top-8 -left-10 z-20 p-3.5 rounded-2xl bg-slate-900/90 border border-white/15 backdrop-blur-xl shadow-2xl animate-float space-y-1 text-left">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
              <span className="text-xs font-bold text-white">Bulletin Trimestriel</span>
            </div>
            <p className="text-[11px] text-emerald-400 font-extrabold">Moyenne Générale : 16.4 / 20</p>
          </div>

          <div className="hidden lg:block absolute -top-6 -right-10 z-20 p-3.5 rounded-2xl bg-slate-900/90 border border-white/15 backdrop-blur-xl shadow-2xl animate-float delay-2 space-y-1 text-left">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-xs font-bold text-white">WhatsApp Cloud API</span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium">Reçu scolarité envoyé aux parents</p>
          </div>

          <div className="hidden lg:block absolute -bottom-8 -left-8 z-20 p-3.5 rounded-2xl bg-slate-900/90 border border-white/15 backdrop-blur-xl shadow-2xl animate-float delay-3 space-y-1 text-left">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
              <span className="text-xs font-bold text-white">Isolation DB Physique</span>
            </div>
            <p className="text-[11px] text-indigo-300 font-medium">Master DB + Database par École</p>
          </div>

          <div className="hidden lg:block absolute -bottom-6 -right-8 z-20 p-3.5 rounded-2xl bg-slate-900/90 border border-white/15 backdrop-blur-xl shadow-2xl animate-float delay-4 space-y-1 text-left">
            <div className="flex items-center gap-2">
              <QrCode className="h-3.5 w-3.5 text-purple-400" />
              <span className="text-xs font-bold text-white">Certificat QR Securisé</span>
            </div>
            <p className="text-[11px] text-purple-300 font-medium">Validation anti-fraude instantanée</p>
          </div>

          {/* Main App Window Mockup */}
          <div className="relative rounded-3xl border border-white/15 bg-slate-950/80 shadow-2xl backdrop-blur-xl overflow-hidden text-left">
            {/* Window Browser Header */}
            <div className="h-12 border-b border-white/10 bg-slate-900/90 flex items-center justify-between px-5">
              <div className="flex gap-2">
                <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
              </div>
              
              <div className="flex items-center gap-2 px-4 py-1 rounded-lg bg-slate-950 border border-white/10 text-slate-300 text-xs font-mono">
                <Lock className="h-3 w-3 text-emerald-400" />
                <span>https://mon-ecole-plus.vercel.app/dashboard</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider hidden sm:inline">Connecté</span>
              </div>
            </div>

            {/* Interactive Tab Switcher */}
            <div className="p-4 bg-slate-900/40 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
                <button
                  type="button"
                  onClick={() => setActiveTab("bulletin")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === "bulletin"
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                      : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  <span>Bulletins &amp; Notes</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("whatsapp")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === "whatsapp"
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                      : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>WhatsApp Cloud API</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("certificat")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === "certificat"
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                      : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <QrCode className="h-4 w-4" />
                  <span>Certificats QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("ai")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === "ai"
                      ? "bg-gradient-to-r from-pink-600 to-indigo-600 text-white shadow-lg shadow-pink-600/30"
                      : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Brain className="h-4 w-4 text-pink-400" />
                  <span>Assistant IA</span>
                </button>
              </div>

              <span className="text-[11px] font-bold text-slate-400 hidden lg:inline">
                💡 Cliquez sur les onglets pour tester l&apos;interface interactive
              </span>
            </div>

            {/* Tab Display Screen */}
            <div className="p-6 bg-[#090b10] min-h-[380px] flex flex-col justify-between">
              {activeTab === "bulletin" && (
                <div className="space-y-6 animate-fade-in-up">
                  <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-400">
                        6A
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">Classe de 6ème A &bull; Trimestre 1</h4>
                        <p className="text-xs text-slate-400">Calcul automatique des moyennes et des rangs en temps réel</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                        24/24 Bulletins Validés
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 space-y-1">
                      <p className="text-xs text-slate-400 uppercase font-bold">Élève Rang #1</p>
                      <p className="text-lg font-black text-white">KOUASSI Yao Marc</p>
                      <p className="text-sm font-bold text-emerald-400">18.90 / 20 (Félicitations)</p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 space-y-1">
                      <p className="text-xs text-slate-400 uppercase font-bold">Moyenne Générale Classe</p>
                      <p className="text-lg font-black text-white">15.42 / 20</p>
                      <p className="text-xs text-indigo-400 font-medium">+1.2 vs Trimestre précédent</p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 space-y-1">
                      <p className="text-xs text-slate-400 uppercase font-bold">Taux de Réussite</p>
                      <p className="text-lg font-black text-white">95.8%</p>
                      <p className="text-xs text-purple-400 font-medium">23 Élèves &ge; 10/20</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-indigo-400" />
                      <span className="text-xs font-bold text-slate-200">Génération du Bulletin PDF SaaS complet avec Cachet &amp; Signature Officielle</span>
                    </div>
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-xs font-bold rounded-xl h-8">
                      Télécharger PDF
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === "whatsapp" && (
                <div className="space-y-6 animate-fade-in-up">
                  <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-center gap-3">
                    <MessageSquare className="h-6 w-6 text-emerald-400 shrink-0" />
                    <div>
                      <h4 className="font-bold text-white text-sm">Meta WhatsApp Cloud API &bull; Canaux Officiels</h4>
                      <p className="text-xs text-slate-300">Alertes instantanées de paiement, notifications d&apos;absences et bulletins.</p>
                    </div>
                  </div>

                  <div className="space-y-3 max-w-lg mx-auto bg-slate-900 p-4 rounded-2xl border border-white/10 font-sans">
                    <div className="bg-emerald-950/80 border border-emerald-500/30 p-3 rounded-2xl space-y-1 text-xs">
                      <div className="flex justify-between items-center text-emerald-400 font-bold">
                        <span>📱 Notification WhatsApp Offcielle</span>
                        <span>14:32</span>
                      </div>
                      <p className="text-white leading-relaxed">
                        Bonjour M. KOUAMÉ. Nous confirmons la réception du règlement de scolarité de <strong className="text-emerald-300">50 000 FCFA</strong> pour l&apos;élève KOUAMÉ Amenan. Votre reçu officiel PDF #REC-2026-0042 est disponible.
                      </p>
                      <div className="pt-1 flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                        <CheckCircle2 className="h-3 w-3" /> Reçu délivré &bull; MonÉcole+ SaaS
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "certificat" && (
                <div className="space-y-6 animate-fade-in-up">
                  <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <QrCode className="h-6 w-6 text-purple-400" />
                      <div>
                        <h4 className="font-bold text-white text-sm">Certificats de Scolarité Infalsifiables</h4>
                        <p className="text-xs text-slate-300">Chaque document officiel inclut un QR Code de validation en direct.</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full border border-purple-500/30">
                      Validation QR active
                    </span>
                  </div>

                  <div className="p-6 rounded-2xl bg-white text-slate-900 border border-slate-200 font-serif space-y-4 max-w-md mx-auto shadow-xl">
                    <div className="flex justify-between items-start border-b pb-2">
                      <div className="text-xs font-black uppercase tracking-wider">GROUPE SCOLAIRE EXCELLENCE</div>
                      <Badge className="bg-slate-900 text-white text-[9px] font-mono">CERT-2026-0089</Badge>
                    </div>
                    <p className="text-xs italic text-slate-700">Certificat de Scolarité Officiel délivré pour valoir ce que de droit.</p>
                    <div className="flex justify-between items-end pt-2 border-t text-[10px]">
                      <span className="font-bold">Cachet &amp; Signature Officielle</span>
                      <div className="h-8 w-8 bg-slate-900 text-white rounded flex items-center justify-center font-mono font-bold text-[8px]">QR</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "ai" && (
                <div className="space-y-6 animate-fade-in-up">
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-950/30 via-indigo-950/30 to-purple-950/30 border border-pink-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-pink-400 animate-pulse" />
                        <h4 className="font-bold text-white text-sm">Assistant IA MonÉcole+ (Live Sandbox)</h4>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                        IA Générative Scolaire
                      </span>
                    </div>

                    {/* Prompts quick list */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {samplePrompts.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectPrompt(item)}
                          className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/10"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* AI Input & Output Box */}
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-slate-900 border border-white/15 flex items-center gap-2">
                      <span className="text-pink-400 font-bold text-xs">&gt; Prompt :</span>
                      <span className="text-xs text-white font-medium flex-1 truncate">{promptInput}</span>
                      <Send className="h-4 w-4 text-pink-400" />
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-900/80 border border-indigo-500/30 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-indigo-400">
                        <span>🤖 Réponse de l&apos;IA MonÉcole+ :</span>
                        {isSimulating && <span className="animate-pulse text-pink-400">Analyse en cours...</span>}
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed font-mono bg-slate-950/60 p-3 rounded-xl border border-white/5">
                        {aiOutput}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${className}`}>
      {children}
    </span>
  )
}
