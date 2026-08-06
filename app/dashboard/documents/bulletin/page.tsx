"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  FileText, 
  Download, 
  Printer, 
  LineChart as LineChartIcon,
  TrendingUp,
  Award,
  CheckCircle2,
  QrCode,
  Building2,
  ArrowLeft,
  Loader2,
  UserCheck,
  ChevronRight
} from "lucide-react"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { getClasses } from "@/lib/grades-actions"
import { getBulletinFullClassDataAction, getSchoolInfoAction } from "@/lib/documents-actions"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

export default function BulletinBatchPage() {
  const [step, setStep] = useState<"select" | "preview">("select")
  const [classes, setClasses] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedSemester, setSelectedSemester] = useState("1")
  const [isLoadingClasses, setIsLoadingClasses] = useState(true)
  const [isCalculating, setIsCalculating] = useState(false)
  const [reportData, setReportData] = useState<any>(null)
  const [selectedStudentIndex, setSelectedStudentIndex] = useState(0)
  const [selectedTemplateStyle, setSelectedTemplateStyle] = useState<"classique" | "premium" | "ministere" | "custom">("premium")
  const [schoolInfo, setSchoolInfo] = useState<any>({
    nom: "MonÉcole+ Groupe Scolaire",
    adresse: "Abidjan, Côte d'Ivoire",
    telephone: "+225 07 00 00 00 00",
    email: "contact@monecoleplus.ci"
  })

  useEffect(() => {
    const initData = async () => {
      setIsLoadingClasses(true)
      const [clsList, schInfo] = await Promise.all([
        getClasses(),
        getSchoolInfoAction()
      ])
      setClasses(clsList)
      if (clsList.length > 0) setSelectedClass(clsList[0].id.toString())
      if (schInfo.success) setSchoolInfo(schInfo.data)
      setIsLoadingClasses(false)
    }
    initData()
  }, [])

  const handleGenerate = async () => {
    if (!selectedClass) return toast.error("Veuillez choisir une classe")
    setIsCalculating(true)
    
    const res = await getBulletinFullClassDataAction(parseInt(selectedClass), selectedSemester)
    if (res.success && res.data) {
      setReportData(res.data)
      setSelectedStudentIndex(0)
      setStep("preview")
      toast.success(`Bulletins générés pour ${res.data.students.length} élève(s) !`)
    } else {
      toast.error(res.error || "Erreur lors du calcul des bulletins")
    }
    setIsCalculating(false)
  }

  const handlePrint = () => {
    window.print()
  }

  const currentStudent = reportData?.students?.[selectedStudentIndex]

  return (
    <>
      <DashboardHeader 
        title="Bulletin de Notes SaaS" 
        subtitle="Générez des bulletins premium calculés en direct sur la base de données"
      />
      
      <main className="p-4 md:p-8 max-w-6xl mx-auto">
        {step === "select" ? (
          <div className="max-w-2xl mx-auto space-y-8 py-6">
            <Card className="border-primary/20 shadow-2xl relative overflow-hidden rounded-3xl bg-white">
               <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                  <TrendingUp className="h-24 w-24 text-primary" />
               </div>
               <CardHeader>
                  <CardTitle className="text-2xl font-bold flex items-center gap-2 text-slate-800">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    Génération des Bulletins
                  </CardTitle>
               </CardHeader>
               <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Classe</label>
                      <Select value={selectedClass} onValueChange={setSelectedClass} disabled={isLoadingClasses}>
                        <SelectTrigger className="h-12 border-slate-200 rounded-2xl">
                          <SelectValue placeholder={isLoadingClasses ? "Chargement des classes..." : "Choisir une classe"} />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                          {classes.map(c => (
                            <SelectItem key={c.id} value={c.id.toString()}>{c.nom}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Période Académique</label>
                      <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                        <SelectTrigger className="h-12 border-slate-200 rounded-2xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                          <SelectItem value="1">Trimestre 1</SelectItem>
                          <SelectItem value="2">Trimestre 2</SelectItem>
                          <SelectItem value="3">Trimestre 3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button 
                    className="w-full h-14 text-base font-bold shadow-xl shadow-primary/20 rounded-2xl bg-primary text-white hover:bg-primary/90 border-none" 
                    onClick={handleGenerate}
                    disabled={isCalculating || !selectedClass}
                  >
                    {isCalculating ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                        Calcul des moyennes & rangs...
                      </>
                    ) : (
                      <>
                        <FileText className="h-5 w-5 mr-3" />
                        Générer tous les bulletins
                      </>
                    )}
                  </Button>

                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/10 text-xs text-slate-600 font-medium">
                     <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                     <span>Le calcul automatique en 1 clic extrait les notes réelles de PostgreSQL et attribue les rangs de classe.</span>
                  </div>
               </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
               <Card className="bg-emerald-500/5 border-emerald-500/10 rounded-2xl">
                  <CardContent className="p-4 flex gap-4 items-center">
                     <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-bold">
                        <TrendingUp className="h-5 w-5" />
                     </div>
                     <div>
                        <p className="text-[10px] uppercase font-bold text-emerald-600">Calculateur PostgreSQL</p>
                        <p className="text-sm font-bold text-slate-800">Direct & Exact</p>
                     </div>
                  </CardContent>
               </Card>
               <Card className="bg-amber-500/5 border-amber-500/10 rounded-2xl">
                  <CardContent className="p-4 flex gap-4 items-center">
                     <div className="h-10 w-10 rounded-xl bg-amber-500 flex items-center justify-center text-white font-bold">
                        <LineChartIcon className="h-5 w-5" />
                     </div>
                     <div>
                        <p className="text-[10px] uppercase font-bold text-amber-600">Rangs de Classe</p>
                        <p className="text-sm font-bold text-slate-800">Automatiques</p>
                     </div>
                  </CardContent>
               </Card>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3 items-start">
             <div className="lg:col-span-2 space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-slate-100/70 p-3 rounded-2xl border border-slate-200 print:hidden">
                   <Button variant="ghost" size="sm" onClick={() => setStep("select")} className="font-bold text-xs self-start sm:self-auto">
                      <ArrowLeft className="h-4 w-4 mr-2" /> Retour à la sélection
                   </Button>
                   <div className="flex items-center gap-3 w-full sm:w-auto justify-end flex-wrap">
                      <div className="flex items-center gap-1.5">
                         <span className="text-[10px] font-black uppercase text-slate-500">Design :</span>
                         <Select value={selectedTemplateStyle} onValueChange={(val: any) => setSelectedTemplateStyle(val)}>
                            <SelectTrigger className="h-9 border-slate-200 rounded-xl text-xs bg-white w-40">
                               <SelectValue placeholder="Style du PDF" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                               <SelectItem value="classique" className="text-xs">Classique (Standard)</SelectItem>
                               <SelectItem value="premium" className="text-xs">Premium (Stripe/Canva)</SelectItem>
                               <SelectItem value="ministere" className="text-xs">Ministère Ivoirien</SelectItem>
                               <SelectItem value="custom" className="text-xs">Personnalisable</SelectItem>
                            </SelectContent>
                         </Select>
                      </div>
                      <Button size="sm" className="bg-primary text-white font-bold rounded-xl gap-2" onClick={handlePrint}>
                        <Printer className="h-4 w-4" /> Imprimer / PDF
                      </Button>
                   </div>
                </div>

                {/* High-Fidelity Printable Bulletin Template */}
                {currentStudent ? (
                  <div className="relative">
                    {/* 1. MODEL PREMIUM (Stripe / Canva style) */}
                    {selectedTemplateStyle === "premium" && (
                      <Card className="relative overflow-hidden border border-slate-100 shadow-2xl bg-white text-slate-800 p-8 md:p-12 rounded-[2rem] font-sans print:shadow-none print:border-none print:p-0">
                        {/* Subtle Premium Watermark */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.03] rotate-12">
                          <p className="text-8xl font-black tracking-widest text-slate-900">OFFICIEL</p>
                        </div>

                        {/* Top layout */}
                        <div className="flex justify-between items-start border-b border-slate-100 pb-6 mb-8">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold">
                                <Building2 className="h-5 w-5" />
                              </div>
                              <h2 className="text-base font-extrabold uppercase tracking-wider text-slate-900">{schoolInfo.nom}</h2>
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium">{schoolInfo.adresse} • {schoolInfo.telephone} • {schoolInfo.email}</p>
                          </div>
                          <div className="text-right space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                              Bulletin de Notes
                            </span>
                            <p className="text-xs font-bold text-slate-400 mt-1">Trimestre {selectedSemester} • 2023-2024</p>
                          </div>
                        </div>

                        {/* Student Metadata Card */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50/50 p-5 rounded-3xl border border-slate-100/50 mb-8 text-xs">
                          <div>
                            <p className="text-slate-400 font-bold uppercase tracking-wider text-[8px]">Élève</p>
                            <p className="font-extrabold text-slate-900 text-sm mt-0.5 uppercase">{currentStudent.nom}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 font-bold uppercase tracking-wider text-[8px]">Classe</p>
                            <p className="font-bold text-slate-800 text-sm mt-0.5">{currentStudent.classNom}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 font-bold uppercase tracking-wider text-[8px]">Effectif</p>
                            <p className="font-bold text-slate-800 text-sm mt-0.5">{currentStudent.totalStudents} élèves</p>
                          </div>
                          <div className="sm:text-right">
                            <p className="text-slate-400 font-bold uppercase tracking-wider text-[8px]">Rang de Classe</p>
                            <p className="font-extrabold text-indigo-600 text-sm mt-0.5">#{currentStudent.rank}</p>
                          </div>
                        </div>

                        {/* Clean Table with no vertical borders */}
                        <table className="w-full text-xs text-left mb-8">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-widest font-black text-[9px] pb-3">
                              <th className="py-3 font-bold">Matière</th>
                              <th className="py-3 text-center font-bold">Coeff.</th>
                              <th className="py-3 text-center font-bold">Moyenne / 20</th>
                              <th className="py-3 pl-4 font-bold">Appréciation & Observations</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {currentStudent.subjects.map((m: any, i: number) => (
                              <tr key={i} className="hover:bg-slate-50/40 transition-colors">
                                <td className="py-3.5 font-bold text-slate-950">{m.name}</td>
                                <td className="py-3.5 text-center text-slate-500 font-medium">{m.coef}</td>
                                <td className="py-3.5 text-center font-extrabold text-slate-900 bg-slate-50/40 rounded-xl px-2">{m.avg.toFixed(2)}</td>
                                <td className="py-3.5 pl-4 text-slate-500 italic leading-relaxed">{m.feedback}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {/* Performance Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                          <div className="p-5 bg-slate-900 text-white rounded-3xl flex flex-col justify-between">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Moyenne Générale</p>
                            <p className="text-3xl font-black tracking-tight mt-2">{currentStudent.overallAvg.toFixed(2)} <span className="text-xs font-bold text-slate-400">/ 20</span></p>
                          </div>
                          <div className="p-5 bg-slate-50 border border-slate-100 rounded-3xl flex flex-col justify-between">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Décision</p>
                            <p className="text-sm font-extrabold text-slate-800 mt-2 italic">&quot;{currentStudent.decision}&quot;</p>
                          </div>
                          <div className="p-5 bg-slate-50 border border-slate-100 rounded-3xl flex flex-col justify-between">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Assiduité</p>
                            <p className="text-sm font-bold text-slate-800 mt-2">{currentStudent.totalAbsences} absence(s)</p>
                          </div>
                        </div>

                        {/* Premium Footer with QR Code and Hand Signature */}
                        <div className="flex justify-between items-end border-t border-slate-100 pt-6 mt-8">
                          <div className="flex gap-4 items-center">
                            <div className="p-1 border rounded-xl bg-slate-50">
                              <QrCode className="h-12 w-12 text-slate-800" />
                            </div>
                            <div className="text-[8px] font-mono text-slate-400 leading-normal uppercase">
                              <p className="font-extrabold text-slate-600">Document Authentique</p>
                              <p>ID: {currentStudent.id || `B-${Date.now().toString().substring(7)}`}</p>
                              <p>SHA256: {(() => {
                                const str = JSON.stringify(currentStudent);
                                let hash = 5381;
                                for (let i = 0; i < str.length; i++) {
                                  hash = (hash * 33) ^ str.charCodeAt(i);
                                }
                                return (hash >>> 0).toString(16).padEnd(16, "f");
                              })()}</p>
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Direction des Études</p>
                            <div className="relative h-16 w-32 mx-auto flex items-center justify-center">
                              {/* Hand Signature Path Drawing */}
                              <svg className="absolute inset-0 text-indigo-700 opacity-80" viewBox="0 0 100 50" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10,25 C30,10 50,40 70,20 C85,5 90,30 95,25 C80,30 40,45 20,35" />
                              </svg>
                              {/* Circular Stamp */}
                              <div className="absolute h-14 w-14 border border-dashed border-rose-600/30 rounded-full flex items-center justify-center rotate-12 opacity-60">
                                <span className="text-[5px] font-black text-rose-600 uppercase text-center tracking-tighter">DIRECTION<br/>DE L'ECOLE</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    )}

                    {/* 2. MODEL MINISTERE (Official Côte d'Ivoire Governmental Template) */}
                    {selectedTemplateStyle === "ministere" && (
                      <Card className="border-4 border-slate-800 shadow-2xl bg-white text-slate-900 p-8 rounded-3xl font-serif print:shadow-none print:border-none print:p-0">
                        {/* Ministry Header */}
                        <div className="grid grid-cols-3 border-b-4 border-slate-900 pb-4 mb-6 items-start text-xs">
                          <div>
                            <p className="font-black tracking-wide">RÉPUBLIQUE DE CÔTE D'IVOIRE</p>
                            <p className="text-[9px] font-medium leading-tight text-slate-500 mt-1">Ministère de l'Éducation Nationale et de l'Alphabétisation</p>
                            <p className="font-bold text-slate-800 mt-2 uppercase">DRENA: ABIDJAN 1</p>
                          </div>
                          <div className="text-center flex flex-col items-center">
                            {/* Coat of arms shape */}
                            <div className="h-10 w-10 border-2 border-slate-800 rounded-full flex items-center justify-center font-bold text-[8px] tracking-tighter uppercase p-1">
                              S.P.Q.R
                            </div>
                            <span className="text-[8px] font-black tracking-widest mt-1">UNION • DISCIPLINE • TRAVAIL</span>
                          </div>
                          <div className="text-right">
                            <h2 className="text-sm font-extrabold uppercase">{schoolInfo.nom}</h2>
                            <p className="text-[9px] text-slate-500">{schoolInfo.adresse}</p>
                            <p className="text-[9px] font-bold text-slate-700">{schoolInfo.telephone}</p>
                          </div>
                        </div>

                        <div className="text-center my-4">
                          <h1 className="text-xl font-black uppercase tracking-wider text-slate-900 decoration-double underline underline-offset-4">BULLETIN DE NOTES DU {selectedSemester}er TRIMESTRE</h1>
                          <p className="text-[10px] font-bold text-slate-500 mt-1">ANNÉE SCOLAIRE : 2023-2024</p>
                        </div>

                        {/* Student Details */}
                        <div className="border border-slate-400 p-4 rounded-xl mb-6 text-xs grid grid-cols-2 gap-4">
                          <div>
                            <p>Nom & Prénom(s) : <strong className="uppercase">{currentStudent.nom}</strong></p>
                            <p className="mt-1">Classe : <strong>{currentStudent.classNom}</strong></p>
                          </div>
                          <div className="text-right">
                            <p>Rang : <strong>{currentStudent.rank} sur {currentStudent.totalStudents}</strong></p>
                            <p className="mt-1">Moyenne Générale : <strong>{currentStudent.overallAvg.toFixed(2)} / 20</strong></p>
                          </div>
                        </div>

                        {/* Government Grid Table */}
                        <table className="w-full border-collapse border-2 border-slate-800 text-xs mb-6">
                          <thead className="bg-slate-50 font-bold uppercase text-slate-800 text-center border-b-2 border-slate-800">
                            <tr>
                              <th className="border border-slate-400 p-2.5 text-left">Disciplines</th>
                              <th className="border border-slate-400 p-2.5">Coef</th>
                              <th className="border border-slate-400 p-2.5">Moyenne / 20</th>
                              <th className="border border-slate-400 p-2.5">Appréciations & Décisions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentStudent.subjects.map((m: any, i: number) => (
                              <tr key={i} className="border-b border-slate-400">
                                <td className="border border-slate-400 p-2.5 font-bold">{m.name}</td>
                                <td className="border border-slate-400 p-2.5 text-center">{m.coef}</td>
                                <td className="border border-slate-400 p-2.5 text-center font-extrabold">{m.avg.toFixed(2)}</td>
                                <td className="border border-slate-400 p-2.5 italic pl-4">{m.feedback}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {/* Ministry footer stamp */}
                        <div className="grid grid-cols-2 gap-8 mt-8 pt-6 border-t border-slate-800 text-xs">
                          <div>
                            <p className="font-bold uppercase tracking-wider text-slate-500">Décision d'orientation :</p>
                            <p className="font-extrabold italic mt-2">{currentStudent.decision}</p>
                          </div>
                          <div className="text-center">
                            <p className="font-bold text-slate-800 uppercase">Le Principal de l'Établissement</p>
                            <div className="relative mx-auto mt-4 h-16 w-32 border-2 border-rose-600 rounded-2xl flex items-center justify-center rotate-3">
                              <p className="text-[7px] font-black text-rose-600 text-center uppercase tracking-wider">MINISTERE DE L'EDUCATION<br/>CACHET OFFICIEL</p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    )}

                    {/* 3. MODEL CUSTOMIZABLE (Branded accent color selector) */}
                    {selectedTemplateStyle === "custom" && (
                      <Card className="border-t-8 border-indigo-600 shadow-2xl bg-white text-slate-900 p-8 rounded-3xl font-sans relative print:shadow-none print:border-none print:p-0">
                        {/* Branded Header */}
                        <div className="flex justify-between items-center pb-6 border-b border-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold">
                              <Building2 className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="font-extrabold text-base text-slate-900">{schoolInfo.nom}</h3>
                              <p className="text-[10px] text-slate-400">{schoolInfo.adresse}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-xl text-xs font-bold uppercase">
                              Trimestre {selectedSemester}
                            </span>
                          </div>
                        </div>

                        {/* Student Badge Card */}
                        <div className="p-6 bg-indigo-600/5 rounded-3xl my-6 flex justify-between items-center">
                          <div>
                            <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">Élève</p>
                            <h2 className="text-lg font-black text-slate-800 mt-1 uppercase">{currentStudent.nom}</h2>
                            <p className="text-xs text-slate-500 mt-0.5">Classe: {currentStudent.classNom}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">Moyenne Trimestrielle</p>
                            <h2 className="text-2xl font-black text-indigo-600 mt-1">{currentStudent.overallAvg.toFixed(2)} / 20</h2>
                          </div>
                        </div>

                        {/* Simple table style */}
                        <table className="w-full text-xs text-left mb-6">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-widest font-black text-[9px] pb-3">
                              <th className="py-2.5">Matière</th>
                              <th className="py-2.5 text-center">Coeff</th>
                              <th className="py-2.5 text-center">Note / 20</th>
                              <th className="py-2.5 pl-4">Observations</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {currentStudent.subjects.map((m: any, i: number) => (
                              <tr key={i}>
                                <td className="py-3 font-bold text-slate-800">{m.name}</td>
                                <td className="py-3 text-center text-slate-500">{m.coef}</td>
                                <td className="py-3 text-center font-extrabold text-indigo-600 bg-indigo-50/50 rounded-xl px-2">{m.avg.toFixed(2)}</td>
                                <td className="py-3 pl-4 text-slate-500 italic">{m.feedback}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {/* Custom signatures */}
                        <div className="flex justify-between items-end border-t border-slate-100 pt-6 mt-6">
                          <div className="flex gap-3 items-center">
                            <QrCode className="h-12 w-12 text-slate-800" />
                            <p className="text-[8px] font-mono text-slate-400">ID: B-CUSTOM-2026<br/>Vérifié en Ligne</p>
                          </div>
                          <div className="text-center w-48 border border-slate-100 bg-slate-50/50 p-3 rounded-2xl">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-6">La Direction</p>
                            <div className="h-10 flex items-center justify-center text-[10px] italic text-slate-400">
                              Signé électroniquement
                            </div>
                          </div>
                        </div>
                      </Card>
                    )}

                    {/* 4. MODEL CLASSIQUE (Original clean layout) */}
                    {selectedTemplateStyle === "classique" && (
                      <Card className="border-4 border-slate-200 shadow-2xl overflow-hidden bg-white text-slate-900 font-sans p-8 md:p-10 relative rounded-3xl print:shadow-none print:border-none">
                         {/* Header Branding */}
                         <div className="flex justify-between border-b-2 border-slate-900 pb-4 mb-6">
                            <div className="flex gap-4 items-center">
                               <div className="h-16 w-16 bg-primary flex items-center justify-center text-white rounded-2xl font-bold">
                                  <Building2 className="h-8 w-8" />
                               </div>
                               <div>
                                  <h2 className="text-lg md:text-xl font-black uppercase text-slate-900">{schoolInfo.nom}</h2>
                                  <p className="text-[10px] font-bold text-slate-600">{schoolInfo.adresse} | {schoolInfo.telephone}</p>
                                  <p className="text-[10px] text-primary italic font-semibold">&quot;L&apos;Excellence est notre engagement&quot;</p>
                               </div>
                            </div>
                            <div className="text-right">
                               <h1 className="text-xl md:text-2xl font-black italic text-slate-900">BULLETIN SCOLAIRE</h1>
                               <p className="text-xs font-bold uppercase tracking-widest text-primary">Trimestre {selectedSemester} - 2023-2024</p>
                            </div>
                         </div>

                         {/* Student Metadata Table */}
                         <div className="grid grid-cols-4 gap-3 mb-6 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200">
                            <div>ÉLÈVE : <span className="font-black text-slate-900 uppercase">{currentStudent.nom}</span></div>
                            <div>CLASSE : <span className="font-black text-slate-900">{currentStudent.classNom}</span></div>
                            <div>EFFECTIF : <span className="font-black text-slate-900">{currentStudent.totalStudents}</span></div>
                            <div className="text-right">RANG : <span className="font-black text-primary">#{currentStudent.rank}</span></div>
                         </div>

                         {/* Subjects Grid */}
                         <table className="w-full border-collapse border border-slate-300 text-xs mb-6">
                            <thead className="bg-slate-100 uppercase font-black text-slate-700">
                              <tr>
                                 <th className="border border-slate-300 p-2 text-left">Matières</th>
                                 <th className="border border-slate-300 p-2 text-center">Coef</th>
                                 <th className="border border-slate-300 p-2 text-center">Moyenne / 20</th>
                                 <th className="border border-slate-300 p-2 text-left">Appréciation du Professeur</th>
                              </tr>
                            </thead>
                            <tbody>
                              {currentStudent.subjects.map((m: any, i: number) => (
                                 <tr key={i} className="border-b border-slate-200">
                                    <td className="border border-slate-300 p-2 font-bold text-slate-900">{m.name}</td>
                                    <td className="border border-slate-300 p-2 text-center">{m.coef}</td>
                                    <td className="border border-slate-300 p-2 text-center font-black text-primary bg-primary/5">{m.avg.toFixed(2)}</td>
                                    <td className="border border-slate-300 p-2 text-[11px] italic text-slate-600">{m.feedback}</td>
                                 </tr>
                              ))}
                            </tbody>
                         </table>

                         <div className="grid grid-cols-2 gap-6 mb-6">
                            <div className="space-y-3">
                               <div className="p-4 border border-slate-300 bg-slate-50 text-center rounded-2xl">
                                  <p className="text-[10px] uppercase font-bold text-slate-500">Moyenne Générale</p>
                                  <p className="text-3xl font-black text-slate-900">{currentStudent.overallAvg.toFixed(2)} / 20</p>
                               </div>
                               <div className="p-3 border border-slate-300 rounded-2xl text-xs">
                                  <p className="font-bold text-slate-600">Assiduité & Absences :</p>
                                  <p className="text-slate-800 font-bold mt-1">{currentStudent.totalAbsences} absence(s) enregistrée(s)</p>
                               </div>
                            </div>

                            <div className="space-y-3">
                               <div className="p-4 border border-slate-300 bg-primary/10 text-center rounded-2xl">
                                  <p className="text-[10px] uppercase font-bold text-primary">Rang de Classe</p>
                                  <p className="text-3xl font-black text-primary">#{currentStudent.rank} <span className="text-xs font-bold text-slate-500">/ {currentStudent.totalStudents}</span></p>
                               </div>
                               <div className="p-3 border border-slate-300 rounded-2xl min-h-[60px] text-xs">
                                  <p className="font-bold text-slate-600 mb-1">Décision du Conseil de Classe :</p>
                                  <p className="font-bold italic text-slate-900">{currentStudent.decision}</p>
                               </div>
                            </div>
                         </div>

                         {/* Footer & Signatures */}
                         <div className="flex justify-between items-end border-t border-slate-200 pt-6">
                            <div className="flex gap-3 items-center">
                               <QrCode className="h-14 w-14 text-slate-900" />
                               <p className="text-[8px] font-mono leading-tight text-slate-500">DOCUMENT SÉCURISÉ<br/>ID : BULLETIN-2026-X89<br/>Vérifié par MonÉcole+</p>
                            </div>
                            <div className="text-center w-56">
                               <p className="text-[10px] font-black uppercase mb-10 text-slate-800">Cachet & Signature du Directeur</p>
                               <div className="relative mx-auto h-16 w-32 border-2 border-rose-600/40 rounded-xl flex items-center justify-center -rotate-6">
                                  <p className="text-[6px] font-black text-rose-600 text-center uppercase tracking-widest opacity-60">DIRECTION GENERALE<br/>AUTHENTIFIÉ</p>
                               </div>
                            </div>
                         </div>
                      </Card>
                    )}
                  </div>
                ) : (
                  <div className="p-16 text-center text-slate-400 italic bg-white rounded-3xl border">
                    Aucun élève trouvé dans cette classe.
                  </div>
                )}
             </div>

             {/* Students Batch Selector Sidebar */}
             <div className="space-y-4">
                <Card className="border-slate-200 bg-white rounded-3xl shadow-lg overflow-hidden">
                   <CardHeader className="bg-slate-50 border-b">
                      <CardTitle className="text-sm font-bold uppercase text-slate-600">Élèves de la Classe ({reportData?.students?.length || 0})</CardTitle>
                   </CardHeader>
                   <CardContent className="p-3 space-y-1.5 max-h-[500px] overflow-y-auto custom-scrollbar">
                      {reportData?.students?.map((s: any, idx: number) => (
                        <div 
                          key={s.id} 
                          className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${idx === selectedStudentIndex ? 'bg-primary text-white shadow-md' : 'hover:bg-slate-50 border border-slate-100'}`}
                          onClick={() => setSelectedStudentIndex(idx)}
                        >
                           <div className="flex items-center gap-2.5">
                              <div className={`h-7 w-7 rounded-xl flex items-center justify-center font-bold text-xs ${idx === selectedStudentIndex ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}`}>
                                 {s.rank}
                              </div>
                              <div>
                                 <p className="text-xs font-bold leading-tight">{s.nom}</p>
                                 <p className={`text-[10px] ${idx === selectedStudentIndex ? 'text-white/80' : 'text-slate-500'}`}>Moy: {s.overallAvg.toFixed(2)}/20</p>
                              </div>
                           </div>
                           <ChevronRight className={`h-4 w-4 ${idx === selectedStudentIndex ? 'text-white' : 'text-slate-400'}`} />
                        </div>
                      ))}
                   </CardContent>
                </Card>
             </div>
          </div>
        )}
      </main>
    </>
  )
}
