import { cookies } from "next/headers"
import { getPrisma } from "@/lib/tenant-context"
import { MessagesView } from "@/components/dashboard/messages-view"
import { getContacts, linkParentToStudent } from "@/lib/message-actions"
import { getCachedUser } from "@/lib/cached-queries"

export default async function MessagesPage() {
  const prisma = await getPrisma()
  const cookieStore = await cookies()
  const userId = cookieStore.get("user_id")?.value

  if (!userId) return null

  const user = await getCachedUser(parseInt(userId))

  if (!user) return null

  // Auto-link parent to their enrolled children (if parent role)
  if (user.role === 'parent') {
    const parentLinks = await prisma.parentEleve.findMany({
      where: { id_parent: user.id },
      select: { id_eleve: true }
    })
    // Auto-link only if no children linked yet
    if (parentLinks.length === 0) {
      // No auto-linking needed, parent-student links should be managed in admin
    }
  }

  // Initial fetch of contacts
  const contactsResult = await getContacts(user.id, user.role)
  
  if (!contactsResult.success) {
    return <div>Erreur lors du chargement des contacts.</div>
  }

  return (
    <div className="flex flex-col h-full bg-slate-50/20">
      <div className="p-4 md:p-6 pb-0">
        <h1 className="text-2xl font-bold text-foreground">
          {user.role === 'parent' ? "Messages École" : user.role === 'teacher' ? "Messagerie" : "Messagerie Directe"}
        </h1>
        <p className="text-muted-foreground text-sm">
          {user.role === 'parent' 
            ? "Échangez avec les professeurs de vos enfants et l'administration de l'école."
            : user.role === 'teacher'
            ? "Échangez avec vos élèves, leurs parents et vos collègues enseignants."
            : user.role === 'admin'
            ? "Échangez avec les professeurs, élèves et parents."
            : "Échangez avec vos professeurs, camarades et parents en temps réel."}
        </p>
      </div>
      
      <main className="p-6 flex-1">
        <MessagesView 
          currentUserId={user.id} 
          currentUserRole={user.role}
          initialContacts={contactsResult.data as any} 
        />
      </main>
    </div>
  )
}
