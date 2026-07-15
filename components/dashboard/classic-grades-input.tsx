"use client"

import { useState, useTransition, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  getEvaluationsByClass, 
  getStudentsByClass, 
  getGradesByEvaluation,
  saveGrades 
} from "@/lib/grades-actions"
import { toast } from "sonner"
import { 
  Save, 
  Plus, 
  CheckCircle2, 
  Loader2,
  TrendingDown,
  TrendingUp,
  Award,
  AlertCircle
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { CreateEvaluationModal } from "./create-evaluation-modal"

interface ClassicGradesInputProps {
  classes: { id: number; nom: string }[]
  subjects: string[]
  globalStats: { average: number; count: number }
}

export function ClassicGradesInput({ classes, subjects, globalStats }: ClassicGradesInputProps) {
  const searchParams = useSearchParams()
  const [selectedClass, setSelectedClass] = useState(searchParams.get("classId") || "")
  const [evaluations, setEvaluations] = useState<any[]>([])
  const [selectedEval, setSelectedEval] = useState(searchParams.get("evalId") || "")
  const [students, setStudents] = useState<any[]>([])
  const [gradesMap, setGradesMap] = useState<Record<number, string>>({})
  const [commentsMap, setCommentsMap] = useState<Record<number, string>>({})
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filterDifficulty, setFilterDifficulty] = useState(false)

  // Fetch evaluations and students when class changes
  useEffect(() => {
    if (selectedClass) {
      setIsLoading(true)
      const id = parseInt(selectedClass)
      Promise.all([
        getEvaluationsByClass(id),
        getStudentsByClass(id)
      ]).then(([evs, stds]) => {
        setEvaluations(evs)
        setStudents(stds)
        // Reset evaluation if not in the new list
        if (selectedEval && !evs.find(e => e.id.toString() === selectedEval)) {
          setSelectedEval("")
        }
        setIsLoading(false)
      })
    }
  }, [selectedClass])

  // Fetch grades when evaluation changes
  useEffect(() => {
    if (selectedEval) {
      setIsLoading(true)
      getGradesByEvaluation(parseInt(selectedEval)).then((grades) => {
        const newGradesMap: Record<number, string> = {}
        const newCommentsMap: Record<number, string> = {}
        grades.forEach((g: any) => {
          newGradesMap[g.id_eleve] = g.valeur.toString()
          newCommentsMap[g.id_eleve] = g.commentaire || ""
        })
        setGradesMap(newGradesMap)
        setCommentsMap(newCommentsMap)
        setIsLoading(false)
      })
    } else {
      setGradesMap({})
      setCommentsMap({})
    }
  }, [selectedEval])

  const handleGradeChange = (studentId: number, value: string) => {
    // Validating 0-20
    const val = parseFloat(value)
    if (value !== "" && (isNaN(val) || val < 0 || val > 20)) return
    setGradesMap(prev => ({ ...prev, [studentId]: value }))
  }

  const handleCommentChange = (studentId: number, value: string) => {
    setCommentsMap(prev => ({ ...prev, [studentId]: value }))
  }

  const handleSave = () => {
    if (!selectedEval) return toast.error("Veuillez sélectionner une évaluation")
    
    const gradesToSave = Object.entries(gradesMap)
      .filter(([_, val]) => val !== "")
      .map(([id, val]) => ({
        studentId: parseInt(id),
        value: parseFloat(val),
        comment: commentsMap[parseInt(id)] || ""
      }))

    if (gradesToSave.length === 0) return toast.error("Aucune note saisie")

    startTransition(async () => {
      const result = await saveGrades(parseInt(selectedEval), gradesToSave)
      if (result.success) {
        toast.success("Notes enregistrées avec succès")
      } else {
        toast.error(result.error)
      }
    })
  }

  // Calculate dynamic stats
  const currentGrades = Object.values(gradesMap).map(v => parseFloat(v)).filter(v => !isNaN(v))
  const calculatedAverage = currentGrades.length > 0 
    ? (currentGrades.reduce((a, b) => a + b, 0) / currentGrades.length).toFixed(2) 
    : "0.00"
  const progression = students.length > 0 
    ? Math.round((currentGrades.length / students.length) * 100) 
    : 0

  return (
    <div className="space-y-6">
      {/* Selection Bar */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label>Classe</Label>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger>
              <SelectValue placeholder="Choisir une classe" />
            </SelectTrigger>
            <SelectContent>
              {classes.map(c => (
                <SelectItem key={c.id} value={c.id.toString()}>{c.nom}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Évaluation / Devoir</Label>
          <Select 
            value={selectedEval} 
            onValueChange={setSelectedEval}
            disabled={!selectedClass}
          >
            <SelectTrigger>
              <SelectValue placeholder={selectedClass ? "Choisir une évaluation" : "Sélectionnez d'abord une classe"} />
            </SelectTrigger>
            <SelectContent>
              <div className="max-h-[300px] overflow-y-auto">
                {evaluations.map(e => (
                  <SelectItem key={e.id} value={e.id.toString()}>
                    {e.matiere} - {new Date(e.date_eval).toLocaleDateString()}
                  </SelectItem>
                ))}
                <div 
                  className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 font-bold text-primary border-t mt-1 hover:bg-primary/5 cursor-pointer"
                  onClick={() => setIsModalOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" /> Créer une nouvelle évaluation
                </div>
              </div>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button 
            className="w-full shadow-lg h-10" 
            onClick={handleSave} 
            disabled={isPending || !selectedEval || students.length === 0}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Enregistrer les notes
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Input Table */}
        <Card className="lg:col-span-2 overflow-hidden border-primary/20 shadow-xl">
          <CardHeader className="bg-primary/5 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Saisie des résultats
            </CardTitle>
            {selectedClass && (
              <span className="text-xs font-semibold px-2 py-1 rounded bg-background border">
                {students.length} élèves
              </span>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Chargement des élèves...</p>
              </div>
            ) : students.length > 0 ? (
              <table className="w-full">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="py-3 px-6 text-left text-xs font-bold uppercase tracking-wider">Élève</th>
                    <th className="py-3 px-6 text-center text-xs font-bold uppercase tracking-wider w-32">Note / 20</th>
                    <th className="py-3 px-6 text-left text-xs font-bold uppercase tracking-wider">Commentaire</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {students.map((student) => {
                    const gradeVal = parseFloat(gradesMap[student.id] || "0")
                    const isAtRisk = filterDifficulty && gradeVal < 10 && gradesMap[student.id] !== ""
                    
                    return (
                      <tr key={student.id} className={`hover:bg-primary/5 transition-colors group ${isAtRisk ? 'bg-red-500/10' : ''}`}>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className={`h-9 w-9 rounded-full flex items-center justify-center font-bold group-hover:scale-110 transition-transform ${isAtRisk ? 'bg-red-500 text-white' : 'bg-primary/10 text-primary'}`}>
                              {student.nom.split(" ").map((n: string) => n[0]).join("")}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-foreground">{student.nom}</span>
                              {isAtRisk && <span className="text-[10px] text-red-600 font-bold uppercase">En difficulté</span>}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Input 
                            type="number"
                            step="0.25"
                            min="0"
                            max="20"
                            placeholder="--"
                            className={`w-20 mx-auto text-center font-bold h-10 ${isAtRisk ? 'border-red-500 text-red-600 focus-visible:ring-red-500' : 'border-primary/30 text-primary'}`}
                            value={gradesMap[student.id] || ""}
                            onChange={(e) => handleGradeChange(student.id, e.target.value)}
                          />
                        </td>
                        <td className="py-4 px-6">
                          <Input 
                            placeholder="Observation..." 
                            className="bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary"
                            value={commentsMap[student.id] || ""}
                            onChange={(e) => handleCommentChange(student.id, e.target.value)}
                          />
                        </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            ) : (
              <div className="p-20 text-center text-muted-foreground">
                {selectedClass ? "Aucun élève trouvé dans cette classe." : "Sélectionnez une classe pour commencer la saisie."}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats & Tools */}
        <div className="space-y-6">
          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardHeader>
              <CardTitle className="text-md flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                Statistiques de Saisie
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">Moyenne calculée</span>
                <span className="font-bold text-lg">{calculatedAverage}/20</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">Progression</span>
                <span className="font-bold">{progression}%</span>
              </div>
              <div className="h-2 w-full bg-emerald-500/10 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${progression}%` }} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardHeader>
              <CardTitle className="text-md flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-500" />
                Actions Rapides
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className={`w-full justify-start border-amber-500/20 transition-all ${filterDifficulty ? 'bg-amber-500 text-white' : 'hover:bg-amber-500 hover:text-white'}`}
                onClick={() => setFilterDifficulty(!filterDifficulty)}
              >
                {filterDifficulty ? <AlertCircle className="h-4 w-4 mr-2" /> : <TrendingDown className="h-4 w-4 mr-2" />}
                {filterDifficulty ? "Afficher tous les élèves" : "Identifier les élèves en difficulté"}
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start border-amber-500/20 hover:bg-amber-500 hover:text-white transition-all"
                onClick={() => setIsModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer une nouvelle évaluation
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <CreateEvaluationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        classId={parseInt(selectedClass)}
        className={classes.find(c => c.id === parseInt(selectedClass))?.nom || ""}
        subjects={subjects}
        onSuccess={(ev) => {
          setEvaluations(prev => [ev, ...prev])
          setSelectedEval(ev.id.toString())
        }}
      />
    </div>
  )
}
