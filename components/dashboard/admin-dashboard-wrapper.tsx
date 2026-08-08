import { Suspense } from "react"
import { AdminOverview } from "@/components/dashboard/admin-overview"
import { getPrisma } from "@/lib/tenant-context"
import { Skeleton } from "@/components/ui/skeleton"
import { getCachedSchoolStats } from "@/lib/cached-queries"

async function AdminDataFetcher({ adminId, ecoleId }: { adminId: number, ecoleId: number }) {
  try {
    console.log("[AdminDataFetcher] STEP 1: Resolving Prisma & cached stats...")
    const prisma = await getPrisma()

    // 1. Fetch real school stats
    const stats = await getCachedSchoolStats(ecoleId)

    const totalRevenue = stats.revenueData._sum.montant 
      ? Number(stats.revenueData._sum.montant).toLocaleString("fr-FR") + " FCFA" 
      : "0 FCFA"

    console.log("[AdminDataFetcher] STEP 2: Executing parallel database queries...")
    const [
      allStudents, 
      dbClasses, 
      recentPayments, 
      dbInsights, 
      shortcutClasses, 
      shortcutTeachers, 
      shortcutStudents,
      activeYear
    ] = await Promise.all([
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
      prisma.class.findMany({ select: { id: true, nom: true, niveau: true } }),
      prisma.user.findMany({ where: { role: 'teacher' }, select: { id: true, nom: true, matiere: true } }),
      prisma.user.findMany({ where: { role: 'student' }, select: { id: true, nom: true } }),
      prisma.schoolYear.findFirst({ where: { status: "ACTIVE" } })
    ])

    console.log("[AdminDataFetcher] STEP 3: Computing charts and statistics...")
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

    const shortcutData = {
      classes: shortcutClasses || [],
      teachers: shortcutTeachers || [],
      students: shortcutStudents || []
    }

    console.log("[AdminDataFetcher] STEP 4: Rendering AdminOverview successfully.")
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
        activeYearLabel={activeYear?.label || "Non définie"}
      />
    )
  } catch (error) {
    console.error("[AdminDataFetcher] FATAL ERROR during data fetch:", error)
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
      <div className="space-y-6 animate-fade-in-up">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map(i => <div key={i} className={`skeleton h-32 w-full rounded-3xl delay-${i}`} />)}
        </div>
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          <div className="skeleton h-[400px] w-full rounded-3xl delay-5" />
          <div className="skeleton h-[400px] w-full rounded-3xl delay-6" />
        </div>
      </div>
    }>
      <AdminDataFetcher adminId={adminId} ecoleId={ecoleId} />
    </Suspense>
  )
}
