"use client"

import { useState, useEffect } from "react"
import { getTickets } from "@/lib/saas-admin-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TicketCheck, CheckCircle2, Clock, AlertTriangle } from "lucide-react"

export default function SupportPage() {
  const [tickets, setTickets] = useState<any[]>([])

  useEffect(() => {
    getTickets().then(res => {
      if (res.success && res.data) setTickets(res.data)
    })
  }, [])

  return (
    <div className="p-8 space-y-8 bg-[#09090b] text-white min-h-screen">
      <div className="flex flex-col gap-1.5 border-b border-[#27272a] pb-6">
        <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
          Tickets de Support
        </h1>
        <p className="text-[#a1a1aa] text-sm">Visualisez les requêtes de support technique soumises par les écoles partenaires.</p>
      </div>

      <div className="grid gap-6">
        {tickets.map((t) => (
          <Card key={t.id} className="border-[#27272a] bg-[#18181b] text-white p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-indigo-400">{t.ecole}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                    {t.priorite}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">{t.sujet}</h3>
                <p className="text-xs text-[#a1a1aa]">Créé le : {t.date}</p>
              </div>

              <div className="flex items-center gap-2">
                {t.statut === "ouvert" ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                    <AlertTriangle className="h-3 w-3" />
                    Ouvert
                  </span>
                ) : t.statut === "en_cours" ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                    <Clock className="h-3 w-3" />
                    En cours
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="h-3 w-3" />
                    Résolu
                  </span>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
