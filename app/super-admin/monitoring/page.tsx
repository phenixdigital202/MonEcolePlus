"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Server, Activity, Cpu, HardDrive } from "lucide-react"

export default function MonitoringPage() {
  const metrics = [
    { title: "Statut Serveur Vercel", value: "En ligne", status: "success", icon: Server },
    { title: "Utilisation CPU", value: "14%", status: "success", icon: Cpu },
    { title: "Utilisation RAM", value: "1.2 GB / 8 GB", status: "success", icon: Activity },
    { title: "Uptime Global", value: "99.97%", status: "success", icon: Activity },
    { title: "Base de données", value: "Opérationnelle (Supabase)", status: "success", icon: HardDrive }
  ]

  return (
    <div className="p-8 space-y-8 bg-[#09090b] text-white min-h-screen">
      <div className="flex flex-col gap-1.5 border-b border-[#27272a] pb-6">
        <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
          Monitoring Système
        </h1>
        <p className="text-[#a1a1aa] text-sm">Visualisez l&apos;état des serveurs, l&apos;utilisation des ressources et le statut de la base de données.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {metrics.map((m, i) => (
          <Card key={i} className="border-[#27272a] bg-[#18181b] text-white p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <m.icon className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-bold">{m.title}</p>
                <p className="text-xl font-black text-white">{m.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
