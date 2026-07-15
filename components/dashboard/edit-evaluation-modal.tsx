"use client"

import { useState, useEffect } from "react"
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
import { updateEvaluationAction } from "@/lib/grades-actions"
import { toast } from "sonner"
import { Loader2, Calendar, Pencil } from "lucide-react"

interface EditEvaluationModalProps {
  isOpen: boolean
  onClose: () => void
  evaluation: any
  subjects: string[]
  onSuccess: (evaluation: any) => void
}

export function EditEvaluationModal({ 
  isOpen, 
  onClose, 
  evaluation,
  subjects,
  onSuccess 
}: EditEvaluationModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    matiere: "",
    date_eval: "",
    type_eval: 'devoir' as any,
    periode: 'Trimestre 1'
  })

  useEffect(() => {
    if (evaluation) {
      setFormData({
        matiere: evaluation.matiere || subjects[0] || "",
        date_eval: evaluation.date_eval ? new Date(evaluation.date_eval).toISOString().split('T')[0] : "",
        type_eval: evaluation.type_eval || 'devoir',
        periode: evaluation.periode || 'Trimestre 1'
      })
    }
  }, [evaluation, subjects])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!evaluation) return
    
    setLoading(true)
    
    const res = await updateEvaluationAction(evaluation.id, formData)

    if (res.success) {
      toast.success("Évaluation modifiée avec succès")
      onSuccess(res.evaluation)
      onClose()
    } else {
      toast.error(res.error)
    }
    setLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black flex items-center gap-2">
            <Pencil className="h-6 w-6 text-primary" />
            Modifier l'Évaluation
          </DialogTitle>
          <DialogDescription>
            Modifier les détails de l'évaluation du <span className="font-bold text-primary">{evaluation?.matiere}</span>
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-matiere">Matière</Label>
              <Select 
                value={formData.matiere} 
                onValueChange={(val) => setFormData(prev => ({ ...prev, matiere: val }))}
              >
                <SelectTrigger id="edit-matiere">
                  <SelectValue placeholder="Choisir une matière" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-date_eval">Date de l'épreuve</Label>
                <Input 
                  id="edit-date_eval" 
                  type="date" 
                  value={formData.date_eval}
                  onChange={(e) => setFormData(prev => ({ ...prev, date_eval: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-type_eval">Type</Label>
                <Select 
                  value={formData.type_eval} 
                  onValueChange={(val) => setFormData(prev => ({ ...prev, type_eval: val }))}
                >
                  <SelectTrigger id="edit-type_eval">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="devoir">Devoir</SelectItem>
                    <SelectItem value="controle">Contrôle</SelectItem>
                    <SelectItem value="examen">Examen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-periode">Période Académique</Label>
              <Select 
                value={formData.periode} 
                onValueChange={(val) => setFormData(prev => ({ ...prev, periode: val }))}
              >
                <SelectTrigger id="edit-periode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Trimestre 1">Trimestre 1</SelectItem>
                  <SelectItem value="Trimestre 2">Trimestre 2</SelectItem>
                  <SelectItem value="Trimestre 3">Trimestre 3</SelectItem>
                  <SelectItem value="Examen Final">Examen Final</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading} className="bg-primary shadow-lg shadow-primary/20">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Modification...
                </>
              ) : (
                "Enregistrer les modifications"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
