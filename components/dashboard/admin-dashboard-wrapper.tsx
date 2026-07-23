import { Suspense } from "react"
import { AdminOverview } from "@/components/dashboard/admin-overview"
import { getPrisma } from "@/lib/tenant-context"
import { Skeleton } from "@/components/ui/skeleton"
import { getCachedSchoolStats } from "@/lib/cached-queries"

async function AdminDataFetcher({ adminId, ecoleId }: { adminId: number, ecoleId: number }) {
  try {
    const prisma = await getPrisma()

    // 1. Fetch cached school stats
    const stats = await getCachedSchoolStats(ecoleId)

    const totalRevenue = stats.revenueData._sum.montant 
      ? Number(stats.revenueData._sum.montant).toLocaleString() + " FCFA" 
      : "0 FCFA"

    // 2. Parallelize charts and insights
    const [recentPayments, dbInsights, resShortcut] = await Promise.all([
      prisma.paiement.findMany({
        where: { status: 'paye', user: { id_ecole: ecoleId } },
        take: 20,
        orderBy: { date_paiement: 'desc' },
        select: { montant: true, date_paiement: true, type: true }
      }),
      prisma.aIInsight.findMany({
        where: { id_utilisateur: adminId },
        take: 3,
        orderBy: { created_at: 'desc' },
        select: { id: true, type: true, message: true, score_confiance: true, created_at: true }
      }),
      import("@/lib/admin-shortcut-actions").then(m => m.getShortcutMetaData())
    ])

    const financeChartData = recentPayments.map(p => ({
      name: new Date(p.date_paiement).toLocaleDateString('fr-FR', { weekday: 'short' }),
      revenue: Number(p.montant),
      target: 200000 
    })).reverse()

    // Explicitly format AI Insights to plain JSON objects for Client Component serialization
    const formattedInsights = dbInsights.map(ins => ({
      id: ins.id,
      type: ins.type,
      message: ins.message,
      score_confiance: ins.score_confiance ? Number(ins.score_confiance) : null,
      created_at: ins.created_at.toISOString()
    }))

    const shortcutData = resShortcut.success ? resShortcut.data : null

    return (
      <AdminOverview 
        stats={{
          students: stats.studentCount,
          teachers: stats.teacherCount,
          classes: stats.classCount,
          revenue: totalRevenue
        }} 
        shortcutData={shortcutData}
        adminId={adminId}
        chartData={{
          finance: financeChartData.length > 0 ? financeChartData : null,
          insights: formattedInsights.length > 0 ? formattedInsights : null
        }}
      />
    )
  } catch (error) {
    console.error("[AdminDataFetcher] Error rendering admin overview:", error)
    return (
      <div className="p-6 border rounded-2xl bg-destructive/10 text-destructive text-center space-y-2">
        <h3 className="font-bold text-lg">Données partiellement indisponibles</h3>
        <p className="text-sm text-muted-foreground">Une erreur s&apos;est produite lors de la récupération des données analytiques.</p>
      </div>
    )
  }
}

export function AdminDashboardWrapper({ adminId, ecoleId }: { adminId: number, ecoleId: number }) {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
        </div>
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          <Skeleton className="h-[400px] w-full rounded-xl" />
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      </div>
    }>
      <AdminDataFetcher adminId={adminId} ecoleId={ecoleId} />
    </Suspense>
  )
}
