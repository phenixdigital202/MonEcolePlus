"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, Shield, Globe, Mail } from "lucide-react"

export default function ConfigPage() {
  const [platformName, setPlatformName] = useState("MonÉcole+")
  const [supportEmail, setSupportEmail] = useState("support@mon-ecole-plus.ci")
  const [smtpServer, setSmtpServer] = useState("smtp.sendgrid.net")
  const [isMaintenance, setIsMaintenance] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="p-8 space-y-8 bg-[#09090b] text-white min-h-screen">
      <div className="flex flex-col gap-1.5 border-b border-[#27272a] pb-6">
        <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
          Configuration de la Plateforme
        </h1>
        <p className="text-[#a1a1aa] text-sm">Gérez les paramètres globaux de votre instance SaaS, les clés d&apos;API et le système.</p>
      </div>

      <div className="max-w-3xl">
        <Card className="border-[#27272a] bg-[#18181b] text-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Settings className="h-5 w-5 text-indigo-400" />
              Paramètres Généraux
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              {saved && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                  Paramètres sauvegardés avec succès !
                </div>
              )}
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#a1a1aa]">Nom de la plateforme</label>
                  <Input value={platformName} onChange={e => setPlatformName(e.target.value)} className="bg-[#09090b] border-[#27272a] text-white h-11" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#a1a1aa]">Adresse email de support</label>
                  <Input value={supportEmail} onChange={e => setSupportEmail(e.target.value)} className="bg-[#09090b] border-[#27272a] text-white h-11" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#a1a1aa]">Serveur SMTP de messagerie</label>
                  <Input value={smtpServer} onChange={e => setSmtpServer(e.target.value)} className="bg-[#09090b] border-[#27272a] text-white h-11" />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-[#27272a] bg-[#09090b]">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-white">Mode Maintenance</span>
                    <p className="text-xs text-[#a1a1aa]">Désactive temporairement l&apos;accès pour tous les établissements.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={isMaintenance} 
                    onChange={e => setIsMaintenance(e.target.checked)} 
                    className="h-5 w-5 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 font-bold h-11 rounded-xl">
                Enregistrer la configuration
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
