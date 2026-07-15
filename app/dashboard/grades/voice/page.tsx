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
  Search
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { Progress } from "@/components/ui/progress"
import { saveGrades, getClasses, getEvaluationsByClass, getStudentsByClass } from "@/lib/grades-actions"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

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
  
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    // Fetch initial data
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
      }
      fetchEvs()
    }
  }, [selectedClass])

  const startRecording = () => {
    if (!recognitionRef.current) return toast.error("Navigateur non supporté")
    if (!selectedEval) return toast.error("Sélectionnez d'abord une évaluation")
    setIsRecording(true)
    recognitionRef.current.start()
  }

  const stopRecording = () => {
    setIsRecording(false)
    recognitionRef.current.stop()
  }

  const parseTranscript = (text: string) => {
    const words = text.toLowerCase().split(' ')
    const numIdx = words.findIndex(w => !isNaN(parseFloat(w.replace(',', '.'))))
    
    if (numIdx !== -1) {
      const searchName = words.slice(0, numIdx).join(' ').trim()
      const rawGrade = words[numIdx].replace(',', '.')
      
      // Find closest student match
      const student = students.find(s => s.nom.toLowerCase().includes(searchName))
      if (student) {
        setResults(prev => {
          if (prev.find(r => r.id === student.id)) return prev
          return [{ id: student.id, name: student.nom, grade: rawGrade }, ...prev]
        })
      }
    }
  }

  const handleSave = async () => {
    if (!selectedEval) return
    setIsProcessing(true)
    const grades = results.map(r => ({
      studentId: r.id,
      value: parseFloat(r.grade)
    }))

    const res = await saveGrades(parseInt(selectedEval), grades)
    if (res.success) {
      toast.success("Notes vocales enregistrées !")
      setResults([])
      setTranscript("")
    } else {
      toast.error(res.error)
    }
    setIsProcessing(false)
  }

  return (
    <>
      <DashboardHeader title="Saisie Vocale 🎤" subtitle="Dictez les notes directement">
        <Link href="/dashboard/grades">
          <Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" /> Retour</Button>
        </Link>
      </DashboardHeader>

      <main className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 max-w-4xl mx-auto">
          <div className="space-y-2">
            <Label>Classe</Label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger><SelectValue placeholder="Choisir une classe" /></SelectTrigger>
              <SelectContent>
                {classes.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.nom}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Évaluation</Label>
            <Select value={selectedEval} onValueChange={setSelectedEval} disabled={!selectedClass}>
              <SelectTrigger><SelectValue placeholder="Choisir une évaluation" /></SelectTrigger>
              <SelectContent>
                {evaluations.map(e => (
                  <SelectItem key={e.id} value={e.id.toString()}>
                    {e.matiere} - {new Date(e.date_eval).toLocaleDateString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <Card className={`border-2 transition-all duration-500 ${isRecording ? 'border-primary shadow-xl' : ''}`}>
            <CardContent className="p-10 flex flex-col items-center gap-6">
              <div className={`h-20 w-20 rounded-full flex items-center justify-center ${isRecording ? 'bg-primary text-white animate-pulse' : 'bg-muted text-muted-foreground'}`}>
                {isRecording ? <Mic className="h-8 w-8" /> : <MicOff className="h-8 w-8" />}
              </div>
              <Button size="lg" variant={isRecording ? "destructive" : "default"} onClick={isRecording ? stopRecording : startRecording}>
                {isRecording ? "Arrêter la saisie" : "Démarrer la saisie vocale"}
              </Button>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-primary/5">
              <CardHeader><CardTitle className="text-md">Transcription</CardTitle></CardHeader>
              <CardContent>
                <div className="h-40 overflow-y-auto p-4 bg-white rounded border text-sm italic">
                  {transcript || "Parlez pour transcrire..."}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-md">Résultats ({results.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-40 overflow-y-auto space-y-2">
                  {results.map((res, i) => (
                    <div key={i} className="flex justify-between p-2 bg-muted/50 rounded-lg text-sm">
                      <span className="font-bold">{res.name}</span>
                      <span className="text-primary font-black">{res.grade}/20</span>
                    </div>
                  ))}
                </div>
                {results.length > 0 && (
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={handleSave} disabled={isProcessing}>
                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer les notes"}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  )
}
