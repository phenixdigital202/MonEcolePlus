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
                <div className="flex justify-between items-center bg-slate-100/70 p-2.5 rounded-2xl border border-slate-200">
                   <Button variant="ghost" size="sm" onClick={() => setStep("select")} className="font-bold text-xs">
                      <ArrowLeft className="h-4 w-4 mr-2" /> Retour à la sélection
                   </Button>
                   <div className="flex gap-2">
                       <Button size="sm" className="bg-primary text-white font-bold rounded-xl gap-2" onClick={handlePrint}>
                        <Printer className="h-4 w-4" /> Imprimer / PDF
                       </Button>
                   </div>
                </div>

                {/* High-Fidelity Printable Bulletin Template */}
                {currentStudent ? (
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
