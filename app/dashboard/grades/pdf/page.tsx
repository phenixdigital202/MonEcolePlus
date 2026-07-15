"use client"

import { useState, useEffect } from "react"
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
  AlertTriangle
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

export default function BulletinPDFPage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [selectedSemester, setSelectedSemester] = useState("1")
  const [selectedClass, setSelectedClass] = useState("")
  const [classes, setClasses] = useState<any[]>([])
  const [previewData, setPreviewData] = useState<any[]>([])

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
    
    // Fetch real students and their notes for this class
    const response = await fetch(`/api/grades/report-data?classId=${selectedClass}&semester=${selectedSemester}`)
    const data = await response.json()
    
    setPreviewData(data)
    
    setTimeout(() => {
      setIsGenerating(false)
      setShowPreview(true)
    }, 1500)
  }

  return (
    <>
      <DashboardHeader 
        title="Génération de Bulletins PDF" 
        subtitle="Créez et exportez les bulletins semestriels officiels"
      />
      
      <main className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Controls */}
          <Card className="md:col-span-1 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg font-black">Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">Période</label>
                <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Trimestre 1</SelectItem>
                    <SelectItem value="2">Trimestre 2</SelectItem>
                    <SelectItem value="3">Trimestre 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">Classe</label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Choisir une classe" /></SelectTrigger>
                  <SelectContent>
                    {classes.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.nom}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                className="w-full h-12 shadow-lg rounded-xl bg-primary hover:bg-primary/90 transition-all" 
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

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 text-xs flex gap-3">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <p>Les moyennes sont calculées dynamiquement sur la base de toutes les évaluations saisies pour ce trimestre.</p>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <Card className="md:col-span-2 border-none shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between bg-slate-50/50">
              <CardTitle className="text-lg font-black">État de la génération</CardTitle>
              {showPreview && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="rounded-lg">
                    <Printer className="h-4 w-4 mr-2" /> Tout imprimer
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="pt-6">
              {!showPreview ? (
                <div className="p-20 text-center border-2 border-dashed border-slate-200 rounded-3xl space-y-4">
                  <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                    <FileText className="h-10 w-10 text-slate-200" />
                  </div>
                  <p className="text-slate-400 font-medium tracking-tight">Sélectionnez une classe pour générer les rapports.</p>
                </div>
              ) : (
                <div className="space-y-4 h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {previewData.map((student, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-primary/30 hover:bg-slate-50/50 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary">
                          {student.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{student.name}</p>
                          <p className="text-xs text-slate-500 font-medium">Moyenne: <span className="font-bold text-primary">{student.avg.toFixed(2)}/20</span></p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${student.avg >= 10 ? 'bg-emerald-500' : 'bg-red-500'} border-0`}>
                          {student.avg >= 10 ? 'Admis' : 'Échec'}
                        </Badge>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 text-emerald-700 text-sm font-bold shadow-sm">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>{previewData.length} bulletins prêts pour export ou impression.</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
