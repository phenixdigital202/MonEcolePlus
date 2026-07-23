"use server"

import { getPrisma } from "@/lib/tenant-context"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

export async function getContacts(userId: number, role: string) {
  try {
    const prisma = await getPrisma()
    const cookieStore = await cookies()
    const schoolId = cookieStore.get("school_id")?.value

    const baseWhere: any = { id: { not: userId } }
    if (schoolId) {
      baseWhere.OR = [
        { id_ecole: parseInt(schoolId) },
        { id_ecole: null }
      ]
    }

    const contacts: any = {
      profs: [],
      camarades: [],
      famille: [],
      administration: []
    }

    if (role === 'admin') {
      // 1. Teachers
      const teachers = await prisma.user.findMany({
        where: { ...baseWhere, role: 'teacher' },
        select: { id: true, nom: true, email: true, role: true },
        orderBy: { nom: 'asc' }
      })
      contacts.profs = teachers.map(t => ({
        id: t.id,
        name: t.nom,
        email: t.email,
        avatar: t.nom ? t.nom.substring(0, 2).toUpperCase() : "PR",
        role: 'teacher'
      }))

      // 2. Students
      const students = await prisma.user.findMany({
        where: { ...baseWhere, role: 'student' },
        select: { id: true, nom: true, email: true, role: true },
        orderBy: { nom: 'asc' },
        take: 100
      })
      contacts.camarades = students.map(s => ({
        id: s.id,
        name: s.nom,
        email: s.email,
        avatar: s.nom ? s.nom.substring(0, 2).toUpperCase() : "EL",
        role: 'student'
      }))

      // 3. Parents
      const parents = await prisma.user.findMany({
        where: { ...baseWhere, role: 'parent' },
        select: { id: true, nom: true, email: true, role: true },
        orderBy: { nom: 'asc' }
      })
      contacts.famille = parents.map(p => ({
        id: p.id,
        name: p.nom,
        email: p.email,
        avatar: p.nom ? p.nom.substring(0, 2).toUpperCase() : "PA",
        role: 'parent'
      }))

      // 4. Other Admins
      const admins = await prisma.user.findMany({
        where: { ...baseWhere, role: 'admin' },
        select: { id: true, nom: true, email: true, role: true },
        orderBy: { nom: 'asc' }
      })
      contacts.administration = admins.map(a => ({
        id: a.id,
        name: a.nom,
        email: a.email,
        avatar: a.nom ? a.nom.substring(0, 2).toUpperCase() : "AD",
        role: 'admin'
      }))
    } else if (role === 'student') {
      // Teachers
      const teachers = await prisma.user.findMany({
        where: { ...baseWhere, role: 'teacher' },
        select: { id: true, nom: true, email: true, role: true },
        take: 50
      })
      contacts.profs = teachers.map(t => ({
        id: t.id,
        name: t.nom,
        email: t.email,
        avatar: t.nom ? t.nom.substring(0, 2).toUpperCase() : "PR",
        role: 'teacher'
      }))

      // Classmates
      const classmates = await prisma.user.findMany({
        where: { ...baseWhere, role: 'student' },
        select: { id: true, nom: true, email: true, role: true },
        take: 50
      })
      contacts.camarades = classmates.map(c => ({
        id: c.id,
        name: c.nom,
        email: c.email,
        avatar: c.nom ? c.nom.substring(0, 2).toUpperCase() : "CM",
        role: 'student'
      }))

      // Parents
      const parentLinks = await prisma.parentEleve.findMany({
        where: { id_eleve: userId },
        include: { parent: true }
      })
      contacts.famille = parentLinks.map(p => ({
        id: p.parent.id,
        name: p.parent.nom,
        email: p.parent.email,
        avatar: p.parent.nom ? p.parent.nom.substring(0, 2).toUpperCase() : "PA",
        role: 'parent'
      }))

      // Admins
      const admins = await prisma.user.findMany({
        where: { ...baseWhere, role: 'admin' },
        select: { id: true, nom: true, email: true, role: true },
        take: 10
      })
      contacts.administration = admins.map(a => ({
        id: a.id,
        name: a.nom,
        email: a.email,
        avatar: a.nom ? a.nom.substring(0, 2).toUpperCase() : "AD",
        role: 'admin'
      }))
    } else if (role === 'parent') {
      // Children
      const parentLinks = await prisma.parentEleve.findMany({
        where: { id_parent: userId },
        include: { eleve: true }
      })
      contacts.famille = parentLinks.map(link => ({
        id: link.eleve.id,
        name: link.eleve.nom,
        email: link.eleve.email,
        avatar: link.eleve.nom ? link.eleve.nom.substring(0, 2).toUpperCase() : "EL",
        role: 'student'
      }))

      // Teachers
      const teachers = await prisma.user.findMany({
        where: { ...baseWhere, role: 'teacher' },
        select: { id: true, nom: true, email: true, role: true },
        take: 50
      })
      contacts.profs = teachers.map(t => ({
        id: t.id,
        name: t.nom,
        email: t.email,
        avatar: t.nom ? t.nom.substring(0, 2).toUpperCase() : "PR",
        role: 'teacher'
      }))

      // Admins
      const admins = await prisma.user.findMany({
        where: { ...baseWhere, role: 'admin' },
        select: { id: true, nom: true, email: true, role: true },
        take: 10
      })
      contacts.administration = admins.map(a => ({
        id: a.id,
        name: a.nom,
        email: a.email,
        avatar: a.nom ? a.nom.substring(0, 2).toUpperCase() : "AD",
        role: 'admin'
      }))
    } else if (role === 'teacher') {
      // Other teachers
      const teachers = await prisma.user.findMany({
        where: { ...baseWhere, role: 'teacher' },
        select: { id: true, nom: true, email: true, role: true }
      })
      contacts.profs = teachers.map(t => ({
        id: t.id,
        name: t.nom,
        email: t.email,
        avatar: t.nom ? t.nom.substring(0, 2).toUpperCase() : "PR",
        role: 'teacher'
      }))

      // Students
      const students = await prisma.user.findMany({
        where: { ...baseWhere, role: 'student' },
        select: { id: true, nom: true, email: true, role: true },
        take: 100
      })
      contacts.camarades = students.map(s => ({
        id: s.id,
        name: s.nom,
        email: s.email,
        avatar: s.nom ? s.nom.substring(0, 2).toUpperCase() : "EL",
        role: 'student'
      }))

      // Parents
      const parents = await prisma.user.findMany({
        where: { ...baseWhere, role: 'parent' },
        select: { id: true, nom: true, email: true, role: true },
        take: 100
      })
      contacts.famille = parents.map(p => ({
        id: p.id,
        name: p.nom,
        email: p.email,
        avatar: p.nom ? p.nom.substring(0, 2).toUpperCase() : "PA",
        role: 'parent'
      }))

      // Admins
      const admins = await prisma.user.findMany({
        where: { ...baseWhere, role: 'admin' },
        select: { id: true, nom: true, email: true, role: true }
      })
      contacts.administration = admins.map(a => ({
        id: a.id,
        name: a.nom,
        email: a.email,
        avatar: a.nom ? a.nom.substring(0, 2).toUpperCase() : "AD",
        role: 'admin'
      }))
    }

    return { success: true, data: contacts }
  } catch (error: any) {
    console.error("Error fetching contacts:", error)
    return { success: false, error: error?.message || "Erreur serveur" }
  }
}

export async function getConversation(userId: number, contactId: number) {
  try {
    const prisma = await getPrisma()
    
    // Fetch messages between userId and contactId using Prisma
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { id_expediteur: userId, id_destinataire: contactId },
          { id_expediteur: contactId, id_destinataire: userId }
        ]
      },
      orderBy: { created_at: 'asc' }
    })

    // Mark unread messages sent to current user as read
    await prisma.message.updateMany({
      where: {
        id_expediteur: contactId,
        id_destinataire: userId,
        lu: false
      },
      data: { lu: true }
    })

    return { 
      success: true, 
      data: messages.map(m => ({
        id: m.id,
        sender: m.id_expediteur === userId ? 'me' : 'them',
        content: m.contenu,
        time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: m.lu
      })) 
    }
  } catch (error: any) {
    console.error("Error fetching conversation:", error)
    return { success: false, error: error?.message || "Erreur serveur", data: [] }
  }
}

export async function sendMessage(senderId: number, receiverId: number, content: string) {
  try {
    if (!content || content.trim() === "") {
      return { success: false, error: "Le message ne peut pas être vide" }
    }

    const prisma = await getPrisma()
    
    // Create message with Prisma model
    const newMessage = await prisma.message.create({
      data: {
        id_expediteur: senderId,
        id_destinataire: receiverId,
        contenu: content.trim(),
        created_at: new Date()
      }
    })

    revalidatePath('/dashboard/messages')
    return { success: true, data: newMessage }
  } catch (error: any) {
    console.error("Error sending message:", error)
    return { success: false, error: error?.message || "Erreur lors de l'envoi" }
  }
}

export async function linkParentToStudent(parentId: number, studentId: number) {
  try {
    const prisma = await getPrisma()
    const existing = await prisma.parentEleve.findFirst({
      where: { id_parent: parentId, id_eleve: studentId }
    })
    if (!existing) {
      await prisma.parentEleve.create({
        data: {
          id_parent: parentId,
          id_eleve: studentId
        }
      })
    }
    return { success: true }
  } catch (e) {
    console.error("Error linking parent:", e)
    return { success: false }
  }
}
