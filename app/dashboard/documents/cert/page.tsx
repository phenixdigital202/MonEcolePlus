"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Plus, 
  FileText, 
  Printer, 
  Download, 
  Search, 
  ChevronRight,
  GraduationCap,
  CheckCircle2,
  QrCode,
  ShieldCheck,
  Building2,
  ArrowLeft,
  MapPin,
  Phone,
  Mail
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function CertificatePage() {
  const [step, setStep] = useState<"select" | "preview">("select")
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null)

  const students = [
    { id: 1, nom: "Abou Traore", dob: "12/05/2010", pob: "Conakry", classe: "3ème A", gender: "Masculin" },
    { id: 2, nom: "Fatou Diallo", dob: "22/08/2011", pob: "Boké", classe: "4ème B", gender: "Féminin" },
    { id: 3, nom: "Moussa Sylla", dob: "05/01/2009", pob: "Kankan", classe: "Terminal C", gender: "Masculin" },
  ]

  const handleSelect = (student: any) => {
    setSelectedStudent(student)
    setStep("preview")
  }

  return (
    <>
      <DashboardHeader 
        title="Certificat de Scolarité" 
        subtitle="Générez instantanément des certificats officiels sécurisés"
      />
      
      <main className="p-6 max-w-6xl mx-auto">
        {step === "select" ? (
          <div className="space-y-6">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9 h-12" placeholder="Rechercher un élève par nom..." />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {students.map((student) => (
                <Card 
                  key={student.id} 
                  className="hover:border-primary/50 cursor-pointer transition-all hover:shadow-lg group"
                  onClick={() => handleSelect(student)}
                >
                  <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xl">
                        {student.nom[0]}
                      </div>
                      <div>
                        <h4 className="font-bold">{student.nom}</h4>
                        <p className="text-xs text-muted-foreground">{student.classe}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3 items-start">
            <div className="lg:col-span-2">
              <Button variant="ghost" onClick={() => setStep("select")} className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" /> Retour à la sélection
              </Button>
              
              {/* High-Fidelity Certificate Template */}
              <Card className="border-4 border-muted/50 shadow-2xl overflow-hidden bg-white text-black font-serif aspect-[1/1.414] p-12 relative">
                 {/* Security Background Pattern Placeholder */}
                 <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex flex-wrap gap-4 p-4">
                    {Array.from({length: 100}).map((_, i) => <ShieldCheck key={i} className="h-12 w-12" />)}
                 </div>

                 {/* 1. HEADER (Branding) */}
                 <div className="relative z-10 flex justify-between border-b-2 border-black pb-6 mb-8">
                    <div className="flex items-center gap-4">
                       <div className="h-20 w-20 bg-primary/10 border-2 border-black flex items-center justify-center">
                          <Building2 className="h-10 w-10 text-primary" />
                       </div>
                       <div>
                          <h1 className="text-2xl font-black uppercase leading-none">Groupe Scolaire Excellence</h1>
                          <p className="text-sm font-bold mt-1 text-gray-700">Enseignement Primaire & Secondaire</p>
                          <p className="text-[10px] items-center gap-1 flex mt-2"><MapPin className="h-2 w-2" /> Quartier Residentiel, BP 450, Conakry</p>
                          <p className="text-[10px] items-center gap-1 flex"><Phone className="h-2 w-2" /> +224 620 00 00 00 | <Mail className="h-2 w-2" /> contact@excellence.gn</p>
                       </div>
                    </div>
                    <div className="text-right flex flex-col justify-between">
                       <Badge variant="outline" className="border-black font-mono text-[10px] px-2 py-1">CERT-2026-X892</Badge>
                       <div className="mt-4">
                          <QrCode className="h-14 w-14 ml-auto" />
                          <p className="text-[8px] font-mono mt-1 text-gray-500 text-center">Vérifier l'authenticité</p>
                       </div>
                    </div>
                 </div>

                 {/* 2. TITRE */}
                 <div className="relative z-10 text-center mb-12">
                    <h2 className="text-3xl font-black underline underline-offset-8 decoration-2">CERTIFICAT DE SCOLARITÉ</h2>
                 </div>

                 {/* 3 & 4. CORPS DU TEXTE */}
                 <div className="relative z-10 space-y-6 text-lg leading-loose px-4">
                    <p>
                        Je soussigné, <strong>Monsieur Ibrahim Diallo</strong>, Directeur de l'établissement susnommé, certifie par la présente que l'élève :
                    </p>
                    
                    <div className="bg-gray-50/50 p-6 border-x-4 border-primary/20 space-y-2 rounded-xl">
                       <p><strong>Nom et Prénom :</strong> <span className="uppercase">{selectedStudent.nom}</span></p>
                       <p><strong>Né(e) le :</strong> {selectedStudent.dob} à {selectedStudent.pob}</p>
                       <p><strong>Sexe :</strong> {selectedStudent.gender}</p>
                       <p><strong>Classe :</strong> {selectedStudent.classe}</p>
                       <p><strong>Année Scolaire :</strong> 2025 - 2026</p>
                    </div>

                    <p>
                        Est régulièrement inscrit(e) et fréquente assidûment les cours au sein de notre institution pour la période académique mentionnée ci-dessus.
                    </p>

                    <p>
                        En foi de quoi, ce certificat lui est délivré pour servir et valoir ce que de droit.
                    </p>
                 </div>

                 {/* 6 & 7. DATE & SIGNATURE */}
                 <div className="relative z-10 mt-20 flex justify-between items-end">
                    <div className="text-sm italic">
                       Fait à Conakry, le {new Date().toLocaleDateString('fr-FR')}
                    </div>
                    <div className="text-center relative">
                       <p className="text-sm font-bold mb-12">Le Directeur</p>
                       
                       {/* Stylized Text Signature Simulation */}
                       <div className="absolute -bottom-2 -left-10 w-64 h-24 flex flex-col items-center justify-center pointer-events-none overflow-hidden opacity-80">
                          {/* Cachet (Stamp) Simulation */}
                          <div className="absolute h-24 w-24 border-4 border-red-600 rounded-full flex flex-col items-center justify-center rotate-12 opacity-40">
                             <p className="text-[6px] font-bold text-red-600 text-center uppercase tracking-tighter">DIRECTION GÉNÉRALE<br/>ECOLE EXCELLENCE<br/>CONAKRY</p>
                          </div>
                          {/* Signature Text */}
                          <p className="text-4xl font-serif italic text-blue-900 -rotate-6 ml-4">I. Diallo</p>
                       </div>

                       <p className="text-sm font-bold pt-4 border-t border-black/10">Ibrahim Diallo</p>
                    </div>
                 </div>

                 {/* 8. FOOTER SECURITY */}
                 <div className="absolute bottom-8 left-12 right-12 flex justify-between items-center text-[8px] font-mono text-gray-400 border-t border-gray-100 pt-4">
                    <span>Généré par MonÉcole+ SaaS | mon-ecole-plus.com</span>
                    <span>ID de validation : {Math.random().toString(36).substring(7).toUpperCase()}</span>
                 </div>
              </Card>
            </div>

            <div className="space-y-6 pt-12">
               <Card className="border-primary/20 bg-primary/5">
                 <CardHeader>
                   <CardTitle className="text-lg">Actions Rapides</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-3">
                   <Button className="w-full h-12 shadow-lg">
                     <Printer className="h-4 w-4 mr-2" /> Imprimer le certificat
                   </Button>
                   <Button variant="outline" className="w-full h-12 bg-white">
                     <Download className="h-4 w-4 mr-2" /> Télécharger en PDF
                   </Button>
                   <Button variant="ghost" className="w-full hover:text-primary">
                     <FileText className="h-4 w-4 mr-2" /> Historique documentaire
                   </Button>
                 </CardContent>
               </Card>

               <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex gap-4">
                  <ShieldCheck className="h-8 w-8 text-emerald-600 shrink-0" />
                  <div>
                    <h5 className="font-bold text-emerald-900 text-sm">Authentification QR</h5>
                    <p className="text-xs text-emerald-700 leading-relaxed mt-1">
                      Le code QR présent sur ce document permet au destinataire de vérifier instantanément sa validité sur notre portail SaaS.
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
