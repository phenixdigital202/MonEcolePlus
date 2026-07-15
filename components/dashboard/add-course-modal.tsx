"use client"

import { useState, useTransition } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
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
import { addCourse } from "@/lib/schedule-actions"
import { toast } from "sonner"

interface Class {
  id: number
  nom: string
}

interface Teacher {
  id: number
  nom: string
}

interface AddCourseModalProps {
  isOpen: boolean
  onClose: () => void
  classes: Class[]
  teachers: Teacher[]
}

export function AddCourseModal({ isOpen, onClose, classes, teachers }: AddCourseModalProps) {
  const [isPending, startTransition] = useTransition()
  const [formData, setFormData] = useState({
    id_classe: "",
    id_enseignant: "",
    matiere: "",
    jour: "Lundi",
    heure_debut: "08:00",
    heure_fin: "10:00",
    salle: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const data = new FormData()
    Object.entries(formData).forEach(([key, value]) => data.append(key, value))

    startTransition(async () => {
      const result = await addCourse(data)
      if (result.success) {
        toast.success("Cours ajouté avec succès")
        onClose()
      } else {
        toast.error(result.error || "Une erreur est survenue")
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajouter un cours</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="class">Classe</Label>
            <Select 
              value={formData.id_classe} 
              onValueChange={(v) => setFormData(f => ({...f, id_classe: v}))}
              required
            >
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

          <div className="grid gap-2">
            <Label htmlFor="teacher">Enseignant</Label>
            <Select 
              value={formData.id_enseignant} 
              onValueChange={(v) => setFormData(f => ({...f, id_enseignant: v}))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir un enseignant" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map(t => (
                  <SelectItem key={t.id} value={t.id.toString()}>{t.nom}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="subject">Matière</Label>
            <Input 
              id="subject"
              placeholder="Ex: Mathématiques" 
              value={formData.matiere}
              onChange={(e) => setFormData(f => ({...f, matiere: e.target.value}))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="day">Jour</Label>
              <Select 
                value={formData.jour} 
                onValueChange={(v) => setFormData(f => ({...f, jour: v}))}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lundi">Lundi</SelectItem>
                  <SelectItem value="Mardi">Mardi</SelectItem>
                  <SelectItem value="Mercredi">Mercredi</SelectItem>
                  <SelectItem value="Jeudi">Jeudi</SelectItem>
                  <SelectItem value="Vendredi">Vendredi</SelectItem>
                  <SelectItem value="Samedi">Samedi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="room">Salle</Label>
              <Input 
                id="room"
                placeholder="Ex: 101" 
                value={formData.salle}
                onChange={(e) => setFormData(f => ({...f, salle: e.target.value}))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="start">Début</Label>
              <Input 
                id="start"
                type="time" 
                value={formData.heure_debut}
                onChange={(e) => setFormData(f => ({...f, heure_debut: e.target.value}))}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end">Fin</Label>
              <Input 
                id="end"
                type="time" 
                value={formData.heure_fin}
                onChange={(e) => setFormData(f => ({...f, heure_fin: e.target.value}))}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Enregistrement..." : "Ajouter au planning"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
