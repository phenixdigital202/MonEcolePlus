import { getPrisma } from "@/lib/tenant-context"

const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID || ""
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN || ""
const twilioFromNumber = process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886"

const metaAccessToken = process.env.WHATSAPP_ACCESS_TOKEN || ""
const metaPhoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || ""

/**
 * Core WhatsApp Dispatcher (Supports Meta Cloud API & Twilio Fallback)
 */
export async function sendWhatsAppMessage({
  to,
  message,
  templateName,
  scheduledFor = null
}: {
  to: string
  message: string
  templateName: string
  scheduledFor?: Date | null
}) {
  const prisma = await getPrisma()

  // Format destination number (ensure it has whatsapp: prefix for database compatibility)
  const formattedTo = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`

  // Clean number for Meta (digits only, e.g. 2250700000000)
  const metaCleanNumber = to.replace("whatsapp:", "").replace("+", "").replace(/\s/g, "")

  // 1. Create database log entry
  const log = await prisma.notificationWhatsapp.create({
    data: {
      to: formattedTo,
      message,
      templateName,
      status: scheduledFor ? "pending" : "sending",
      scheduledFor,
    }
  })

  // If scheduled in the future, save as pending and return
  if (scheduledFor && scheduledFor.getTime() > Date.now()) {
    await prisma.notificationWhatsapp.update({
      where: { id: log.id },
      data: { status: "pending" }
    })
    return log
  }

  // 2. Dispatch message
  try {
    if (metaAccessToken && metaPhoneNumberId) {
      console.log(`[WhatsApp API] Dispatching to Meta Cloud API...`)
      const response = await fetch(`https://graph.facebook.com/v18.0/${metaPhoneNumberId}/messages`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${metaAccessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: metaCleanNumber,
          type: "text",
          text: { body: message }
        })
      })

      const responseData = await response.json()
      if (!response.ok) {
        throw new Error(`Meta API error: ${JSON.stringify(responseData)}`)
      }

      console.log(`[WhatsApp API] Meta Cloud API Success (HTTP 200). Msg ID: ${responseData.messages?.[0]?.id}`)
    } else if (twilioAccountSid && twilioAuthToken) {
      // Use dynamic import of twilio library to avoid breaking client/build bundles if not needed
      const twilio = require("twilio")
      const client = twilio(twilioAccountSid, twilioAuthToken)

      await client.messages.create({
        from: twilioFromNumber,
        to: formattedTo,
        body: message,
      })
    } else {
      // Console fallback logger
      console.log("=== [WhatsApp Fallback Log] Message Sent ===")
      console.log(`From: ${metaPhoneNumberId ? 'Meta:' + metaPhoneNumberId : twilioFromNumber}`)
      console.log(`To: ${formattedTo} (Meta format: ${metaCleanNumber})`)
      console.log(`Template: ${templateName}`)
      console.log(`Message: ${message}`)
    }

    // 3. Mark as sent
    return await prisma.notificationWhatsapp.update({
      where: { id: log.id },
      data: {
        status: "sent",
        sentAt: new Date()
      }
    })
  } catch (error: any) {
    console.error(`[WhatsApp Error] Failed to send to ${formattedTo}:`, error)

    // 4. Mark as failed with error log
    return await prisma.notificationWhatsapp.update({
      where: { id: log.id },
      data: {
        status: "failed",
        errorMessage: error.message || String(error)
      }
    })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// WHATSAPP TEMPLATE BUILDERS FOR 10 TRIGGERS
// ─────────────────────────────────────────────────────────────────────────────

export async function sendAbsenceWhatsApp({ to, studentName, date }: { to: string, studentName: string, date: string }) {
  const msg = `🔴 *MonÉcole+ | Notification d'Absence*\n\nBonjour, nous vous informons que l'élève *${studentName}* a été signalé absent le *${date}*.\n\nMerci de contacter l'administration de l'établissement au plus vite pour justifier cette absence.`
  return sendWhatsAppMessage({ to, message: msg, templateName: "absence" })
}

export async function sendRetardWhatsApp({ to, studentName, date, minutes }: { to: string, studentName: string, date: string, minutes: number }) {
  const msg = `⚠️ *MonÉcole+ | Notification de Retard*\n\nBonjour, l'élève *${studentName}* a été signalé en retard de *${minutes} minutes* le *${date}*.\n\nLa ponctualité est essentielle pour le bon déroulement des cours.`
  return sendWhatsAppMessage({ to, message: msg, templateName: "retard" })
}

export async function sendNewGradeWhatsApp({ to, studentName, subjectName, grade, max = 20 }: { to: string, studentName: string, subjectName: string, grade: number, max?: number }) {
  const msg = `📝 *MonÉcole+ | Nouvelle Note*\n\nUne nouvelle note a été saisie pour *${studentName}* en *${subjectName}* :\n👉 *${grade} / ${max}*\n\nConnectez-vous pour consulter le détail de l'évaluation.`
  return sendWhatsAppMessage({ to, message: msg, templateName: "new_grade" })
}

export async function sendReportCardWhatsApp({ to, studentName, period, average }: { to: string, studentName: string, period: string, average: string }) {
  const msg = `📊 *MonÉcole+ | Bulletin Disponible*\n\nLe bulletin scolaire de *${studentName}* pour le *${period}* est disponible.\n👉 Moyenne générale : *${average} / 20*\n\nLe PDF officiel est consultable depuis votre portail parent.`
  return sendWhatsAppMessage({ to, message: msg, templateName: "report_card" })
}

export async function sendPaymentReceivedWhatsApp({ to, amount, type, date }: { to: string, amount: string, type: string, date: string }) {
  const msg = `✅ *MonÉcole+ | Paiement Validé*\n\nNous confirmons la bonne réception de votre paiement de *${amount} CFA* pour : *${type}*.\nDate de validation : ${date}.\n\nMerci de votre confiance.`
  return sendWhatsAppMessage({ to, message: msg, templateName: "payment_received" })
}

export async function sendPaymentDueWhatsApp({ to, amount, type, dateLimit }: { to: string, amount: string, type: string, dateLimit: string }) {
  const msg = `🔔 *MonÉcole+ | Échéance de Paiement*\n\nRappel : Le règlement de *${amount} CFA* pour *${type}* est attendu au plus tard le *${dateLimit}*.\n\nMerci de régulariser afin d'éviter toute suspension de service.`
  return sendWhatsAppMessage({ to, message: msg, templateName: "payment_due" })
}

export async function sendUrgentMessageWhatsApp({ to, title, content }: { to: string, title: string, content: string }) {
  const msg = `🚨 *MonÉcole+ | MESSAGE URGENT*\n\n*${title}*\n\n${content}`
  return sendWhatsAppMessage({ to, message: msg, templateName: "urgent_message" })
}

export async function sendMeetingWhatsApp({ to, title, date, time, location }: { to: string, title: string, date: string, time: string, location: string }) {
  const msg = `📅 *MonÉcole+ | Invitation Réunion*\n\nVous êtes invité à la réunion :\n*${title}*\n\n🗓️ Date : *${date} à ${time}*\n📍 Lieu : *${location}*\n\nVotre présence est vivement souhaitée.`
  return sendWhatsAppMessage({ to, message: msg, templateName: "meeting" })
}

export async function sendAnnouncementWhatsApp({ to, title, date }: { to: string, title: string, date: string }) {
  const msg = `📢 *MonÉcole+ | Nouvelle Annonce*\n\nUne nouvelle annonce importante est disponible :\n*${title}* (${date})\n\nConsultez les détails sur la plateforme MonÉcole+.`
  return sendWhatsAppMessage({ to, message: msg, templateName: "announcement" })
}

export async function sendSupportWhatsApp({ to, ticketId, status }: { to: string, ticketId: string, status: string }) {
  const msg = `🛠️ *MonÉcole+ | Support Technique*\n\nLe statut de votre ticket de support *#${ticketId}* a été mis à jour.\n👉 Nouveau statut : *${status}*\n\nMerci de consulter votre messagerie de support.`
  return sendWhatsAppMessage({ to, message: msg, templateName: "support_ticket" })
}
