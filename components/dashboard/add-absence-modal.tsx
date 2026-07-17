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
import { Textarea } from "@/components/ui/textarea"
import { createAbsenceAction } from "@/lib/absences-actions"
import { getStudentsByClass, getClasses } from "@/lib/grades-actions"
import { toast } from "sonner"
import { Loader2, Calendar, User } from "lucide-react"

interface AddAbsenceModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  filteredClasses?: { id: number; nom: string }[]
}

export function AddAbsenceModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  filteredClasses
}: AddAbsenceModalProps) {
  const [loading, setLoading] = useState(false)
  const [classes, setClasses] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState("")
  
  const [formData, setFormData] = useState({
    id_eleve: "",
    date_absence: new Date().toISOString().split('T')[0],
    statut: 'non_justifie' as any,
    motif: ""
  })

  useEffect(() => {
    if (isOpen) {
      if (filteredClasses && filteredClasses.length > 0) {
        // Use teacher's filtered classes directly without calling getClasses()
        setClasses(filteredClasses)
      } else if (!filteredClasses) {
        // Admin: load all classes
        getClasses().then(setClasses)
      }
    }
  }, [isOpen, filteredClasses])

  useEffect(() => {
    if (selectedClass) {
      getStudentsByClass(parseInt(selectedClass)).then(setStudents)
    } else {
      setStudents([])
    }
  }, [selectedClass])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.id_eleve) return toast.error("Veuillez sélectionner un élève")
    
    setLoading(true)
    
    const res = await createAbsenceAction({
      ...formData,
      id_eleve: parseInt(formData.id_eleve)
    })

    if (res.success) {
      toast.success("Absence marquée avec succès")
      onSuccess()
      onClose()
      setFormData({
        id_eleve: "",
        date_absence: new Date().toISOString().split('T')[0],
        statut: 'non_justifie',
        motif: ""
      })
      setSelectedClass("")
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
            <Calendar className="h-6 w-6 text-primary" />
            Marquer une Absence
          </DialogTitle>
          <DialogDescription>
            Enregistrez une nouvelle absence pour un élève.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Classe</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Classe" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map(c => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Élève</Label>
              <Select 
                value={formData.id_eleve} 
                onValueChange={(val) => setFormData(prev => ({ ...prev, id_eleve: val }))}
                disabled={!selectedClass}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Élève" />
                </SelectTrigger>
                <SelectContent>
                  {students.map(s => (
                    <SelectItem key={s.id} value={s.id.toString()}>{s.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_absence">Date</Label>
              <Input 
                id="date_absence" 
                type="date" 
                value={formData.date_absence}
                onChange={(e) => setFormData(prev => ({ ...prev, date_absence: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select 
                value={formData.statut} 
                onValueChange={(val) => setFormData(prev => ({ ...prev, statut: val }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="non_justifie">Non justifiée</SelectItem>
                  <SelectItem value="en_attente">En attente</SelectItem>
                  <SelectItem value="justifie">Justifiée</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="motif">Motif / Observation</Label>
            <Textarea 
              id="motif" 
              placeholder="Raison de l'absence..."
              value={formData.motif}
              onChange={(e) => setFormData(prev => ({ ...prev, motif: e.target.value }))}
              className="min-h-[100px]"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading} className="bg-primary">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                "Marquer l'absence"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
