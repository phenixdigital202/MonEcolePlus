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
  SelectValue,
} from "@/components/ui/select"
import { createClass } from "@/lib/classes-actions"
import { toast } from "sonner"
import { Loader2, PlusCircle } from "lucide-react"

const NIVEAUX = [
  // Primaire
  "CP1", "CP2", "CE1", "CE2", "CM1", "CM2",
  // Collège
  "6ème", "5ème", "4ème", "3ème",
  // Lycée
  "Seconde", "Première", "Terminale"
]

interface AddClassModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddClassModal({ isOpen, onClose }: AddClassModalProps) {
  const [isPending, startTransition] = useTransition()
  const [nom, setNom] = useState("")
  const [niveau, setNiveau] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!nom || !niveau) return toast.error("Veuillez remplir tous les champs")

    const formData = new FormData()
    formData.append("nom", nom)
    formData.append("niveau", niveau)

    startTransition(async () => {
      const result = await createClass(formData)
      if (result.success) {
        toast.success("Classe créée avec succès")
        setNom("")
        setNiveau("")
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
              <PlusCircle className="h-6 w-6 text-primary" />
            </div>
            Nouvelle Classe
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="nom" className="text-sm font-semibold">Nom de la classe</Label>
              <Input 
                id="nom"
                placeholder="Ex: 3ème A / Terminale S1" 
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="h-12 border-primary/20 focus-visible:ring-primary"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="niveau" className="text-sm font-semibold">Niveau scolaire</Label>
              <Select value={niveau} onValueChange={setNiveau}>
                <SelectTrigger id="niveau" className="h-12 border-primary/20 focus-visible:ring-primary">
                  <SelectValue placeholder="Sélectionnez un niveau" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {NIVEAUX.map((niv) => (
                    <SelectItem key={niv} value={niv}>
                      {niv}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  Création...
                </>
              ) : (
                "Créer la classe"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
