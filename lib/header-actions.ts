"use server"

import { getPrisma } from "@/lib/tenant-context"
import { cookies } from "next/headers"

export async function searchGlobalAction(query: string) {
  if (!query || query.trim().length < 2) {
    return { success: true, data: { users: [], classes: [] } }
  }

  try {
    const prisma = await getPrisma()
    const cleanQuery = query.trim()

    const [users, classes] = await Promise.all([
      prisma.user.findMany({
        where: {
          OR: [
            { nom: { contains: cleanQuery, mode: 'insensitive' } },
            { email: { contains: cleanQuery, mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          nom: true,
          email: true,
          role: true
        },
        take: 6
      }),
      prisma.class.findMany({
        where: {
          OR: [
            { nom: { contains: cleanQuery, mode: 'insensitive' } },
            { niveau: { contains: cleanQuery, mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          nom: true,
          niveau: true
        },
        take: 5
      })
    ])

    return { success: true, data: { users, classes } }
  } catch (error) {
    console.error("[searchGlobalAction] Error:", error)
    return { success: false, error: "Erreur lors de la recherche" }
  }
}

export async function getNotificationsAction() {
  try {
    const cookieStore = await cookies()
    const userIdStr = cookieStore.get("user_id")?.value
    const userId = userIdStr ? parseInt(userIdStr) : null

    const prisma = await getPrisma()

    const [announcements, unreadMessagesCount, pendingAbsencesCount] = await Promise.all([
      prisma.annonce.findMany({
        take: 5,
        orderBy: { date_creation: 'desc' },
        select: { id: true, titre: true, message: true, date_creation: true, cible: true }
      }),
      userId ? prisma.message.count({ where: { id_destinataire: userId, lu: false } }) : 0,
      prisma.absence.count({ where: { statut: 'non_justifie' } })
    ])

    const notificationsList: any[] = []

    if (unreadMessagesCount > 0) {
      notificationsList.push({
        id: "msg-unread",
        type: "message",
        message: `Vous avez ${unreadMessagesCount} message(s) non lu(s)`,
        time: "Récemment",
        read: false,
        link: "/dashboard/messages"
      })
    }

    if (pendingAbsencesCount > 0) {
      notificationsList.push({
        id: "abs-pending",
        type: "absence",
        message: `${pendingAbsencesCount} absence(s) non justifiée(s) à traiter`,
        time: "Aujourd'hui",
        read: false,
        link: "/dashboard/absences"
      })
    }

    announcements.forEach(a => {
      const timeStr = new Date(a.date_creation).toLocaleDateString("fr-FR", {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
      notificationsList.push({
        id: `ann-${a.id}`,
        type: "announcement",
        message: `${a.titre} : ${a.message.substring(0, 60)}${a.message.length > 60 ? '...' : ''}`,
        time: timeStr,
        read: false,
        link: "/dashboard/admin/school"
      })
    })

    return { success: true, data: notificationsList }
  } catch (error) {
    console.error("[getNotificationsAction] Error:", error)
    return { success: false, error: "Erreur de notification" }
  }
}
