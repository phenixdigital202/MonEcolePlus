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
  X
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function BulletinPDFPage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [selectedSemester, setSelectedSemester] = useState("1")
  const [selectedClass, setSelectedClass] = useState("")
  const [classes, setClasses] = useState<any[]>([])
  const [previewData, setPreviewData] = useState<any[]>([])
  const [selectedStudentForPDF, setSelectedStudentForPDF] = useState<any>(null)
  
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchClasses = async () => {
      const cls = await getClasses()
      setClasses(cls)
      if (cls.length > 0) setSelectedClass(cls[0].id.toString())
    }
    fetchClasses()
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

  const currentClassName = classes.find(c => c.id.toString() === selectedClass)?.nom || "Classe"

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
                          {student.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{student.name}</p>
                          <p className="text-xs text-slate-500 font-medium">Moyenne: <span className="font-black text-primary">{student.avg.toFixed(2)}/20</span> | Rang: <span className="font-bold text-slate-700">#{i + 1}</span></p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${student.avg >= 10 ? 'bg-emerald-500' : 'bg-rose-500'} text-white border-0 font-bold text-xs rounded-lg`}>
                          {student.avg >= 10 ? 'Admis' : 'Échec'}
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

      {/* Official Bulletin Preview & Print Modal */}
      <Dialog open={!!selectedStudentForPDF} onOpenChange={(open) => !open && setSelectedStudentForPDF(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-6">
          {selectedStudentForPDF && (
            <div>
              <div className="flex justify-between items-center pb-4 border-b">
                <DialogTitle className="text-xl font-bold">Aperçu du Bulletin Officiel</DialogTitle>
                <div className="flex gap-2">
                  <Button className="rounded-xl bg-primary text-white font-bold gap-2" onClick={triggerWindowPrint}>
                    <Printer className="h-4 w-4" /> Telecharger PDF / Imprimer
                  </Button>
                </div>
              </div>

              {/* Printable Official Document */}
              <div ref={printRef} className="p-8 bg-white text-slate-900 font-sans space-y-6 border rounded-2xl mt-4 shadow-sm print:shadow-none print:border-none">
                {/* Header */}
                <div className="flex justify-between items-start border-b pb-4">
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-wider text-indigo-950">RÉPUBLIQUE DE CÔTE D&apos;IVOIRE</h2>
                    <p className="text-xs text-slate-500 font-semibold uppercase">Ministère de l&apos;Éducation Nationale et de l&apos;Alphabétisation</p>
                    <p className="text-sm font-bold text-indigo-800 mt-2">ÉTABLISSEMENT : MonÉcole+</p>
                  </div>
                  <div className="text-right">
                    <h3 className="text-lg font-black text-slate-800">BULLETIN DE NOTES</h3>
                    <p className="text-xs font-bold text-indigo-600 uppercase">Trimestre {selectedSemester} - Année 2023-2024</p>
                  </div>
                </div>

                {/* Student Info */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm">
                  <div>
                    <p><span className="font-bold text-slate-500">Nom & Prénom :</span> <strong className="text-slate-900">{selectedStudentForPDF.name}</strong></p>
                    <p><span className="font-bold text-slate-500">Classe :</span> <strong>{currentClassName}</strong></p>
                  </div>
                  <div className="text-right">
                    <p><span className="font-bold text-slate-500">Moyenne Générale :</span> <strong className="text-primary text-base">{selectedStudentForPDF.avg.toFixed(2)} / 20</strong></p>
                    <p><span className="font-bold text-slate-500">Résultat :</span> <strong className={selectedStudentForPDF.avg >= 10 ? "text-emerald-600" : "text-rose-600"}>{selectedStudentForPDF.avg >= 10 ? "ADMIS" : "ÉCHEC"}</strong></p>
                  </div>
                </div>

                {/* Subjects Table */}
                <table className="w-full text-left border-collapse border border-slate-200 text-sm">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200">
                      <th className="p-3 font-bold border-r">Matière</th>
                      <th className="p-3 font-bold text-center border-r">Notes</th>
                      <th className="p-3 font-bold text-center border-r">Moyenne / 20</th>
                      <th className="p-3 font-bold">Appréciation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedStudentForPDF.notes && selectedStudentForPDF.notes.length > 0 ? (
                      selectedStudentForPDF.notes.map((n: any, idx: number) => (
                        <tr key={idx} className="border-b border-slate-200">
                          <td className="p-3 font-bold border-r">{n.matiere}</td>
                          <td className="p-3 text-center border-r font-medium">{n.valeur}/20</td>
                          <td className="p-3 text-center font-bold border-r">{n.valeur.toFixed(2)}</td>
                          <td className="p-3 text-xs italic text-slate-600">
                            {n.valeur >= 16 ? "Excellent travail" : n.valeur >= 14 ? "Très Bon travail" : n.valeur >= 12 ? "Bon travail" : n.valeur >= 10 ? "Passable" : "Insuffisant"}
                          </td>
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

                {/* Footer Signatures */}
                <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 text-center text-sm">
                  <div>
                    <p className="font-bold text-slate-600">Signature du Parent</p>
                    <div className="h-16 border-b border-dashed border-slate-300 mt-2"></div>
                  </div>
                  <div>
                    <p className="font-bold text-slate-600">Le Chef d&apos;Établissement</p>
                    <div className="h-16 border-b border-dashed border-slate-300 mt-2 flex items-center justify-center italic text-xs text-slate-400">
                      [ Cachet & Signature Officielle ]
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
