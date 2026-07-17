"use server"

import { getPrisma } from "@/lib/tenant-context"
import { revalidatePath } from "next/cache"

export async function getContacts(userId: number, role: string) {
  try {
    const prisma = await getPrisma()
    const contacts: any = {
      profs: [],
      camarades: [],
      famille: [],
      administration: []
    }

    if (role === 'student') {
      // Existing student logic...
      const inscriptions = await prisma.inscription.findMany({
        where: { id_eleve: userId },
        include: { 
          classe: {
            include: {
              emplois_du_temps: {
                include: { users: true }
              }
            }
          }
        }
      })

      const currentInscription = inscriptions[0]

      if (currentInscription?.classe) {
        const teachers = new Map()
        currentInscription.classe.emplois_du_temps.forEach(edt => {
          teachers.set(edt.users.id, edt.users)
        })
        contacts.profs = Array.from(teachers.values()).map(t => ({
          id: t.id,
          name: t.nom,
          avatar: t.nom.substring(0, 2).toUpperCase(),
          role: 'teacher'
        }))

        const classmates: any[] = await prisma.$queryRawUnsafe(
            `SELECT u.id, u.nom as name FROM users u 
             JOIN inscriptions i ON u.id = i.id_eleve 
             WHERE i.id_classe = ? AND u.id != ?`,
            currentInscription.id_classe,
            userId
        )
        contacts.camarades = classmates.map(c => ({
          id: c.id,
          name: c.name,
          avatar: c.name.substring(0, 2).toUpperCase(),
          role: 'student'
        }))
      }

      const family: any[] = await prisma.$queryRawUnsafe(
        `SELECT u.id, u.nom as name FROM users u 
         JOIN parent_eleve pe ON u.id = pe.id_parent 
         WHERE pe.id_eleve = ?`,
        userId
      )
      contacts.famille = family.map(f => ({
        id: f.id,
        name: f.name,
        avatar: f.name.substring(0, 2).toUpperCase(),
        role: 'parent'
      }))

      const admins = await prisma.user.findMany({
        where: { role: 'admin' },
        take: 5
      })
      contacts.administration = admins.map(a => ({
        id: a.id,
        name: a.nom,
        avatar: a.nom.substring(0, 2).toUpperCase(),
        role: 'admin'
      }))
    } else if (role === 'parent') {
      // 1. Get parent's children
      const parentLinks = await prisma.parent_eleve.findMany({
        where: { id_parent: userId },
        include: {
          eleve: {
            include: {
              inscriptions: {
                include: {
                  classe: {
                    include: {
                      emplois_du_temps: {
                        include: { users: true }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      })

      // 2. Children as "famille" contacts
      contacts.famille = parentLinks.map(link => ({
        id: link.eleve.id,
        name: link.eleve.nom,
        avatar: link.eleve.nom.substring(0, 2).toUpperCase(),
        role: 'student'
      }))

      // 3. Teachers of children's classes as "profs" contacts
      const teacherMap = new Map<number, any>()
      for (const link of parentLinks) {
        for (const inscription of link.eleve.inscriptions) {
          if (inscription.classe) {
            for (const edt of inscription.classe.emplois_du_temps) {
              if (!teacherMap.has(edt.users.id)) {
                teacherMap.set(edt.users.id, {
                  id: edt.users.id,
                  name: edt.users.nom,
                  avatar: edt.users.nom.substring(0, 2).toUpperCase(),
                  role: 'teacher'
                })
              }
            }
          }
        }
      }
      contacts.profs = Array.from(teacherMap.values())

      // 4. Admins
      const admins = await prisma.user.findMany({
        where: { role: 'admin' },
        take: 5
      })
      contacts.administration = admins.map(a => ({
        id: a.id,
        name: a.nom,
        avatar: a.nom.substring(0, 2).toUpperCase(),
        role: 'admin'
      }))
    } else if (role === 'admin') {
      // 1. All Teachers
      const teachers = await prisma.user.findMany({
        where: { role: 'teacher' },
        select: { id: true, nom: true }
      })
      contacts.profs = teachers.map(t => ({
        id: t.id,
        name: t.nom,
        avatar: t.nom.substring(0, 2).toUpperCase(),
        role: 'teacher'
      }))

      // 2. All Students
      const students = await prisma.user.findMany({
        where: { role: 'student' },
        select: { id: true, nom: true },
        take: 50 // Safe limit for UI
      })
      contacts.camarades = students.map(s => ({
        id: s.id,
        name: s.nom,
        avatar: s.nom.substring(0, 2).toUpperCase(),
        role: 'student'
      }))

      // 3. All Parents
      const parents = await prisma.user.findMany({
        where: { role: 'parent' },
        select: { id: true, nom: true }
      })
      contacts.famille = parents.map(p => ({
        id: p.id,
        name: p.nom,
        avatar: p.nom.substring(0, 2).toUpperCase(),
        role: 'parent'
      }))

      // 4. Other Admins
      const otherAdmins = await prisma.user.findMany({
        where: { role: 'admin', id: { not: userId } },
        select: { id: true, nom: true }
      })
      contacts.administration = otherAdmins.map(a => ({
        id: a.id,
        name: a.nom,
        avatar: a.nom.substring(0, 2).toUpperCase(),
        role: 'admin'
      }))
    } else if (role === 'teacher') {
      // 1. Get classes assigned to this teacher via schedule
      const schedules = await prisma.emplois_du_temps.findMany({
        where: { id_enseignant: userId },
        include: {
          classes: {
            include: {
              inscriptions: {
                include: { eleve: true }
              }
            }
          }
        },
        distinct: ['id_classe']
      })

      // 2. Collect all students in teacher's classes
      const studentMap = new Map<number, any>()
      for (const schedule of schedules) {
        for (const inscription of schedule.classes?.inscriptions || []) {
          if (inscription.eleve && !studentMap.has(inscription.eleve.id)) {
            studentMap.set(inscription.eleve.id, {
              id: inscription.eleve.id,
              name: inscription.eleve.nom,
              avatar: inscription.eleve.nom.substring(0, 2).toUpperCase(),
              role: 'student'
            })
          }
        }
      }
      contacts.camarades = Array.from(studentMap.values()) // reuse 'camarades' key for students

      // 3. Parents of those students
      const studentIds = Array.from(studentMap.keys())
      const parentLinks = await prisma.parent_eleve.findMany({
        where: { id_eleve: { in: studentIds } },
        include: { parent: true }
      })
      const parentMap = new Map<number, any>()
      for (const link of parentLinks) {
        if (link.parent && !parentMap.has(link.parent.id)) {
          parentMap.set(link.parent.id, {
            id: link.parent.id,
            name: link.parent.nom,
            avatar: link.parent.nom.substring(0, 2).toUpperCase(),
            role: 'parent'
          })
        }
      }
      contacts.famille = Array.from(parentMap.values()) // reuse 'famille' key for parents

      // 4. Other teachers
      const otherTeachers = await prisma.user.findMany({
        where: { role: 'teacher', id: { not: userId } },
        select: { id: true, nom: true }
      })
      contacts.profs = otherTeachers.map(t => ({
        id: t.id,
        name: t.nom,
        avatar: t.nom.substring(0, 2).toUpperCase(),
        role: 'teacher'
      }))

      // 5. Admins
      const admins = await prisma.user.findMany({
        where: { role: 'admin' },
        take: 5
      })
      contacts.administration = admins.map(a => ({
        id: a.id,
        name: a.nom,
        avatar: a.nom.substring(0, 2).toUpperCase(),
        role: 'admin'
      }))
    }

    return { success: true, data: contacts }
  } catch (error) {
    console.error("Error fetching contacts:", error)
    return { success: false, error: "Erreur serveur" }
  }
}

export async function getConversation(userId: number, contactId: number) {
  try {
    const prisma = await getPrisma()
    // Using raw SQL for messages
    const messages: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM messages 
       WHERE (id_expediteur = ? AND id_destinataire = ?) 
       OR (id_expediteur = ? AND id_destinataire = ?) 
       ORDER BY created_at ASC`,
      userId, contactId, contactId, userId
    )

    return { 
      success: true, 
      data: messages.map(m => ({
        id: m.id,
        sender: m.id_expediteur === userId ? 'me' : 'them',
        content: m.contenu,
        time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: m.lu === 1 || m.lu === true
      })) 
    }
  } catch (error) {
    console.error("Error fetching conversation:", error)
    return { success: false, error: "Erreur serveur" }
  }
}

export async function sendMessage(senderId: number, receiverId: number, content: string) {
  try {
    const prisma = await getPrisma()
    // Using raw SQL for creation
    await prisma.$executeRawUnsafe(
      `INSERT INTO messages (id_expediteur, id_destinataire, contenu, created_at) 
       VALUES (?, ?, ?, NOW())`,
      senderId,
      receiverId,
      content
    )
    revalidatePath('/dashboard/messages')
    return { success: true }
  } catch (error) {
    console.error("Error sending message:", error)
    return { success: false, error: "Erreur serveur" }
  }
}

export async function linkParentToStudent(parentId: number, studentId: number) {
  try {
    const prisma = await getPrisma()
    // Using raw SQL to bypass model check
    await prisma.$executeRawUnsafe(
      `INSERT IGNORE INTO parent_eleve (id_parent, id_eleve) VALUES (?, ?)`,
      parentId,
      studentId
    )
    return { success: true }
  } catch (e) {
    console.error("Error linking parent:", e)
    return { success: false }
  }
}
