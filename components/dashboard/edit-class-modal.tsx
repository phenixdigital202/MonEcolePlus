"use client"

import { useState, useTransition, useEffect } from "react"
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
import { updateClass } from "@/lib/classes-actions"
import { toast } from "sonner"
import { Loader2, Settings2 } from "lucide-react"

interface EditClassModalProps {
  isOpen: boolean
  onClose: () => void
  classData: { id: number; name: string; level: string } | null
}

export function EditClassModal({ isOpen, onClose, classData }: EditClassModalProps) {
  const [isPending, startTransition] = useTransition()
  const [nom, setNom] = useState("")
  const [niveau, setNiveau] = useState("")

  useEffect(() => {
    if (classData) {
      setNom(classData.name)
      setNiveau(classData.level)
    }
  }, [classData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!classData) return
    if (!nom || !niveau) return toast.error("Veuillez remplir tous les champs")

    const formData = new FormData()
    formData.append("nom", nom)
    formData.append("niveau", niveau)

    startTransition(async () => {
      const result = await updateClass(classData.id, formData)
      if (result.success) {
        toast.success("Classe modifiée avec succès")
        onClose()
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-primary/20 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Settings2 className="h-6 w-6 text-primary" />
            </div>
            Modifier la Classe
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-nom" className="text-sm font-semibold">Nom de la classe</Label>
              <Input 
                id="edit-nom"
                placeholder="Ex: 3ème A" 
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="h-12 border-primary/20 focus-visible:ring-primary"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-niveau" className="text-sm font-semibold">Niveau scolaire</Label>
              <Input 
                id="edit-niveau"
                placeholder="Ex: Collège" 
                value={niveau}
                onChange={(e) => setNiveau(e.target.value)}
                className="h-12 border-primary/20 focus-visible:ring-primary"
                required
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>
              Annuler
            </Button>
            <Button type="submit" disabled={isPending} className="px-8 shadow-lg shadow-primary/20">
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Mise à jour...
                </>
              ) : (
                "Enregistrer"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
