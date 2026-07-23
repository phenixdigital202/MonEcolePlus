import { Suspense } from "react"
import { AdminOverview } from "@/components/dashboard/admin-overview"
import { getPrisma } from "@/lib/tenant-context"
import { Skeleton } from "@/components/ui/skeleton"
import { getCachedSchoolStats } from "@/lib/cached-queries"

async function AdminDataFetcher({ adminId, ecoleId }: { adminId: number, ecoleId: number }) {
  try {
    const prisma = await getPrisma()

    // 1. Fetch real school stats
    const stats = await getCachedSchoolStats(ecoleId)

    const totalRevenue = stats.revenueData._sum.montant 
      ? Number(stats.revenueData._sum.montant).toLocaleString() + " FCFA" 
      : "0 FCFA"

    // 2. Fetch real data for charts, insights, and shortcuts in parallel
    const [allStudents, dbClasses, recentPayments, dbInsights, resShortcut] = await Promise.all([
      prisma.user.findMany({
        where: { role: 'student' },
        select: { created_at: true }
      }),
      prisma.class.findMany({
        select: {
          id: true,
          nom: true,
          niveau: true,
          _count: { select: { inscriptions: true } }
        }
      }),
      prisma.paiement.findMany({
        where: { status: 'paye' },
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

    // 3. Compute REAL enrollment growth per month from DB
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc']
    const enrollmentMap: Record<string, number> = {}
    monthNames.slice(0, 6).forEach(m => { enrollmentMap[m] = 0 })

    allStudents.forEach(s => {
      if (s.created_at) {
        const monthIndex = new Date(s.created_at).getMonth()
        const monthLabel = monthNames[monthIndex]
        if (enrollmentMap[monthLabel] !== undefined) {
          enrollmentMap[monthLabel] += 1
        }
      }
    })

    const realEnrollmentData = monthNames.slice(0, 6).map(m => ({
      name: m,
      students: enrollmentMap[m] || 0
    }))

    // 4. Compute REAL class distribution by level from DB
    const levelColorMap: Record<string, string> = {
      'Primaire': '#3b82f6',
      'Collège': '#8b5cf6',
      'Lycée': '#ec4899',
      'Maternelle': '#10b981',
      'Supérieur': '#f59e0b'
    }
    const defaultColors = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#06b6d4']

    const levelCounts: Record<string, number> = {}
    dbClasses.forEach(c => {
      const level = c.niveau || c.nom || 'Autre'
      levelCounts[level] = (levelCounts[level] || 0) + (c._count?.inscriptions || 0)
    })

    const realClassData = Object.keys(levelCounts).length > 0 
      ? Object.entries(levelCounts).map(([name, value], idx) => ({
          name,
          value,
          color: levelColorMap[name] || defaultColors[idx % defaultColors.length]
        }))
      : null

    // 5. Compute REAL financial chart data from DB
    const financeChartData = recentPayments.map(p => ({
      name: new Date(p.date_paiement).toLocaleDateString('fr-FR', { weekday: 'short' }),
      revenue: Number(p.montant),
      target: 200000 
    })).reverse()

    // 6. Explicitly format AI Insights to plain JSON objects
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
          enrollment: realEnrollmentData,
          distribution: realClassData,
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
