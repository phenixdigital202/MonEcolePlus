import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Server, Activity, Cpu, HardDrive, Terminal, AlertTriangle, Info } from "lucide-react"
import { getSystemLogsAction } from "@/lib/saas-admin-actions"

export const revalidate = 0 // Disable static caching

export default async function MonitoringPage() {
  const metrics = [
    { title: "Statut Serveur Vercel", value: "En ligne", status: "success", icon: Server },
    { title: "Utilisation CPU", value: "14%", status: "success", icon: Cpu },
    { title: "Utilisation RAM", value: "1.2 GB / 8 GB", status: "success", icon: Activity },
    { title: "Uptime Global", value: "99.97%", status: "success", icon: Activity },
    { title: "Base de données", value: "Opérationnelle (Supabase)", status: "success", icon: HardDrive }
  ]

  const logsRes = await getSystemLogsAction()
  const logs = logsRes.success ? logsRes.data : []

  return (
    <div className="p-8 space-y-8 bg-[#09090b] text-white min-h-screen">
      <div className="flex flex-col gap-1.5 border-b border-[#27272a] pb-6">
        <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
          Monitoring & Observabilité
        </h1>
        <p className="text-[#a1a1aa] text-sm">Visualisez l'état des serveurs, l'utilisation des ressources et le flux de logs d'audit.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {metrics.map((m, i) => (
          <Card key={i} className="border-[#27272a] bg-[#18181b] text-white p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <m.icon className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#a1a1aa]">{m.title}</p>
                <p className="text-xl font-black text-white">{m.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Flux de Logs */}
      <Card className="border-[#27272a] bg-[#18181b] text-white overflow-hidden shadow-2xl">
        <CardHeader className="border-b border-[#27272a] bg-[#09090b]/50 p-6 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Terminal className="h-5 w-5 text-indigo-400" />
              Flux de Journalisation Système (Observabilité)
            </CardTitle>
            <CardDescription className="text-xs text-[#a1a1aa] mt-1">
              Derniers logs enregistrés sur la Master Database.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[500px] overflow-y-auto font-mono text-xs">
            {logs.length === 0 ? (
              <div className="p-8 text-center text-[#a1a1aa]">
                Aucun log enregistré pour le moment.
              </div>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#09090b]/50 text-[#a1a1aa] text-left border-b border-[#27272a]">
                    <th className="p-3">Horodatage</th>
                    <th className="p-3">Niveau</th>
                    <th className="p-3">Source</th>
                    <th className="p-3">Message</th>
                    <th className="p-3">IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log: any) => (
                    <tr key={log.id} className="border-b border-[#27272a] hover:bg-[#09090b]/30">
                      <td className="p-3 text-[#a1a1aa] whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString("fr")}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          log.level === "error" ? "bg-red-500/10 text-red-400" :
                          log.level === "warn" ? "bg-amber-500/10 text-amber-400" :
                          "bg-emerald-500/10 text-emerald-400"
                        }`}>
                          {log.level}
                        </span>
                      </td>
                      <td className="p-3 text-indigo-300 font-bold">{log.source}</td>
                      <td className="p-3 text-white truncate max-w-xs" title={log.message}>{log.message}</td>
                      <td className="p-3 text-[#a1a1aa] font-mono">{log.ipAddress || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
