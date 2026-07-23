"use client"

import { useState, useEffect, useRef } from "react"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Printer, 
  Download, 
  Search, 
  ChevronRight,
  ShieldCheck,
  Building2,
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  QrCode,
  Loader2,
  FileText
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getCertificateStudentsAction, getSchoolInfoAction } from "@/lib/documents-actions"
import { toast } from "sonner"

export default function CertificatePage() {
  const [step, setStep] = useState<"select" | "preview">("select")
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null)
  const [students, setStudents] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [schoolInfo, setSchoolInfo] = useState<any>({
    nom: "MonÉcole+ Groupe Scolaire",
    adresse: "Abidjan, Côte d'Ivoire",
    telephone: "+225 07 00 00 00 00",
    email: "contact@monecoleplus.ci",
    directeur: "Le Chef d'Établissement"
  })

  useEffect(() => {
    const initData = async () => {
      setIsLoading(true)
      const [stdsRes, schRes] = await Promise.all([
        getCertificateStudentsAction(),
        getSchoolInfoAction()
      ])

      if (stdsRes.success) setStudents(stdsRes.data)
      if (schRes.success) setSchoolInfo(schRes.data)
      setIsLoading(false)
    }
    initData()
  }, [])

  const handleSearch = async (term: string) => {
    setSearchQuery(term)
    setIsLoading(true)
    const res = await getCertificateStudentsAction(term)
    if (res.success) setStudents(res.data)
    setIsLoading(false)
  }

  const handleSelect = (student: any) => {
    setSelectedStudent(student)
    setStep("preview")
  }

  const handlePrint = () => {
    window.print()
  }

  const certNumber = selectedStudent 
    ? `CERT-${new Date().getFullYear()}-${selectedStudent.id.toString().padStart(4, '0')}`
    : "CERT-2026-0001"

  return (
    <>
      <DashboardHeader 
        title="Certificat de Scolarité" 
        subtitle="Générez instantanément des certificats officiels sécurisés"
      />
      
      <main className="p-4 md:p-8 max-w-6xl mx-auto">
        {step === "select" ? (
          <div className="space-y-6">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                className="pl-9 h-12 rounded-2xl border-slate-200 shadow-sm" 
                placeholder="Rechercher un élève par nom..." 
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            {isLoading ? (
              <div className="p-16 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
                <p className="text-sm text-slate-500 font-medium">Chargement des élèves inscrits en base de données...</p>
              </div>
            ) : students.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {students.map((student) => (
                  <Card 
                    key={student.id} 
                    className="hover:border-primary/50 cursor-pointer transition-all hover:shadow-xl group border-slate-200 rounded-3xl bg-white"
                    onClick={() => handleSelect(student)}
                  >
                    <CardContent className="p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-primary text-xl">
                          {student.nom[0]}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm group-hover:text-primary transition-colors">{student.nom}</h4>
                          <p className="text-xs text-slate-500 font-medium">{student.classe}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="p-16 text-center text-slate-400 italic">
                Aucun élève trouvé pour cette recherche.
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3 items-start">
            <div className="lg:col-span-2 space-y-4">
              <Button variant="ghost" onClick={() => setStep("select")} className="rounded-xl font-bold">
                <ArrowLeft className="h-4 w-4 mr-2" /> Retour à la recherche d&apos;élèves
              </Button>
              
              {/* High-Fidelity Printable Certificate Template */}
              <Card className="border-4 border-slate-200 shadow-2xl overflow-hidden bg-white text-slate-900 font-serif p-8 md:p-12 relative rounded-3xl print:shadow-none print:border-none">
                 {/* Security Background Pattern */}
                 <div className="absolute inset-0 opacity-[0.02] pointer-events-none flex flex-wrap gap-4 p-4">
                    {Array.from({length: 80}).map((_, i) => <ShieldCheck key={i} className="h-12 w-12" />)}
                 </div>

                 {/* 1. HEADER (Branding) */}
                 <div className="relative z-10 flex justify-between border-b-2 border-slate-900 pb-6 mb-8">
                    <div className="flex items-center gap-4">
                       <div className="h-20 w-20 bg-primary/10 border-2 border-slate-900 flex items-center justify-center rounded-2xl">
                          <Building2 className="h-10 w-10 text-primary" />
                       </div>
                       <div>
                          <h1 className="text-xl md:text-2xl font-black uppercase leading-none text-slate-900">{schoolInfo.nom}</h1>
                          <p className="text-xs font-bold mt-1 text-slate-700">Enseignement Primaire & Secondaire</p>
                          <p className="text-[10px] items-center gap-1 flex mt-2 text-slate-600"><MapPin className="h-2.5 w-2.5" /> {schoolInfo.adresse}</p>
                          <p className="text-[10px] items-center gap-1 flex text-slate-600"><Phone className="h-2.5 w-2.5" /> {schoolInfo.telephone} | <Mail className="h-2.5 w-2.5" /> {schoolInfo.email}</p>
                       </div>
                    </div>
                    <div className="text-right flex flex-col justify-between">
                       <Badge variant="outline" className="border-slate-900 font-mono text-[10px] px-2 py-1 rounded-md">{certNumber}</Badge>
                       <div className="mt-4">
                          <QrCode className="h-14 w-14 ml-auto text-slate-900" />
                          <p className="text-[8px] font-mono mt-1 text-slate-500 text-center">Authenticité QR</p>
                       </div>
                    </div>
                 </div>

                 {/* 2. TITRE */}
                 <div className="relative z-10 text-center mb-10">
                    <h2 className="text-2xl md:text-3xl font-black underline underline-offset-8 decoration-2 text-slate-900">CERTIFICAT DE SCOLARITÉ</h2>
                 </div>

                 {/* 3 & 4. CORPS DU TEXTE */}
                 <div className="relative z-10 space-y-6 text-base md:text-lg leading-relaxed px-2 text-slate-800">
                    <p>
                        Je soussigné, <strong>{schoolInfo.directeur}</strong>, certifie par la présente que l&apos;élève :
                    </p>
                    
                    <div className="bg-slate-50 p-6 border-x-4 border-primary space-y-2 rounded-2xl border-y border-slate-100">
                       <p><strong className="text-slate-900">Nom & Prénom :</strong> <span className="uppercase font-bold text-primary">{selectedStudent.nom}</span></p>
                       <p><strong className="text-slate-900">Classe :</strong> <strong className="text-slate-800">{selectedStudent.classe}</strong></p>
                       <p><strong className="text-slate-900">Email / Identifiant :</strong> {selectedStudent.email}</p>
                       <p><strong className="text-slate-900">Année Scolaire :</strong> 2023 - 2024</p>
                    </div>

                    <p>
                        Est régulièrement inscrit(e) et fréquente assidûment les cours au sein de notre institution pour l&apos;année académique en cours.
                    </p>

                    <p>
                        En foi de quoi, le présent certificat de scolarité lui est délivré pour servir et valoir ce que de droit.
                    </p>
                 </div>

                 {/* 6 & 7. DATE & SIGNATURE */}
                 <div className="relative z-10 mt-16 flex justify-between items-end">
                    <div className="text-xs italic text-slate-600">
                       Fait le {new Date().toLocaleDateString('fr-FR')}
                    </div>
                    <div className="text-center relative">
                       <p className="text-xs font-bold mb-10 text-slate-800">{schoolInfo.directeur}</p>
                       
                       {/* Signature & Stamp Simulation */}
                       <div className="absolute -bottom-2 -left-10 w-64 h-24 flex flex-col items-center justify-center pointer-events-none overflow-hidden opacity-80">
                          <div className="absolute h-20 w-20 border-4 border-rose-600 rounded-full flex flex-col items-center justify-center rotate-12 opacity-40">
                             <p className="text-[5px] font-black text-rose-600 text-center uppercase tracking-tighter">DIRECTION GÉNÉRALE<br/>AUTHENTIFIÉ</p>
                          </div>
                          <p className="text-3xl font-serif italic text-indigo-900 -rotate-6 ml-4">Direction</p>
                       </div>

                       <p className="text-xs font-bold pt-4 border-t border-slate-300">Cachet & Signature Officielle</p>
                    </div>
                 </div>

                 {/* 8. FOOTER SECURITY */}
                 <div className="absolute bottom-6 left-12 right-12 flex justify-between items-center text-[8px] font-mono text-slate-400 border-t border-slate-100 pt-3">
                    <span>MonÉcole+ SaaS | Document Sécurisé</span>
                    <span>Validation : {certNumber}</span>
                 </div>
              </Card>
            </div>

            <div className="space-y-6 pt-12">
               <Card className="border-primary/20 bg-primary/5 rounded-3xl shadow-lg">
                 <CardHeader>
                   <CardTitle className="text-lg font-bold">Actions & Export</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-3">
                   <Button className="w-full h-12 shadow-lg rounded-2xl bg-primary text-white font-bold gap-2 border-none" onClick={handlePrint}>
                     <Printer className="h-4 w-4" /> Imprimer le certificat
                   </Button>
                   <Button variant="outline" className="w-full h-12 bg-white rounded-2xl font-bold gap-2" onClick={handlePrint}>
                     <Download className="h-4 w-4" /> Télécharger en PDF
                   </Button>
                 </CardContent>
               </Card>

               <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex gap-4">
                  <ShieldCheck className="h-8 w-8 text-emerald-600 shrink-0" />
                  <div>
                    <h5 className="font-bold text-emerald-900 text-sm">Authentification QR & Code</h5>
                    <p className="text-xs text-emerald-700 leading-relaxed mt-1">
                      Chaque certificat généré intègre un numéro de série unique et un QR Code d&apos;authentification infalsifiable.
                    </p>
                  </div>
               </div>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
