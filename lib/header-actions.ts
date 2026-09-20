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

    if (!userId) {
      return { success: true, data: [] }
    }

    const prisma = await getPrisma()
    const { getCachedUser } = require("@/lib/cached-queries")
    const currentUser = await getCachedUser(userId)

    if (!currentUser) {
      return { success: true, data: [] }
    }

    // 1. Read persistent read notifications cookie for this user
    const readCookieName = `read_notifs_${userId}`
    const readCookieValue = cookieStore.get(readCookieName)?.value
    let readIds: string[] = []
    if (readCookieValue) {
      try {
        readIds = JSON.parse(readCookieValue)
      } catch (e) {
        readIds = []
      }
    }

    // 2. Determine announcement target filters based on user role
    const allowedCibles: string[] = ["tous"]
    if (currentUser.role === "admin") {
      allowedCibles.push("enseignants", "parents", "eleves")
    } else if (currentUser.role === "teacher") {
      allowedCibles.push("enseignants")
    } else if (currentUser.role === "parent") {
      allowedCibles.push("parents")
    } else if (currentUser.role === "student") {
      allowedCibles.push("eleves")
    }

    // 3. Determine absence targeting based on user role
    let pendingAbsencesCount = 0
    if (currentUser.role === "admin") {
      pendingAbsencesCount = await prisma.absence.count({ where: { statut: 'non_justifie' } })
    } else if (currentUser.role === "student") {
      pendingAbsencesCount = await prisma.absence.count({ where: { id_eleve: userId, statut: 'non_justifie' } })
    } else if (currentUser.role === "parent") {
      const childLinks = await prisma.parentEleve.findMany({
        where: { id_parent: userId },
        select: { id_eleve: true }
      })
      const childIds = childLinks.map(c => c.id_eleve)
      if (childIds.length > 0) {
        pendingAbsencesCount = await prisma.absence.count({
          where: { id_eleve: { in: childIds }, statut: 'non_justifie' }
        })
      }
    } else if (currentUser.role === "teacher") {
      const teacherEmplois = await prisma.emploiDuTemps.findMany({
        where: { id_enseignant: userId },
        select: { id_classe: true }
      })
      const classIds = Array.from(new Set(teacherEmplois.map(e => e.id_classe)))
      if (classIds.length > 0) {
        const inscs = await prisma.inscription.findMany({
          where: { id_classe: { in: classIds }, statut: 'active' },
          select: { id_eleve: true }
        })
        const studentIds = Array.from(new Set(inscs.map(i => i.id_eleve)))
        if (studentIds.length > 0) {
          pendingAbsencesCount = await prisma.absence.count({
            where: { id_eleve: { in: studentIds }, statut: 'non_justifie' }
          })
        }
      }
    }

    // 4. Fetch targeted announcements and unread messages for logged-in user
    const [announcements, unreadMessagesCount] = await Promise.all([
      prisma.annonce.findMany({
        where: { cible: { in: allowedCibles as any } },
        take: 5,
        orderBy: { date_creation: 'desc' },
        select: { id: true, titre: true, message: true, date_creation: true, cible: true }
      }),
      prisma.message.count({ where: { id_destinataire: userId, lu: false } })
    ])

    const notificationsList: any[] = []

    if (unreadMessagesCount > 0) {
      const id = "msg-unread"
      notificationsList.push({
        id,
        type: "message",
        message: `Vous avez ${unreadMessagesCount} message(s) non lu(s)`,
        time: "Récemment",
        read: readIds.includes(id),
        link: "/dashboard/messages"
      })
    }

    if (pendingAbsencesCount > 0) {
      const id = "abs-pending"
      notificationsList.push({
        id,
        type: "absence",
        message: currentUser.role === "student" 
          ? `Vous avez ${pendingAbsencesCount} absence(s) non justifiée(s)`
          : currentUser.role === "parent"
          ? `${pendingAbsencesCount} absence(s) non justifiée(s) pour votre/vos enfant(s)`
          : `${pendingAbsencesCount} absence(s) non justifiée(s) à traiter`,
        time: "Aujourd'hui",
        read: readIds.includes(id),
        link: currentUser.role === "parent" ? "/dashboard/parent" : currentUser.role === "student" ? "/dashboard/absences/status" : "/dashboard/absences"
      })
    }

    announcements.forEach(a => {
      const timeStr = new Date(a.date_creation).toLocaleDateString("fr-FR", {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
      const id = `ann-${a.id}`
      notificationsList.push({
        id,
        type: "announcement",
        message: `${a.titre} : ${a.message.substring(0, 60)}${a.message.length > 60 ? '...' : ''}`,
        time: timeStr,
        read: readIds.includes(id),
        link: currentUser.role === "admin" ? "/dashboard/admin/communication" : "/dashboard"
      })
    })

    return { success: true, data: notificationsList }
  } catch (error) {
    console.error("[getNotificationsAction] Error:", error)
    return { success: false, error: "Erreur de notification" }
  }
}

export async function markNotificationReadAction(notificationId: string) {
  try {
    const cookieStore = await cookies()
    const userIdStr = cookieStore.get("user_id")?.value
    const userId = userIdStr ? parseInt(userIdStr) : null

    if (!userId) return { success: false }

    const prisma = await getPrisma()

    // If message notification, mark all unread messages for this recipient as lu: true in DB
    if (notificationId === "msg-unread") {
      await prisma.message.updateMany({
        where: { id_destinataire: userId, lu: false },
        data: { lu: true }
      })
    }

    // Persist read notification ID in cookie for user
    const readCookieName = `read_notifs_${userId}`
    const existingVal = cookieStore.get(readCookieName)?.value
    let readIds: string[] = []
    if (existingVal) {
      try { readIds = JSON.parse(existingVal) } catch (e) { readIds = [] }
    }

    if (!readIds.includes(notificationId)) {
      readIds.push(notificationId)
    }

    cookieStore.set(readCookieName, JSON.stringify(readIds), {
      path: "/",
      maxAge: 60 * 60 * 24 * 365
    })

    return { success: true }
  } catch (error) {
    console.error("[markNotificationReadAction] Error:", error)
    return { success: false }
  }
}

export async function markAllNotificationsReadAction() {
  try {
    const cookieStore = await cookies()
    const userIdStr = cookieStore.get("user_id")?.value
    const userId = userIdStr ? parseInt(userIdStr) : null

    if (!userId) return { success: false }

    const prisma = await getPrisma()

    // Mark unread messages for this recipient as lu: true in DB
    await prisma.message.updateMany({
      where: { id_destinataire: userId, lu: false },
      data: { lu: true }
    })

    // Fetch current notifications to gather all IDs
    const notifsRes = await getNotificationsAction()
    const currentNotifs = notifsRes.data || []
    const allIds = currentNotifs.map((n: any) => n.id)

    const readCookieName = `read_notifs_${userId}`
    const existingVal = cookieStore.get(readCookieName)?.value
    let readIds: string[] = []
    if (existingVal) {
      try { readIds = JSON.parse(existingVal) } catch (e) { readIds = [] }
    }

    const merged = Array.from(new Set([...readIds, ...allIds]))

    cookieStore.set(readCookieName, JSON.stringify(merged), {
      path: "/",
      maxAge: 60 * 60 * 24 * 365
    })

    return { success: true }
  } catch (error) {
    console.error("[markAllNotificationsReadAction] Error:", error)
    return { success: false }
  }
}

