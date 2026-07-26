"use server"

import { getPrisma } from "@/lib/tenant-context"
import { revalidatePath } from "next/cache"
import * as whatsapp from "./whatsapp"

/**
 * Get WhatsApp history logs
 */
export async function getWhatsAppHistory() {
  try {
    const prisma = await getPrisma()
    const logs = await prisma.notificationWhatsapp.findMany({
      orderBy: { sentAt: "desc" }
    })
    return { success: true, data: JSON.parse(JSON.stringify(logs)) }
  } catch (error: any) {
    console.error("Error fetching WhatsApp history:", error)
    return { success: false, error: error.message || "Failed to load history" }
  }
}

/**
 * Get WhatsApp stats summary
 */
export async function getWhatsAppStats() {
  try {
    const prisma = await getPrisma()
    const sentCount = await prisma.notificationWhatsapp.count({ where: { status: "sent" } })
    const failedCount = await prisma.notificationWhatsapp.count({ where: { status: "failed" } })
    const pendingCount = await prisma.notificationWhatsapp.count({ where: { status: "pending" } })
    const totalCount = sentCount + failedCount + pendingCount

    const deliveryRate = totalCount > 0 ? Math.round((sentCount / totalCount) * 100) : 100

    return {
      success: true,
      data: {
        sentCount,
        failedCount,
        pendingCount,
        totalCount,
        deliveryRate
      }
    }
  } catch (error: any) {
    console.error("Error fetching WhatsApp stats:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Trigger retry for failed messages
 */
export async function retryFailedWhatsAppMessages() {
  try {
    const prisma = await getPrisma()
    const failedMessages = await prisma.notificationWhatsapp.findMany({
      where: { status: "failed", retryCount: { lt: 3 } }
    })

    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID || ""
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN || ""
    const twilioFromNumber = process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886"

    let successCount = 0
    for (const msg of failedMessages) {
      try {
        if (twilioAccountSid && twilioAuthToken) {
          const twilio = require("twilio")
          const client = twilio(twilioAccountSid, twilioAuthToken)
          await client.messages.create({
            from: twilioFromNumber,
            to: msg.to,
            body: msg.message
          })
        }

        await prisma.notificationWhatsapp.update({
          where: { id: msg.id },
          data: {
            status: "sent",
            sentAt: new Date(),
            retryCount: msg.retryCount + 1,
            errorMessage: null
          }
        })
        successCount++
      } catch (err: any) {
        await prisma.notificationWhatsapp.update({
          where: { id: msg.id },
          data: {
            retryCount: msg.retryCount + 1,
            errorMessage: err.message || String(err)
          }
        })
      }
    }

    revalidatePath("/dashboard/admin/whatsapp")
    return { success: true, count: successCount }
  } catch (error: any) {
    console.error("WhatsApp retry queue error:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Simulate / Trigger a manual WhatsApp message
 */
export async function sendSimulatedWhatsApp(formData: FormData) {
  const to = formData.get("to") as string
  const templateName = formData.get("templateName") as string
  const customMessage = formData.get("customMessage") as string

  if (!to || !templateName) {
    return { success: false, error: "Veuillez spécifier un numéro et un modèle." }
  }

  try {
    let result: any

    // If custom message is provided, send it directly using the core dispatcher
    if (customMessage && customMessage.trim().length > 0) {
      result = await whatsapp.sendWhatsAppMessage({
        to,
        message: customMessage,
        templateName: "custom_override"
      })
    } else {
      switch (templateName) {
        case "absence":
          result = await whatsapp.sendAbsenceWhatsApp({ to, studentName: "Abou Traoré", date: "25 Octobre 2026" })
          break
        case "retard":
          result = await whatsapp.sendRetardWhatsApp({ to, studentName: "Abou Traoré", date: "25 Octobre 2026", minutes: 15 })
          break
        case "new_grade":
          result = await whatsapp.sendNewGradeWhatsApp({ to, studentName: "Abou Traoré", subjectName: "Mathématiques", grade: 17.5 })
          break
        case "report_card":
          result = await whatsapp.sendReportCardWhatsApp({ to, studentName: "Abou Traoré", period: "1er Trimestre", average: "16.20" })
          break
        case "payment_received":
          result = await whatsapp.sendPaymentReceivedWhatsApp({ to, amount: "150 000", type: "Scolarité T1", date: "25 Octobre 2026" })
          break
        case "payment_due":
          result = await whatsapp.sendPaymentDueWhatsApp({ to, amount: "50 000", type: "Frais d'Examen", dateLimit: "30 Novembre 2026" })
          break
        case "urgent_message":
          result = await whatsapp.sendUrgentMessageWhatsApp({ to, title: "Alerte Météo", content: "Les cours de l'après-midi sont suspendus en raison des intempéries. Sécurité maximale demandée." })
          break
        case "meeting":
          result = await whatsapp.sendMeetingWhatsApp({ to, title: "Conseil de Classe Extraordinaire", date: "4 Novembre 2026", time: "15h30", location: "Salle de conférence" })
          break
        case "announcement":
          result = await whatsapp.sendAnnouncementWhatsApp({ to, title: "Lancement du Club Robotique", date: "26 Octobre 2026" })
          break
        case "support_ticket":
          result = await whatsapp.sendSupportWhatsApp({ to, ticketId: "982", status: "Résolu et Clôturé" })
          break
        default:
          return { success: false, error: "Modèle inconnu" }
      }
    }

    revalidatePath("/dashboard/admin/whatsapp")
    return { success: true, status: result.status }
  } catch (err: any) {
    console.error("Simulation error:", err)
    return { success: false, error: err.message || "Failed to dispatch WhatsApp simulation" }
  }
}
