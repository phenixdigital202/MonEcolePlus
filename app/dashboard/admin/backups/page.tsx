"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Database,
  History, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Play,
  RotateCcw,
  ShieldCheck,
  FolderArchive,
  Download,
  AlertTriangle
} from "lucide-react"
import { toast } from "sonner"
import { getBackupHistory, getBackupFiles, triggerManualBackup, triggerRestore } from "@/lib/backup-actions"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

export default function BackupsAdminPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [files, setFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [backingUp, setBackingUp] = useState(false)
  const [restoringFile, setRestoringFile] = useState<string | null>(null)
  const [restoring, setRestoring] = useState(false)

  // Load logs and files list
  async function loadData() {
    setLoading(true)
    const [logsRes, filesRes] = await Promise.all([
      getBackupHistory(),
      getBackupFiles()
    ])
    if (logsRes.success && logsRes.data) {
      setLogs(logsRes.data)
    }
    if (filesRes.success && filesRes.data) {
      setFiles(filesRes.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  // Handle manual backup trigger
  async function handleBackup() {
    setBackingUp(true)
    const res = await triggerManualBackup()
    if (res.success) {
      toast.success(`Sauvegarde créée avec succès : ${res.filename} (${res.size})`)
      loadData()
    } else {
      toast.error(res.error || "Échec de la sauvegarde")
    }
    setBackingUp(false)
  }

  // Handle restore trigger
  async function handleRestore() {
    if (!restoringFile) return
    setRestoring(true)
    const res = await triggerRestore(restoringFile)
    if (res.success) {
      toast.success("Restauration complète effectuée avec succès !")
      setRestoringFile(null)
      loadData()
    } else {
      toast.error(res.error || "Échec de la restauration")
    }
    setRestoring(false)
  }

  return (
    <>
      <DashboardHeader 
        title="Système de Sauvegarde & Restauration" 
        subtitle="Sécurisez vos données SaaS grâce aux sauvegardes chiffrées automatiques"
      />
      
      <main className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        
        {/* Metric widgets */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { name: "Sauvegardes Actives", value: files.length, icon: FolderArchive, gradient: "from-blue-600 to-indigo-600" },
            { name: "Taille Totale Stockée", value: files.length > 0 ? `${(files.reduce((acc, curr) => acc + parseFloat(curr.size), 0)).toFixed(2)} KB` : "0 KB", icon: Database, gradient: "from-emerald-500 to-teal-600" },
            { name: "État du Chiffrement", value: "AES-256", icon: ShieldCheck, gradient: "from-purple-600 to-pink-600" },
            { name: "Rotation", value: "7 jours", icon: RefreshCw, gradient: "from-amber-500 to-orange-600" },
          ].map((stat, i) => (
            <Card key={i} className={`group relative overflow-hidden border-none bg-gradient-to-br ${stat.gradient} text-white shadow-xl hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 rounded-3xl`}>
              <div className="absolute top-0 right-0 -mr-6 -mt-6 h-24 w-24 rounded-full bg-white/10 blur-xl transition-all group-hover:scale-125" />
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="h-11 w-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <stat.icon className="h-5.5 w-5.5 text-white" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-black tracking-tight">{stat.value}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/85 mt-1">{stat.name}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Backups Panel Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* Quick Actions */}
          <Card className="lg:col-span-1 border-none shadow-xl bg-white rounded-3xl overflow-hidden">
            <CardHeader className="bg-primary/5 border-b pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                <Play className="h-4.5 w-4.5 text-primary" />
                Actions Immédiates
              </CardTitle>
              <CardDescription className="text-xs">Lancez manuellement des opérations d&apos;urgence</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-500 leading-relaxed">
                Les sauvegardes sont compressées et chiffrées en AES-256 à la volée. Elles intègrent les comptes utilisateurs, emails et logs.
              </div>
              <Button 
                onClick={handleBackup} 
                disabled={backingUp}
                className="w-full h-11 rounded-xl bg-primary text-white font-bold text-xs gap-2"
              >
                <FolderArchive className="h-4 w-4" />
                {backingUp ? "Sauvegarde en cours..." : "Sauvegarder la base de données"}
              </Button>
            </CardContent>
          </Card>

          {/* Backup Files List on Disk */}
          <Card className="lg:col-span-2 border-none shadow-xl bg-white rounded-3xl overflow-hidden">
            <CardHeader className="bg-primary/5 border-b pb-4 flex flex-row items-center justify-between flex-wrap gap-2">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                  <Database className="h-4.5 w-4.5 text-primary" />
                  Sauvegardes disponibles sur le stockage
                </CardTitle>
                <CardDescription className="text-xs">Fichiers chiffrés prêts pour une restauration</CardDescription>
              </div>
              <Badge className="bg-primary/10 text-primary border-none font-bold text-[10px] uppercase">
                {files.length} fichiers
              </Badge>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {files.length > 0 ? (
                  files.map((file, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-md transition-all gap-4">
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-slate-800 truncate">{file.filename}</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                          Taille : <strong>{file.size}</strong> — Créé le {new Date(file.createdAt).toLocaleString("fr")}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => setRestoringFile(file.filename)}
                          className="h-8 px-3 rounded-xl bg-amber-600 text-white font-bold text-[10px] uppercase gap-1.5 hover:bg-amber-700"
                        >
                          <RotateCcw className="h-3 w-3" />
                          Restaurer
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs font-medium">
                    Aucune sauvegarde physique trouvée.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Audit Log list */}
        <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b pb-4 flex flex-row items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-base font-bold text-slate-800">Journal d&apos;Audit des Sauvegardes</CardTitle>
                <CardDescription className="text-xs">Historique des exécutions automatiques et manuelles</CardDescription>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadData} 
              disabled={loading}
              className="h-9 border-slate-200 hover:bg-slate-50 rounded-xl font-bold text-xs"
            >
              Actualiser
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  <tr>
                    <th className="py-3.5 px-6">Fichier</th>
                    <th className="py-3.5 px-6">Type</th>
                    <th className="py-3.5 px-6">Taille</th>
                    <th className="py-3.5 px-6">Statut</th>
                    <th className="py-3.5 px-6">Exécuté le</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                        Chargement des logs...
                      </td>
                    </tr>
                  ) : logs.length > 0 ? (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-6 font-bold truncate max-w-[200px]">{log.filename}</td>
                        <td className="py-3.5 px-6">
                          <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/5 px-2 py-0.5 rounded-md">
                            {log.backupType}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 font-mono text-slate-500">{log.size}</td>
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-1.5">
                            {log.status === "success" && <CheckCircle className="h-4 w-4 text-emerald-500" />}
                            {log.status === "failed" && <XCircle className="h-4 w-4 text-rose-500" />}
                            <span className={`text-[10px] font-black uppercase tracking-widest ${
                              log.status === "success" ? "text-emerald-600" : "text-rose-600"
                            }`}>
                              {log.status}
                            </span>
                          </div>
                          {log.errorMessage && (
                            <p className="text-[9px] text-rose-500/80 font-medium mt-0.5 max-w-[200px] truncate">
                              {log.errorMessage}
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 px-6 text-slate-400 font-medium">
                          {new Date(log.createdAt).toLocaleString("fr")}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                        Aucune sauvegarde historisée.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Restore Confirmation Dialog */}
      <Dialog open={!!restoringFile} onOpenChange={(open) => !open && setRestoringFile(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 overflow-hidden">
          <DialogHeader className="space-y-2">
            <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <DialogTitle className="text-base font-bold text-slate-800">Confirmer la restauration ?</DialogTitle>
            <DialogDescription className="text-xs">
              Attention : Cette action va écraser les données actuelles de la base de données avec les données chiffrées du fichier <strong>{restoringFile}</strong>. Cette opération est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex sm:justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setRestoringFile(null)} className="rounded-xl text-xs font-bold border-slate-200">
              Annuler
            </Button>
            <Button onClick={handleRestore} disabled={restoring} className="rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700">
              {restoring ? "Restauration..." : "Écraser et restaurer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
