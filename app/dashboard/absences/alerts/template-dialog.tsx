"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, Send, Mail } from "lucide-react"
import { getAlertTemplates, updateAlertTemplates } from "./actions"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"

export function TemplateDialog() {
  const [smsTemplate, setSmsTemplate] = useState("")
  const [emailTemplate, setEmailTemplate] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [open, setOpen] = useState(false)

  const loadTemplates = async () => {
    setIsLoading(true)
    const data = await getAlertTemplates()
    setSmsTemplate(data.smsTemplate)
    setEmailTemplate(data.emailTemplate)
    setIsLoading(false)
  }

  useEffect(() => {
    if (open) {
      loadTemplates()
    }
  }, [open])

  const handleSave = async () => {
    setIsSaving(true)
    const result = await updateAlertTemplates({ smsTemplate, emailTemplate })
    setIsSaving(false)

    if (result.success) {
      toast.success("Modèles enregistrés")
      setOpen(false)
    } else {
      toast.error(result.error || "Erreur lors de l'enregistrement")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" variant="outline">
          Paramétrer les modèles
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modèles de notifications</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Send className="h-4 w-4 text-primary" />
              Modèle SMS
            </Label>
            <Textarea 
              value={smsTemplate} 
              onChange={(e) => setSmsTemplate(e.target.value)}
              placeholder="Ex: Cher parent, votre enfant {nom} est absent..."
              className="min-h-[100px]"
              disabled={isLoading || isSaving}
            />
            <p className="text-[10px] text-muted-foreground italic">
              Variable disponible : {"{nom}"}
            </p>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              Modèle Email
            </Label>
            <Textarea 
              value={emailTemplate} 
              onChange={(e) => setEmailTemplate(e.target.value)}
              placeholder="Ex: Bonjour, nous vous informons que..."
              className="min-h-[150px]"
              disabled={isLoading || isSaving}
            />
            <p className="text-[10px] text-muted-foreground italic">
              Variable disponible : {"{nom}"}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSaving}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={isLoading || isSaving}>
            {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Enregistrer les modèles
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
