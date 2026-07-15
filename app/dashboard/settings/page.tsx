import { cookies } from "next/headers"
import { getPrisma } from "@/lib/tenant-context"
import { redirect } from "next/navigation"
import { SettingsView } from "@/components/dashboard/settings-view"

export default async function SettingsPage() {
  const cookieStore = await cookies()
  const userId = cookieStore.get("user_id")?.value

  if (!userId) {
    redirect("/login")
  }

  const prisma = await getPrisma()
  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
    include: {
      inscriptions: {
        include: {
          classe: true
        }
      }
    }
  })

  if (!user) {
    redirect("/login")
  }

  return (
    <SettingsView user={JSON.parse(JSON.stringify(user))} />
  )
}
