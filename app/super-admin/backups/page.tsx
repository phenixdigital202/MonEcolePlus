"use client"

import { useState, useEffect } from "react"
import { getBackupLogs, createBackup } from "@/lib/saas-admin-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, Plus, Download, CheckCircle, AlertTriangle } from "lucide-react"

export default function BackupsPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadBackups()
  }, [])

  const loadBackups = async () => {
    const res = await getBackupLogs()
    if (res.success && res.data) setLogs(res.data)
  }

  const handleBackup = async (type: string) => {
    setLoading(true)
    const res = await createBackup(type)
    setLoading(false)
    if (res.success) {
      loadBackups()
    }
  }

  return (
    <div className="p-8 space-y-8 bg-[#09090b] text-white min-h-screen">
      <div className="flex flex-col gap-1.5 border-b border-[#27272a] pb-6">
        <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
          Sauvegardes Globales
        </h1>
        <p className="text-[#a1a1aa] text-sm">Gérez et téléchargez les sauvegardes de sécurité de la base de données de MonÉcole+.</p>
      </div>

      <div className="flex flex-wrap gap-4">
        <Button onClick={() => handleBackup("database")} disabled={loading} className="bg-indigo-600 hover:bg-indigo-500 font-bold h-11 rounded-xl">
          <Plus className="h-4 w-4 mr-2" />
          Sauvegarde Base de Données
        </Button>
        <Button onClick={() => handleBackup("configuration")} disabled={loading} variant="outline" className="border-[#27272a] hover:bg-neutral-800 text-white font-bold h-11 rounded-xl">
          Sauvegarde Fichiers Config
        </Button>
      </div>

      <div className="border border-[#27272a] rounded-xl overflow-hidden bg-[#18181b]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#27272a] bg-[#09090b] text-[10px] uppercase font-bold tracking-wider text-[#a1a1aa]">
              <th className="p-4">Fichier</th>
              <th className="p-4">Type</th>
              <th className="p-4">Taille</th>
              <th className="p-4">Statut</th>
              <th className="p-4">Date de création</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#27272a] text-sm">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground text-xs">
                  Aucune sauvegarde disponible.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-neutral-900/50">
                  <td className="p-4 font-bold text-white">{log.filename}</td>
                  <td className="p-4 text-xs text-[#a1a1aa]">{log.backupType}</td>
                  <td className="p-4 text-xs text-[#a1a1aa]">{log.size}</td>
                  <td className="p-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      {log.status}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-[#a1a1aa]">
                    {new Date(log.createdAt).toLocaleString("fr")}
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
