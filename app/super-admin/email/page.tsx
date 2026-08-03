"use client"

import { useState, useEffect } from "react"
import { getEmailLogs } from "@/lib/saas-admin-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Calendar, CheckCircle } from "lucide-react"

export default function EmailPage() {
  const [logs, setLogs] = useState<any[]>([])

  useEffect(() => {
    getEmailLogs().then(res => {
      if (res.success && res.data) setLogs(res.data)
    })
  }, [])

  return (
    <div className="p-8 space-y-8 bg-[#09090b] text-white min-h-screen">
      <div className="flex flex-col gap-1.5 border-b border-[#27272a] pb-6">
        <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
          Portail Email
        </h1>
        <p className="text-[#a1a1aa] text-sm">Visualisez l&apos;historique d&apos;envoi des courriels et des alertes administratives.</p>
      </div>

      <div className="border border-[#27272a] rounded-xl overflow-hidden bg-[#18181b]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#27272a] bg-[#09090b] text-[10px] uppercase font-bold tracking-wider text-[#a1a1aa]">
              <th className="p-4">Destinataire</th>
              <th className="p-4">Sujet</th>
              <th className="p-4">Statut</th>
              <th className="p-4">Date d&apos;envoi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#27272a] text-sm">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground text-xs">
                  Aucun courriel envoyé.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-neutral-900/50">
                  <td className="p-4 font-bold text-white">{log.to}</td>
                  <td className="p-4 text-xs text-[#a1a1aa] max-w-xs truncate">{log.subject}</td>
                  <td className="p-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      {log.status}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-[#a1a1aa]">
                    {new Date(log.sentAt).toLocaleString("fr")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
