"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldAlert, Loader2, Save } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { updateAlertSettings } from "./actions"
import { toast } from "sonner"

import { TemplateDialog } from "./template-dialog"

interface AlertConfigCardProps {
  initialSmsEnabled: boolean
  initialEmailEnabled: boolean
}

export function AlertConfigCard({ initialSmsEnabled, initialEmailEnabled }: AlertConfigCardProps) {
  const [smsEnabled, setSmsEnabled] = useState(initialSmsEnabled)
  const [emailEnabled, setEmailEnabled] = useState(initialEmailEnabled)
  const [isPending, setIsPending] = useState(false)

  const handleSave = async () => {
    setIsPending(true)
    const result = await updateAlertSettings({ smsEnabled, emailEnabled })
    setIsPending(false)

    if (result.success) {
      toast.success("Paramètres mis à jour avec succès")
    } else {
      toast.error(result.error || "Une erreur est survenue")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-primary" />
          Configuration SMS/Email
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Alerte SMS immédiate</span>
            <Switch 
              checked={smsEnabled} 
              onCheckedChange={setSmsEnabled} 
              disabled={isPending}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Alerte Email parents</span>
            <Switch 
              checked={emailEnabled} 
              onCheckedChange={setEmailEnabled} 
              disabled={isPending}
            />
          </div>
        </div>
        <div className="p-4 rounded-lg bg-amber-50 border border-amber-100 text-xs text-amber-700 leading-relaxed">
          <strong>Logique :</strong> Les alertes sont déclenchées automatiquement 15 minutes après le début du cours si l'élève est marqué absent non justifié.
        </div>
        
        <div className="grid gap-2">
          <Button 
            className="w-full" 
            onClick={handleSave} 
            disabled={isPending || (smsEnabled === initialSmsEnabled && emailEnabled === initialEmailEnabled)}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Enregistrer les modifications
          </Button>
          
          <TemplateDialog />
        </div>
      </CardContent>
    </Card>
  )
}
