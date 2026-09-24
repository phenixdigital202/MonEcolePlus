"use client"

import { useState } from "react"
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
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-indigo-50/40 to-white text-slate-900 pt-32 pb-24 lg:pt-40 lg:pb-36 border-b border-slate-200/80">
      {/* Background Micro Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none" />
      
      {/* Luminous Pastel Glowing Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-tr from-indigo-300/30 via-purple-300/30 to-blue-300/20 blur-[130px] pointer-events-none animate-pulse" />
      <div className="absolute top-1/3 left-10 h-[350px] w-[350px] rounded-full bg-blue-400/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 h-[400px] w-[400px] rounded-full bg-emerald-300/20 blur-[110px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        {/* Luminous AI Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-indigo-200 bg-white/90 backdrop-blur-md text-indigo-700 text-xs font-bold tracking-wider uppercase shadow-md shadow-indigo-500/5 animate-bounce mx-auto">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
          <span>MONÉCOLE+ IA 2.0 — LA RÉVOLUTION GESTION SCOLAIRE SAAS</span>
        </div>

        {/* Hero Title */}
        <h1 className="max-w-4xl mx-auto text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] text-slate-900">
          La plateforme <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">intelligente</span> qui métamorphose les écoles.
        </h1>

        {/* Subtitle */}
        <p className="max-w-3xl mx-auto text-base sm:text-xl text-slate-600 font-normal leading-relaxed">
          Gérez votre établissement scolaire avec une précision absolue : <strong className="text-slate-900">Bulletins automatisés</strong>, <strong className="text-slate-900">Alertes WhatsApp &amp; SMS</strong>, <strong className="text-slate-900">Certificats QR infalsifiables</strong> et <strong className="text-slate-900">Bases de données multi-tenant isolées</strong>.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-extrabold h-14 px-8 rounded-2xl shadow-xl shadow-indigo-600/25 transition-all hover:scale-105 border border-indigo-400/30">
            <Link href="/signup" className="flex items-center gap-2">
              <span>Créer mon établissement</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-slate-200 hover:bg-slate-100 text-slate-800 font-bold h-14 px-8 rounded-2xl bg-white shadow-md transition-all hover:scale-105">
            <Link href="/demo" className="flex items-center gap-2">
              <span>Demander une démonstration</span>
              <ChevronRight className="h-4 w-4 text-indigo-600" />
            </Link>
          </Button>
        </div>

        {/* Luminous Stats Counter Bar */}
        <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-center">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-md backdrop-blur-md">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center justify-center gap-1">
              <span>500+</span>
            </div>
            <div className="text-xs text-slate-500 font-bold mt-1">Établissements Actifs</div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-md backdrop-blur-md">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 flex items-center justify-center gap-1">
              <span>250K+</span>
            </div>
            <div className="text-xs text-slate-500 font-bold mt-1">Élèves &amp; Parents</div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-md backdrop-blur-md">
            <div className="text-2xl sm:text-3xl font-black text-indigo-600 flex items-center justify-center gap-1">
              <span>&lt; 1 sec</span>
            </div>
            <div className="text-xs text-slate-500 font-bold mt-1">Génération Bulletin</div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-md backdrop-blur-md">
            <div className="text-2xl sm:text-3xl font-black text-purple-600 flex items-center justify-center gap-1">
              <span>100%</span>
            </div>
            <div className="text-xs text-slate-500 font-bold mt-1">Isolé Multi-Tenant DB</div>
          </div>
        </div>

        {/* Dribbble Style Luminous Showcase Frame */}
        <div className="relative mt-12 max-w-5xl mx-auto">
          {/* Ambient Glow behind frame */}
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 opacity-40 blur-2xl pointer-events-none"></div>

          {/* Floating Glassmorphic Badges */}
          <div className="hidden lg:block absolute -top-8 -left-10 z-20 p-3.5 rounded-2xl bg-white/95 border border-slate-200 backdrop-blur-xl shadow-xl animate-float space-y-1 text-left">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500"></div>
              <span className="text-xs font-bold text-slate-900">Bulletin Trimestriel</span>
            </div>
            <p className="text-[11px] text-emerald-600 font-extrabold">Moyenne Générale : 16.4 / 20</p>
          </div>

          <div className="hidden lg:block absolute -top-6 -right-10 z-20 p-3.5 rounded-2xl bg-white/95 border border-slate-200 backdrop-blur-xl shadow-xl animate-float delay-2 space-y-1 text-left">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-xs font-bold text-slate-900">WhatsApp Cloud API</span>
            </div>
            <p className="text-[11px] text-slate-600 font-medium">Reçu scolarité envoyé aux parents</p>
          </div>

          <div className="hidden lg:block absolute -bottom-8 -left-8 z-20 p-3.5 rounded-2xl bg-white/95 border border-slate-200 backdrop-blur-xl shadow-xl animate-float delay-3 space-y-1 text-left">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
              <span className="text-xs font-bold text-slate-900">Isolation DB Physique</span>
            </div>
            <p className="text-[11px] text-indigo-600 font-bold">Master DB + Database par École</p>
          </div>

          <div className="hidden lg:block absolute -bottom-6 -right-8 z-20 p-3.5 rounded-2xl bg-white/95 border border-slate-200 backdrop-blur-xl shadow-xl animate-float delay-4 space-y-1 text-left">
            <div className="flex items-center gap-2">
              <QrCode className="h-3.5 w-3.5 text-purple-600" />
              <span className="text-xs font-bold text-slate-900">Certificat QR Securisé</span>
            </div>
            <p className="text-[11px] text-purple-600 font-bold">Validation anti-fraude instantanée</p>
          </div>

          {/* Main Luminous App Window Mockup */}
          <div className="relative rounded-3xl border-2 border-slate-200 bg-white shadow-2xl overflow-hidden text-left">
            {/* Window Browser Header */}
            <div className="h-12 border-b border-slate-200 bg-slate-100/80 flex items-center justify-between px-5">
              <div className="flex gap-2">
                <div className="h-3 w-3 rounded-full bg-rose-500" />
                <div className="h-3 w-3 rounded-full bg-amber-500" />
                <div className="h-3 w-3 rounded-full bg-emerald-500" />
              </div>
              
              <div className="flex items-center gap-2 px-4 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-mono shadow-inner">
                <Lock className="h-3 w-3 text-emerald-600" />
                <span>https://mon-ecole-plus.vercel.app/dashboard</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] text-emerald-700 font-extrabold uppercase tracking-wider hidden sm:inline">Connecté</span>
              </div>
            </div>

            {/* Interactive Tab Switcher */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
                <button
                  type="button"
                  onClick={() => setActiveTab("bulletin")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === "bulletin"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
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
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                      : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
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
                      ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                      : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
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
                      ? "bg-gradient-to-r from-pink-600 to-indigo-600 text-white shadow-md shadow-pink-600/30"
                      : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  <Brain className="h-4 w-4 text-pink-500" />
                  <span>Assistant IA</span>
                </button>
              </div>

              <span className="text-[11px] font-bold text-slate-500 hidden lg:inline">
                💡 Cliquez sur les onglets pour tester l&apos;interface interactive
              </span>
            </div>

            {/* Tab Display Screen */}
            <div className="p-6 bg-white min-h-[380px] flex flex-col justify-between text-slate-900">
              {activeTab === "bulletin" && (
                <div className="space-y-6 animate-fade-in-up">
                  <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center font-black text-indigo-700">
                        6A
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">Classe de 6ème A &bull; Trimestre 1</h4>
                        <p className="text-xs text-slate-500">Calcul automatique des moyennes et des rangs en temps réel</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                        24/24 Bulletins Validés
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <p className="text-xs text-slate-500 uppercase font-bold">Élève Rang #1</p>
                      <p className="text-lg font-black text-slate-900">KOUASSI Yao Marc</p>
                      <p className="text-sm font-bold text-emerald-600">18.90 / 20 (Félicitations)</p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <p className="text-xs text-slate-500 uppercase font-bold">Moyenne Générale Classe</p>
                      <p className="text-lg font-black text-slate-900">15.42 / 20</p>
                      <p className="text-xs text-indigo-600 font-bold">+1.2 vs Trimestre précédent</p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <p className="text-xs text-slate-500 uppercase font-bold">Taux de Réussite</p>
                      <p className="text-lg font-black text-slate-900">95.8%</p>
                      <p className="text-xs text-purple-600 font-bold">23 Élèves &ge; 10/20</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-indigo-600" />
                      <span className="text-xs font-bold text-slate-800">Génération du Bulletin PDF SaaS complet avec Cachet &amp; Signature Officielle</span>
                    </div>
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl h-8">
                      Télécharger PDF
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === "whatsapp" && (
                <div className="space-y-6 animate-fade-in-up">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
                    <MessageSquare className="h-6 w-6 text-emerald-600 shrink-0" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Meta WhatsApp Cloud API &bull; Canaux Officiels</h4>
                      <p className="text-xs text-slate-600">Alertes instantanées de paiement, notifications d&apos;absences et bulletins.</p>
                    </div>
                  </div>

                  <div className="space-y-3 max-w-lg mx-auto bg-slate-100 p-4 rounded-2xl border border-slate-200 font-sans">
                    <div className="bg-emerald-800 text-white p-3.5 rounded-2xl space-y-1 text-xs shadow-md">
                      <div className="flex justify-between items-center text-emerald-200 font-bold">
                        <span>📱 Notification WhatsApp Offcielle</span>
                        <span>14:32</span>
                      </div>
                      <p className="text-white leading-relaxed pt-1">
                        Bonjour M. KOUAMÉ. Nous confirmons la réception du règlement de scolarité de <strong className="text-emerald-200 underline">50 000 FCFA</strong> pour l&apos;élève KOUAMÉ Amenan. Votre reçu officiel PDF #REC-2026-0042 est disponible.
                      </p>
                      <div className="pt-2 flex items-center gap-1 text-[10px] text-emerald-200 font-mono">
                        <CheckCircle2 className="h-3 w-3" /> Reçu délivré &bull; MonÉcole+ SaaS
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "certificat" && (
                <div className="space-y-6 animate-fade-in-up">
                  <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <QrCode className="h-6 w-6 text-purple-600" />
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">Certificats de Scolarité Infalsifiables</h4>
                        <p className="text-xs text-slate-600">Chaque document officiel inclut un QR Code de validation en direct.</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold bg-purple-100 text-purple-800 px-3 py-1 rounded-full border border-purple-200">
                      Validation QR active
                    </span>
                  </div>

                  <div className="p-6 rounded-2xl bg-white text-slate-900 border-2 border-slate-200 font-serif space-y-4 max-w-md mx-auto shadow-xl">
                    <div className="flex justify-between items-start border-b pb-2">
                      <div className="text-xs font-black uppercase tracking-wider text-slate-900">GROUPE SCOLAIRE EXCELLENCE</div>
                      <Badge className="bg-slate-900 text-white text-[9px] font-mono">CERT-2026-0089</Badge>
                    </div>
                    <p className="text-xs italic text-slate-700">Certificat de Scolarité Officiel délivré pour valoir ce que de droit.</p>
                    <div className="flex justify-between items-end pt-2 border-t text-[10px]">
                      <span className="font-bold text-slate-800">Cachet &amp; Signature Officielle</span>
                      <div className="h-8 w-8 bg-slate-900 text-white rounded flex items-center justify-center font-mono font-bold text-[8px]">QR</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "ai" && (
                <div className="space-y-6 animate-fade-in-up">
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-50 via-indigo-50 to-purple-50 border border-pink-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-pink-600 animate-pulse" />
                        <h4 className="font-bold text-slate-900 text-sm">Assistant IA MonÉcole+ (Live Sandbox)</h4>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-800 border border-pink-200">
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
                          className="px-3 py-1 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold transition-all border border-slate-200 shadow-sm"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* AI Input & Output Box */}
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                      <span className="text-pink-600 font-bold text-xs">&gt; Prompt :</span>
                      <span className="text-xs text-slate-800 font-medium flex-1 truncate">{promptInput}</span>
                      <Send className="h-4 w-4 text-pink-600" />
                    </div>

                    <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-indigo-700">
                        <span>🤖 Réponse de l&apos;IA MonÉcole+ :</span>
                        {isSimulating && <span className="animate-pulse text-pink-600">Analyse en cours...</span>}
                      </div>
                      <p className="text-xs text-slate-900 leading-relaxed font-mono bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
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
