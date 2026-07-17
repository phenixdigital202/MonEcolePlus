import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getParentDashboardData } from "@/lib/parent-actions"
import { ParentDashboardView } from "@/components/dashboard/parent-dashboard-view"

export const metadata = {
  title: "Espace Parent | MonÉcole+",
  description: "Suivez la scolarité de vos enfants sur MonÉcole+",
}

export default async function ParentDashboardPage() {
  const cookieStore = await cookies()
  const userId = cookieStore.get("user_id")?.value

  if (!userId) {
    redirect("/login")
  }

  const res = await getParentDashboardData(parseInt(userId))

  if (!res.success || !res.data) {
    return (
      <div className="p-4 md:p-8 space-y-6">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center border rounded-xl bg-card p-6">
          <h2 className="text-xl font-bold">Erreur de chargement</h2>
          <p className="text-muted-foreground mt-2 max-w-md">
            Impossible de charger les données de votre espace parent. Veuillez réessayer plus tard.
          </p>
        </div>
      </div>
    )
  }

  // Safely serialize data (converts Decimal and Date types to plain strings/numbers)
  const serializedData = JSON.parse(JSON.stringify(res.data))

  return (
    <ParentDashboardView initialData={serializedData} />
  )
}
