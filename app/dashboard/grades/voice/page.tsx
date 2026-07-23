"use client"

import { useState, useEffect, useRef } from "react"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Mic, 
  MicOff, 
  Volume2, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  ArrowLeft,
  Trash2,
  Save
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { saveGrades, getClasses, getEvaluationsByClass, getStudentsByClass } from "@/lib/grades-actions"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export default function VoiceGradesPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [results, setResults] = useState<{ id: number; name: string; grade: string }[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [classes, setClasses] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState("")
  const [evaluations, setEvaluations] = useState<any[]>([])
  const [selectedEval, setSelectedEval] = useState("")
  const [students, setStudents] = useState<any[]>([])
  const [isSupported, setIsSupported] = useState(true)
  
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      const cls = await getClasses()
      setClasses(cls)
    }
    fetchData()

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'fr-FR'

      recognitionRef.current.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            const final = event.results[i][0].transcript
            setTranscript(prev => prev + ' ' + final)
            parseTranscript(final)
          }
        }
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error)
        if (event.error === 'not-allowed') {
          toast.error("Accès au microphone refusé. Autorisez le micro dans votre navigateur.")
        }
        setIsRecording(false)
      }

      recognitionRef.current.onend = () => {
        setIsRecording(false)
      }
    } else {
      setIsSupported(false)
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop() } catch (e) {}
      }
    }
  }, [])

  useEffect(() => {
    if (selectedClass) {
      const fetchEvs = async () => {
        const id = parseInt(selectedClass)
        const [evs, stds] = await Promise.all([
          getEvaluationsByClass(id),
          getStudentsByClass(id)
        ])
        setEvaluations(evs)
        setStudents(stds)
        setSelectedEval("")
        setResults([])
      }
      fetchEvs()
    }
  }, [selectedClass])

  const startRecording = () => {
    if (!isSupported || !recognitionRef.current) {
      return toast.error("La reconnaissance vocale n'est pas supportée par votre navigateur (utilisez Chrome ou Edge).")
    }
    if (!selectedEval) {
      return toast.error("Veuillez sélectionner d'abord une classe et une évaluation.")
    }
    try {
      setIsRecording(true)
      recognitionRef.current.start()
      toast.info("Microphone activé. Dictez les noms et les notes (ex: 'Lucas Bernard 15.5')")
    } catch (e) {
      console.error(e)
      setIsRecording(false)
    }
  }

  const stopRecording = () => {
    setIsRecording(false)
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch (e) {}
    }
  }

  const parseTranscript = (text: string) => {
    const cleanText = text.replace(/,/g, '.')
    const words = cleanText.toLowerCase().split(' ')
    
    // Find numeric token
    const numIdx = words.findIndex(w => !isNaN(parseFloat(w)))
    
    if (numIdx !== -1) {
      const searchName = words.slice(0, numIdx).join(' ').trim()
      const rawGrade = parseFloat(words[numIdx])
      
      if (!isNaN(rawGrade) && rawGrade >= 0 && rawGrade <= 20) {
        const student = students.find(s => s.nom.toLowerCase().includes(searchName))
        if (student) {
          setResults(prev => {
            const filtered = prev.filter(r => r.id !== student.id)
            return [{ id: student.id, name: student.nom, grade: rawGrade.toString() }, ...filtered]
          })
          toast.success(`Note détectée : ${student.nom} -> ${rawGrade}/20`)
        }
      }
    }
  }

  const handleResultGradeChange = (id: number, val: string) => {
    setResults(prev => prev.map(r => r.id === id ? { ...r, grade: val } : r))
  }

  const handleRemoveResult = (id: number) => {
    setResults(prev => prev.filter(r => r.id !== id))
  }

  const handleSave = async () => {
    if (!selectedEval) return toast.error("Sélectionnez une évaluation")
    if (results.length === 0) return toast.error("Aucune note vocale détectée")

    const validGrades = results
      .map(r => ({ studentId: r.id, value: parseFloat(r.grade) }))
      .filter(g => !isNaN(g.value) && g.value >= 0 && g.value <= 20)

    if (validGrades.length === 0) {
      return toast.error("Aucune note valide (0 à 20)")
    }

    setIsProcessing(true)
    const res = await saveGrades(parseInt(selectedEval), validGrades)
    if (res.success) {
      toast.success("Notes vocales enregistrées avec succès en base de données !")
      setResults([])
      setTranscript("")
    } else {
      toast.error(res.error || "Erreur de sauvegarde")
    }
    setIsProcessing(false)
  }

  return (
    <>
      <DashboardHeader title="Saisie Vocale 🎤" subtitle="Dictez les notes directement au microphone">
        <Link href="/dashboard/grades">
          <Button variant="outline" className="rounded-xl"><ArrowLeft className="h-4 w-4 mr-2" /> Retour</Button>
        </Link>
      </DashboardHeader>

      <main className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto">
        {!isSupported && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 text-sm flex gap-3 items-center">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>La reconnaissance vocale Web Speech n&apos;est pas supportée par ce navigateur. Veuillez utiliser <strong>Google Chrome</strong> ou <strong>Microsoft Edge</strong>.</p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Classe</Label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Choisir une classe" /></SelectTrigger>
              <SelectContent className="rounded-xl">
                {classes.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.nom}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Évaluation</Label>
            <Select value={selectedEval} onValueChange={setSelectedEval} disabled={!selectedClass}>
              <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Choisir une évaluation" /></SelectTrigger>
              <SelectContent className="rounded-xl">
                {evaluations.map(e => (
                  <SelectItem key={e.id} value={e.id.toString()}>
                    {e.matiere} - {new Date(e.date_eval).toLocaleDateString("fr-FR")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className={`border-2 rounded-3xl transition-all duration-500 bg-white shadow-xl ${isRecording ? 'border-primary shadow-primary/10' : ''}`}>
          <CardContent className="p-8 md:p-12 flex flex-col items-center gap-6 text-center">
            <div className={`h-24 w-24 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-200' : 'bg-primary/10 text-primary'}`}>
              {isRecording ? <Mic className="h-10 w-10" /> : <MicOff className="h-10 w-10" />}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">
                {isRecording ? "Écoute en cours..." : "Saisie Vocale Prête"}
              </h3>
              <p className="text-sm text-slate-500 mt-1 max-w-md">
                Exemple de dictée : &quot;Lucas Bernard 15.5&quot; ou &quot;Aïcha Koné 18&quot;
              </p>
            </div>
            <Button 
              size="lg" 
              variant={isRecording ? "destructive" : "default"} 
              onClick={isRecording ? stopRecording : startRecording}
              className="rounded-2xl px-8 h-12 shadow-lg font-bold"
              disabled={!isSupported}
            >
              {isRecording ? "Arrêter la saisie vocale" : "Démarrer le microphone"}
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-none shadow-lg rounded-3xl bg-white overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b"><CardTitle className="text-sm font-bold uppercase text-slate-500">Transcription brute</CardTitle></CardHeader>
            <CardContent className="p-4">
              <div className="h-44 overflow-y-auto p-4 bg-slate-50 rounded-2xl border text-sm italic text-slate-700 leading-relaxed">
                {transcript || "Dictée en attente..."}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg rounded-3xl bg-white overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between bg-slate-50/50 border-b">
              <CardTitle className="text-sm font-bold uppercase text-slate-500">Notes Détectées ({results.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="h-44 overflow-y-auto space-y-2 pr-1">
                {results.length > 0 ? (
                  results.map((res) => (
                    <div key={res.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="font-bold text-xs text-slate-800">{res.name}</span>
                      <div className="flex items-center gap-2">
                        <Input 
                          type="number" 
                          step="0.25"
                          min="0"
                          max="20"
                          className="w-16 h-8 text-center font-bold text-xs rounded-xl"
                          value={res.grade}
                          onChange={(e) => handleResultGradeChange(res.id, e.target.value)}
                        />
                        <span className="text-xs font-bold text-slate-500">/20</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-slate-400 hover:text-rose-600 rounded-lg"
                          onClick={() => handleRemoveResult(res.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">
                    Aucune note détectée pour le moment.
                  </div>
                )}
              </div>
              {results.length > 0 && (
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl h-11 border-none shadow-lg gap-2" onClick={handleSave} disabled={isProcessing}>
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Enregistrer les notes en base
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
