"use client"

import { useState } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog"
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
import { createEvaluationAction } from "@/lib/grades-actions"
import { toast } from "sonner"
import { Loader2, Calendar } from "lucide-react"

interface CreateEvaluationModalProps {
  isOpen: boolean
  onClose: () => void
  classId?: number
  className?: string
  classes?: { id: number; nom: string }[]
  subjects: string[]
  onSuccess: (evaluation: any) => void
}

export function CreateEvaluationModal({ 
  isOpen, 
  onClose, 
  classId, 
  className,
  classes = [],
  subjects,
  onSuccess 
}: CreateEvaluationModalProps) {
  const [loading, setLoading] = useState(false)
  const [selectedClassId, setSelectedClassId] = useState<string>(classId ? classId.toString() : (classes[0]?.id?.toString() || ""))
  const [formData, setFormData] = useState({
    matiere: subjects[0] || "Mathématiques",
    date_eval: new Date().toISOString().split('T')[0],
    type_eval: 'devoir' as any,
    periode: 'Trimestre 1'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const targetClassId = classId || parseInt(selectedClassId)
    if (!targetClassId || isNaN(targetClassId)) {
      return toast.error("Veuillez choisir une classe")
    }

    setLoading(true)
    
    const res = await createEvaluationAction({
      id_classe: targetClassId,
      ...formData
    })

    if (res.success) {
      toast.success("Évaluation créée avec succès")
      onSuccess(res.evaluation)
      onClose()
    } else {
      toast.error(res.error || "Erreur lors de la création")
    }
    setLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Nouvelle Évaluation
          </DialogTitle>
          <DialogDescription>
            Créez un nouveau devoir ou examen {className ? `pour ${className}` : ''}.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {(!classId || classId === 0) && classes.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="select_class">Classe</Label>
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger id="select_class" className="rounded-xl">
                  <SelectValue placeholder="Choisir une classe" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {classes.map(c => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="matiere">Matière</Label>
            <Select 
              value={formData.matiere} 
              onValueChange={(val) => setFormData(prev => ({ ...prev, matiere: val }))}
            >
              <SelectTrigger id="matiere" className="rounded-xl">
                <SelectValue placeholder="Choisir une matière" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {subjects.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_eval">Date de l&apos;épreuve</Label>
              <Input 
                id="date_eval" 
                type="date" 
                className="rounded-xl"
                value={formData.date_eval}
                onChange={(e) => setFormData(prev => ({ ...prev, date_eval: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type_eval">Type</Label>
              <Select 
                value={formData.type_eval} 
                onValueChange={(val) => setFormData(prev => ({ ...prev, type_eval: val }))}
              >
                <SelectTrigger id="type_eval" className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="devoir">Devoir</SelectItem>
                  <SelectItem value="controle">Contrôle</SelectItem>
                  <SelectItem value="examen">Examen</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="periode">Période Académique</Label>
            <Select 
              value={formData.periode} 
              onValueChange={(val) => setFormData(prev => ({ ...prev, periode: val }))}
            >
              <SelectTrigger id="periode" className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="Trimestre 1">Trimestre 1</SelectItem>
                <SelectItem value="Trimestre 2">Trimestre 2</SelectItem>
                <SelectItem value="Trimestre 3">Trimestre 3</SelectItem>
                <SelectItem value="Examen Final">Examen Final</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading} className="rounded-xl">
              Annuler
            </Button>
            <Button type="submit" disabled={loading} className="bg-primary text-white rounded-xl shadow-lg border-none">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                "Créer l'évaluation"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
