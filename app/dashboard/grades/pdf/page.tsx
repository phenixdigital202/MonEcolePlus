"use client"

import { useState, useEffect, useRef } from "react"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  FileText, 
  Download, 
  Printer, 
  Eye, 
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Building2,
  QrCode
} from "lucide-react"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { getClasses } from "@/lib/grades-actions"
import { getSchoolInfoAction } from "@/lib/documents-actions"
import { DocumentPrintContainer } from "@/components/documents/document-print-container"
import { downloadDocumentAsPdf } from "@/lib/pdf-export-utils"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"

export default function BulletinPDFPage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [selectedSemester, setSelectedSemester] = useState("1")
  const [selectedClass, setSelectedClass] = useState("")
  const [classes, setClasses] = useState<any[]>([])
  const [previewData, setPreviewData] = useState<any[]>([])
  const [selectedStudentForPDF, setSelectedStudentForPDF] = useState<any>(null)
  const [schoolInfo, setSchoolInfo] = useState<any>(null)
  
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchClasses = async () => {
      const cls = await getClasses()
      setClasses(cls)
      if (cls.length > 0) setSelectedClass(cls[0].id.toString())
    }
    const fetchSchool = async () => {
      const res = await getSchoolInfoAction()
      if (res.success) setSchoolInfo(res.data)
    }
    fetchClasses()
    fetchSchool()
  }, [])

  const handleGenerate = async () => {
    if (!selectedClass) return
    setIsGenerating(true)
    
    try {
      const response = await fetch(`/api/grades/report-data?classId=${selectedClass}&semester=${selectedSemester}`)
      const data = await response.json()
      setPreviewData(Array.isArray(data) ? data : [])
      setShowPreview(true)
    } catch (e) {
      console.error(e)
      toast.error("Erreur lors de la récupération des données de la classe")
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePrintSingle = (student: any) => {
    setSelectedStudentForPDF(student)
  }

  const triggerWindowPrint = () => {
    window.print()
  }

  const handleDownloadPdf = (student: any) => {
    if (!student) return
    toast.info("Génération du bulletin PDF...")
    downloadDocumentAsPdf({
      elementId: "printable-document",
      filename: `Bulletin_${(student.name || student.nom)?.replace(/\s+/g, '_')}_T${selectedSemester}`,
      format: "a4"
    })
  }

  const currentClassName = classes.find(c => c.id.toString() === selectedClass)?.nom || "Classe"
  const activeYear = schoolInfo?.activeSchoolYear || "2026-2027"

  return (
    <>
      <DashboardHeader 
        title="Génération de Bulletins PDF" 
        subtitle="Créez et exportez les bulletins semestriels officiels"
      />
      
      <main className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Controls */}
          <Card className="md:col-span-1 border-primary/20 bg-primary/5 rounded-3xl">
            <CardHeader>
              <CardTitle className="text-lg font-black">Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">Période Académique</label>
                <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                  <SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="1">Trimestre 1</SelectItem>
                    <SelectItem value="2">Trimestre 2</SelectItem>
                    <SelectItem value="3">Trimestre 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">Classe</label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Choisir une classe" /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {classes.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.nom}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                className="w-full h-12 shadow-lg rounded-2xl bg-primary text-white hover:bg-primary/90 font-bold border-none transition-all" 
                onClick={handleGenerate}
                disabled={isGenerating || !selectedClass}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Calcul en cours...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Générer les bulletins
                  </>
                )}
              </Button>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 text-xs flex gap-3">
                <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
                <p>Les moyennes sont calculées dynamiquement sur la base de toutes les évaluations saisies en base de données.</p>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <Card className="md:col-span-2 border-none shadow-xl rounded-3xl overflow-hidden bg-white">
            <CardHeader className="flex flex-row items-center justify-between bg-slate-50/50 border-b">
              <CardTitle className="text-lg font-black">Résultats de la classe ({previewData.length} élèves)</CardTitle>
              {showPreview && previewData.length > 0 && (
                <Button variant="outline" size="sm" className="rounded-xl font-bold gap-2" onClick={() => handlePrintSingle(previewData[0])}>
                  <Printer className="h-4 w-4" /> Imprimer 1er bulletin
                </Button>
              )}
            </CardHeader>
            <CardContent className="pt-6">
              {!showPreview ? (
                <div className="p-16 text-center border-2 border-dashed border-slate-200 rounded-3xl space-y-4">
                  <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                    <FileText className="h-10 w-10 text-slate-300" />
                  </div>
                  <p className="text-slate-400 font-medium">Sélectionnez une classe et cliquez sur &quot;Générer les bulletins&quot;.</p>
                </div>
              ) : (
                <div className="space-y-4 h-[420px] overflow-y-auto pr-2 custom-scrollbar">
                  {previewData.map((student, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-primary/30 hover:bg-slate-50/50 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                          {(student.name || student.nom || "E")[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{student.name || student.nom}</p>
                          <p className="text-xs text-slate-500 font-medium">Moyenne: <span className="font-black text-primary">{(student.avg ?? student.overallAvg ?? 0).toFixed(2)}/20</span> | Rang: <span className="font-bold text-slate-700">#{i + 1}</span></p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${(student.avg ?? student.overallAvg ?? 0) >= 10 ? 'bg-emerald-500' : 'bg-rose-500'} text-white border-0 font-bold text-xs rounded-lg`}>
                          {(student.avg ?? student.overallAvg ?? 0) >= 10 ? 'Admis' : 'Échec'}
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="rounded-xl font-bold text-xs gap-1.5 hover:bg-primary hover:text-white"
                          onClick={() => handlePrintSingle(student)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Aperçu / Imp.
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-sm font-bold border border-emerald-100">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <span>{previewData.length} bulletins générés et prêts pour le calcul et l&apos;impression.</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Mount Print Portal for printing */}
      {selectedStudentForPDF && (
        <DocumentPrintContainer pageSize="a4">
          <div
            id="printable-document"
            className="printable-area print-page-a4 w-full max-w-[210mm] min-h-[285mm] mx-auto bg-white p-8 sm:p-10 border-2 border-indigo-950 text-slate-900 font-sans box-border flex flex-col justify-between"
          >
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              <div>
                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-indigo-950 pb-5 mb-5">
                  <div className="flex items-center gap-4">
                    {schoolInfo?.logo_url ? (
                      <img src={schoolInfo.logo_url} alt="Logo Établissement" className="h-16 w-16 object-contain" />
                    ) : (
                      <div className="h-16 w-16 bg-indigo-950 text-white rounded-2xl flex items-center justify-center font-bold">
                        <Building2 className="h-8 w-8" />
                      </div>
                    )}
                    <div>
                      <h2 className="text-lg sm:text-xl font-black uppercase tracking-wider text-indigo-950">RÉPUBLIQUE DE CÔTE D&apos;IVOIRE</h2>
                      <p className="text-xs text-slate-500 font-bold uppercase">Ministère de l&apos;Éducation Nationale et de l&apos;Alphabétisation</p>
                      <p className="text-sm font-extrabold text-indigo-800 mt-1">ÉTABLISSEMENT : {schoolInfo?.nom || "MonÉcole+"}</p>
                      <p className="text-xs text-slate-500">{schoolInfo?.adresse} {schoolInfo?.telephone && `• ${schoolInfo.telephone}`}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-wide">BULLETIN DE NOTES</h3>
                    <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-lg text-xs font-bold uppercase mt-1 inline-block">
                      Trimestre {selectedSemester} &bull; {activeYear}
                    </span>
                  </div>
                </div>

                {/* Student Info Card */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs sm:text-sm mb-6">
                  <div>
                    <p className="text-slate-400 font-bold uppercase text-[9px]">Nom & Prénom(s)</p>
                    <p className="font-black text-slate-900 text-base uppercase mt-0.5">{selectedStudentForPDF.name || selectedStudentForPDF.nom}</p>
                    <p className="mt-2 text-slate-600 font-bold">Classe : <span className="text-slate-900">{currentClassName}</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 font-bold uppercase text-[9px]">Moyenne Trimestrielle</p>
                    <p className="font-black text-indigo-700 text-2xl mt-0.5">{(selectedStudentForPDF.avg ?? selectedStudentForPDF.overallAvg ?? 0).toFixed(2)} / 20</p>
                    <p className="mt-1 text-slate-600 font-bold">
                      Résultat : <span className={(selectedStudentForPDF.avg ?? selectedStudentForPDF.overallAvg ?? 0) >= 10 ? "text-emerald-600 font-extrabold" : "text-rose-600 font-extrabold"}>{(selectedStudentForPDF.avg ?? selectedStudentForPDF.overallAvg ?? 0) >= 10 ? "ADMIS" : "ÉCHEC"}</span>
                    </p>
                  </div>
                </div>

                {/* Subjects Table */}
                <table className="w-full text-xs sm:text-sm text-left border-collapse border border-slate-300 mb-6">
                  <thead>
                    <tr className="bg-slate-100 border-b-2 border-slate-300 text-slate-800 uppercase font-black">
                      <th className="p-3 border-r border-slate-300">Matière / Discipline</th>
                      <th className="p-3 text-center border-r border-slate-300">Notes</th>
                      <th className="p-3 text-center border-r border-slate-300">Moyenne / 20</th>
                      <th className="p-3 pl-4">Appréciation du Professeur</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selectedStudentForPDF.notes && selectedStudentForPDF.notes.length > 0 ? (
                      selectedStudentForPDF.notes.map((n: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-3 font-bold text-slate-900 border-r border-slate-200">{n.matiere}</td>
                          <td className="p-3 text-center text-slate-600 font-medium border-r border-slate-200">{n.valeur}/20</td>
                          <td className="p-3 text-center font-extrabold text-indigo-900 bg-indigo-50/40 border-r border-slate-200">{(n.valeur ?? 0).toFixed(2)}</td>
                          <td className="p-3 pl-4 italic text-slate-600">
                            {n.valeur >= 16 ? "Excellent travail" : n.valeur >= 14 ? "Très Bon travail" : n.valeur >= 12 ? "Bon travail" : n.valeur >= 10 ? "Passable" : "Insuffisant"}
                          </td>
                        </tr>
                      ))
                    ) : selectedStudentForPDF.subjects && selectedStudentForPDF.subjects.length > 0 ? (
                      selectedStudentForPDF.subjects.map((m: any, i: number) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="p-3 font-bold text-slate-900 border-r border-slate-200">{m.name || m.matiere}</td>
                          <td className="p-3 text-center text-slate-600 font-medium border-r border-slate-200">{m.coef || 1}</td>
                          <td className="p-3 text-center font-extrabold text-indigo-900 bg-indigo-50/40 border-r border-slate-200">{(m.avg ?? m.valeur ?? 0).toFixed(2)}</td>
                          <td className="p-3 pl-4 italic text-slate-600">{m.feedback || (m.avg >= 16 ? "Excellent travail" : m.avg >= 14 ? "Très Bon travail" : m.avg >= 12 ? "Bon travail" : m.avg >= 10 ? "Passable" : "Insuffisant")}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-slate-400 italic">
                          Aucune note enregistrée pour cet élève ce trimestre.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Performance Grid */}
                <div className="grid grid-cols-2 gap-6 my-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                    <p className="text-xs font-bold text-slate-500 uppercase">Décision du Conseil de Classe</p>
                    <p className="text-sm font-extrabold text-slate-900 mt-1 italic">&quot;{(selectedStudentForPDF.avg ?? selectedStudentForPDF.overallAvg ?? 0) >= 10 ? "Admis(e) en classe supérieure" : "Refusé(e) / À encourager"}&quot;</p>
                  </div>
                  <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl text-right">
                    <p className="text-xs font-bold text-indigo-600 uppercase">Assiduité & Conduite</p>
                    <p className="text-sm font-extrabold text-indigo-950 mt-1">{selectedStudentForPDF.totalAbsences ?? 0} absence(s) signalée(s)</p>
                  </div>
                </div>
              </div>

              {/* Footer Signatures */}
              <div className="flex justify-between items-end border-t-2 border-slate-900 pt-6 mt-4">
                <div className="flex gap-3 items-center">
                  <QrCode className="h-14 w-14 text-indigo-950" />
                  <p className="text-[9px] font-mono leading-tight text-slate-500">DOCUMENT OFFICIEL<br/>VERIFICATION EN LIGNE<br/>ID: OFFICIEL-2026-N1</p>
                </div>
                <div className="text-center w-56">
                  <p className="text-xs font-black uppercase text-slate-800 mb-2">Signature & Cachet Officiel</p>
                  <div className="relative mx-auto h-20 w-40 flex items-center justify-center">
                    {schoolInfo?.cachet_url ? (
                      <img src={schoolInfo.cachet_url} alt="Cachet Officiel" className="h-20 w-auto object-contain" />
                    ) : (
                      <div className="h-16 w-36 border-2 border-dashed border-rose-600/50 rounded-xl flex items-center justify-center -rotate-3">
                        <p className="text-[7px] font-black text-rose-600 text-center uppercase tracking-widest">MINISTÈRE DE L&apos;ÉDUCATION<br/>LE CHEF D&apos;ÉTABLISSEMENT</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DocumentPrintContainer>
      )}

      {/* Official Bulletin Preview & Print Modal */}
      <Dialog open={!!selectedStudentForPDF} onOpenChange={(open) => !open && setSelectedStudentForPDF(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-6">
          {selectedStudentForPDF && (
            <div>
              <div className="flex justify-between items-center pb-4 border-b print:hidden no-print">
                <DialogTitle className="text-xl font-bold">Aperçu du Bulletin Officiel</DialogTitle>
                <div className="flex gap-2">
                  <Button variant="outline" className="rounded-xl border-slate-300 font-bold gap-2 text-slate-700 bg-white" onClick={() => handleDownloadPdf(selectedStudentForPDF)}>
                    <Download className="h-4 w-4" /> Télécharger PDF
                  </Button>
                  <Button className="rounded-xl bg-primary text-white font-bold gap-2 shadow-md shadow-primary/20" onClick={triggerWindowPrint}>
                    <Printer className="h-4 w-4" /> Imprimer
                  </Button>
                </div>
              </div>

              {/* On-screen Preview inside Dialog */}
              <div className="bg-slate-200/50 p-4 rounded-3xl overflow-x-auto flex justify-center border border-slate-200 mt-4">
                <div className="printable-area print-page-a4 w-full max-w-[210mm] min-h-[285mm] mx-auto bg-white p-8 sm:p-10 border-2 border-indigo-950 text-slate-900 font-sans shadow-sm box-border flex flex-col justify-between">
                  <div className="space-y-6 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Header */}
                      <div className="flex justify-between items-start border-b-2 border-indigo-950 pb-5 mb-5">
                        <div className="flex items-center gap-4">
                          {schoolInfo?.logo_url ? (
                            <img src={schoolInfo.logo_url} alt="Logo Établissement" className="h-16 w-16 object-contain" />
                          ) : (
                            <div className="h-16 w-16 bg-indigo-950 text-white rounded-2xl flex items-center justify-center font-bold">
                              <Building2 className="h-8 w-8" />
                            </div>
                          )}
                          <div>
                            <h2 className="text-lg sm:text-xl font-black uppercase tracking-wider text-indigo-950">RÉPUBLIQUE DE CÔTE D&apos;IVOIRE</h2>
                            <p className="text-xs text-slate-500 font-bold uppercase">Ministère de l&apos;Éducation Nationale et de l&apos;Alphabétisation</p>
                            <p className="text-sm font-extrabold text-indigo-800 mt-1">ÉTABLISSEMENT : {schoolInfo?.nom || "MonÉcole+"}</p>
                            <p className="text-xs text-slate-500">{schoolInfo?.adresse} {schoolInfo?.telephone && `• ${schoolInfo.telephone}`}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <h3 className="text-xl font-black text-slate-900 uppercase tracking-wide">BULLETIN DE NOTES</h3>
                          <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-lg text-xs font-bold uppercase mt-1 inline-block">
                            Trimestre {selectedSemester} &bull; {activeYear}
                          </span>
                        </div>
                      </div>

                      {/* Student Info Card */}
                      <div className="grid grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs sm:text-sm mb-6">
                        <div>
                          <p className="text-slate-400 font-bold uppercase text-[9px]">Nom & Prénom(s)</p>
                          <p className="font-black text-slate-900 text-base uppercase mt-0.5">{selectedStudentForPDF.name || selectedStudentForPDF.nom}</p>
                          <p className="mt-2 text-slate-600 font-bold">Classe : <span className="text-slate-900">{currentClassName}</span></p>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-400 font-bold uppercase text-[9px]">Moyenne Trimestrielle</p>
                          <p className="font-black text-indigo-700 text-2xl mt-0.5">{(selectedStudentForPDF.avg ?? selectedStudentForPDF.overallAvg ?? 0).toFixed(2)} / 20</p>
                          <p className="mt-1 text-slate-600 font-bold">
                            Résultat : <span className={(selectedStudentForPDF.avg ?? selectedStudentForPDF.overallAvg ?? 0) >= 10 ? "text-emerald-600 font-extrabold" : "text-rose-600 font-extrabold"}>{(selectedStudentForPDF.avg ?? selectedStudentForPDF.overallAvg ?? 0) >= 10 ? "ADMIS" : "ÉCHEC"}</span>
                          </p>
                        </div>
                      </div>

                      {/* Subjects Table */}
                      <table className="w-full text-xs sm:text-sm text-left border-collapse border border-slate-300 mb-6">
                        <thead>
                          <tr className="bg-slate-100 border-b-2 border-slate-300 text-slate-800 uppercase font-black">
                            <th className="p-3 border-r border-slate-300">Matière / Discipline</th>
                            <th className="p-3 text-center border-r border-slate-300">Notes</th>
                            <th className="p-3 text-center border-r border-slate-300">Moyenne / 20</th>
                            <th className="p-3 pl-4">Appréciation du Professeur</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {selectedStudentForPDF.notes && selectedStudentForPDF.notes.length > 0 ? (
                            selectedStudentForPDF.notes.map((n: any, idx: number) => (
                              <tr key={idx} className="hover:bg-slate-50/50">
                                <td className="p-3 font-bold text-slate-900 border-r border-slate-200">{n.matiere}</td>
                                <td className="p-3 text-center text-slate-600 font-medium border-r border-slate-200">{n.valeur}/20</td>
                                <td className="p-3 text-center font-extrabold text-indigo-900 bg-indigo-50/40 border-r border-slate-200">{(n.valeur ?? 0).toFixed(2)}</td>
                                <td className="p-3 pl-4 italic text-slate-600">
                                  {n.valeur >= 16 ? "Excellent travail" : n.valeur >= 14 ? "Très Bon travail" : n.valeur >= 12 ? "Bon travail" : n.valeur >= 10 ? "Passable" : "Insuffisant"}
                                </td>
                              </tr>
                            ))
                          ) : selectedStudentForPDF.subjects && selectedStudentForPDF.subjects.length > 0 ? (
                            selectedStudentForPDF.subjects.map((m: any, i: number) => (
                              <tr key={i} className="hover:bg-slate-50/50">
                                <td className="p-3 font-bold text-slate-900 border-r border-slate-200">{m.name || m.matiere}</td>
                                <td className="p-3 text-center text-slate-600 font-medium border-r border-slate-200">{m.coef || 1}</td>
                                <td className="p-3 text-center font-extrabold text-indigo-900 bg-indigo-50/40 border-r border-slate-200">{(m.avg ?? m.valeur ?? 0).toFixed(2)}</td>
                                <td className="p-3 pl-4 italic text-slate-600">{m.feedback || (m.avg >= 16 ? "Excellent travail" : m.avg >= 14 ? "Très Bon travail" : m.avg >= 12 ? "Bon travail" : m.avg >= 10 ? "Passable" : "Insuffisant")}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="p-6 text-center text-slate-400 italic">
                                Aucune note enregistrée pour cet élève ce trimestre.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>

                      {/* Performance Grid */}
                      <div className="grid grid-cols-2 gap-6 my-4">
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                          <p className="text-xs font-bold text-slate-500 uppercase">Décision du Conseil de Classe</p>
                          <p className="text-sm font-extrabold text-slate-900 mt-1 italic">&quot;{(selectedStudentForPDF.avg ?? selectedStudentForPDF.overallAvg ?? 0) >= 10 ? "Admis(e) en classe supérieure" : "Refusé(e) / À encourager"}&quot;</p>
                        </div>
                        <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl text-right">
                          <p className="text-xs font-bold text-indigo-600 uppercase">Assiduité & Conduite</p>
                          <p className="text-sm font-extrabold text-indigo-950 mt-1">{selectedStudentForPDF.totalAbsences ?? 0} absence(s) signalée(s)</p>
                        </div>
                      </div>
                    </div>

                    {/* Footer Signatures */}
                    <div className="flex justify-between items-end border-t-2 border-slate-900 pt-6 mt-4">
                      <div className="flex gap-3 items-center">
                        <QrCode className="h-14 w-14 text-indigo-950" />
                        <p className="text-[9px] font-mono leading-tight text-slate-500">DOCUMENT OFFICIEL<br/>VERIFICATION EN LIGNE<br/>ID: OFFICIEL-2026-N1</p>
                      </div>
                      <div className="text-center w-56">
                        <p className="text-xs font-black uppercase text-slate-800 mb-2">Signature & Cachet Officiel</p>
                        <div className="relative mx-auto h-20 w-40 flex items-center justify-center">
                          {schoolInfo?.cachet_url ? (
                            <img src={schoolInfo.cachet_url} alt="Cachet Officiel" className="h-20 w-auto object-contain" />
                          ) : (
                            <div className="h-16 w-36 border-2 border-dashed border-rose-600/50 rounded-xl flex items-center justify-center -rotate-3">
                              <p className="text-[7px] font-black text-rose-600 text-center uppercase tracking-widest">MINISTÈRE DE L&apos;ÉDUCATION<br/>LE CHEF D&apos;ÉTABLISSEMENT</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
