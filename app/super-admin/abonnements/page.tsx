"use client"

import { useState, useEffect } from "react"
import { getTarifPlans } from "@/lib/saas-admin-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, Check, Sparkles } from "lucide-react"

export default function AbonnementsPage() {
  const [plans, setPlans] = useState<any[]>([])

  useEffect(() => {
    getTarifPlans().then(res => {
      if (res.success && res.data) setPlans(res.data)
    })
  }, [])

  return (
    <div className="p-8 space-y-8 bg-[#09090b] text-white min-h-screen">
      <div className="flex flex-col gap-1.5 border-b border-[#27272a] pb-6">
        <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
          Gestion des Abonnements
        </h1>
        <p className="text-[#a1a1aa] text-sm">Visualisez les plans d&apos;abonnements, la tarification et les limites d&apos;inscriptions.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((p) => (
          <Card key={p.id} className="border-[#27272a] bg-[#18181b] text-white flex flex-col justify-between p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">{p.name}</h3>
                {p.price > 70000 && (
                  <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                    Populaire
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black">{p.price.toLocaleString("fr")}</span>
                <span className="text-xs text-[#a1a1aa]">FCFA / {p.currency === "FCFA" ? "mois" : "an"}</span>
              </div>
              <p className="text-xs text-[#a1a1aa]">Limite d&apos;élèves : {p.maxStudents === -1 ? "Illimité" : p.maxStudents}</p>
              <div className="h-px bg-[#27272a]" />
              <ul className="space-y-2 text-xs text-[#a1a1aa]">
                {p.features.map((f: string, j: number) => (
                  <li key={j} className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
