"use server"

import { getPrisma } from "@/lib/tenant-context"
import { revalidatePath } from "next/cache"
import * as mailer from "./mail"

/**
 * Get email history logs
 */
export async function getEmailHistory() {
  try {
    const prisma = await getPrisma()
    const logs = await prisma.notificationEmail.findMany({
      orderBy: { sentAt: "desc" }
    })
    return { success: true, data: JSON.parse(JSON.stringify(logs)) }
  } catch (error: any) {
    console.error("Error fetching email history:", error)
    return { success: false, error: error.message || "Failed to load history" }
  }
}

/**
 * Trigger retry queue for failed emails
 */
export async function retryFailedEmails() {
  try {
    const prisma = await getPrisma()
    const failedEmails = await prisma.notificationEmail.findMany({
      where: { status: "failed", retryCount: { lt: 3 } }
    })

    let successCount = 0
    for (const email of failedEmails) {
      try {
        // Simple direct send
        const nodemailer = require("nodemailer")
        const smtpHost = process.env.SMTP_HOST || ""
        const smtpPort = parseInt(process.env.SMTP_PORT || "587")
        const smtpUser = process.env.SMTP_USER || ""
        const smtpPass = process.env.SMTP_PASSWORD || ""
        const smtpFrom = process.env.SMTP_FROM || "MonÉcole+ <noreply@monecoleplus.com>"

        let transporter
        if (smtpHost && smtpUser && smtpPass) {
          transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: { user: smtpUser, pass: smtpPass },
          })
        } else {
          transporter = {
            sendMail: async () => ({ messageId: `retry_mock_${Date.now()}` })
          }
        }

        await transporter.sendMail({
          from: smtpFrom,
          to: email.to,
          subject: email.subject,
          html: email.body
        })

        await prisma.notificationEmail.update({
          where: { id: email.id },
          data: {
            status: "sent",
            sentAt: new Date(),
            retryCount: email.retryCount + 1,
            errorMessage: null
          }
        })
        successCount++
      } catch (err: any) {
        await prisma.notificationEmail.update({
          where: { id: email.id },
          data: {
            retryCount: email.retryCount + 1,
            errorMessage: err.message || String(err)
          }
        })
      }
    }

    revalidatePath("/dashboard/admin/emails")
    return { success: true, count: successCount }
  } catch (error: any) {
    console.error("Retry queue error:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Simulate / Trigger a manual notification
 */
export async function sendSimulatedEmail(formData: FormData) {
  const to = formData.get("to") as string
  const templateName = formData.get("templateName") as string

  if (!to || !templateName) {
    return { success: false, error: "Veuillez spécifier un destinataire et un modèle." }
  }

  try {
    let result: any

    switch (templateName) {
      case "new_grade":
        result = await mailer.sendNewGradeEmail({
          to,
          studentName: "Abou Traoré",
          subjectName: "Mathématiques",
          grade: 16.5,
          max: 20,
          comment: "Excellent travail ce trimestre."
        })
        break
      case "new_absence":
        result = await mailer.sendNewAbsenceEmail({
          to,
          studentName: "Abou Traoré",
          dateAbsence: "25 Octobre 2026",
          status: "Non Justifié",
          motif: "Retard matinal injustifié."
        })
        break
      case "payment_received":
        result = await mailer.sendPaymentReceivedEmail({
          to,
          userName: "BAMBA ISSA",
          amount: "150 000",
          type: "Frais de Scolarité T1",
          date: "25 Octobre 2026"
        })
        break
      case "late_payment":
        result = await mailer.sendLatePaymentEmail({
          to,
          userName: "BAMBA ISSA",
          amount: "50 000",
          type: "Frais d'Inscription",
          dateLimit: "15 Novembre 2026"
        })
        break
      case "report_card":
        result = await mailer.sendReportCardAvailableEmail({
          to,
          studentName: "Abou Traoré",
          period: "1er Trimestre",
          average: "15.42"
        })
        break
      case "admin_message":
        result = await mailer.sendAdminMessageEmail({
          to,
          authorName: "Direction Générale",
          subject: "Note d'information importante - Tenue scolaire",
          content: "Nous rappelons que le port de la tenue scolaire réglementaire est obligatoire à compter de lundi prochain."
        })
        break
      case "meeting":
        result = await mailer.sendMeetingEmail({
          to,
          title: "Réunion Parents-Professeurs de rentrée",
          description: "Présentation de l'équipe pédagogique et des objectifs annuels.",
          date: "5 Novembre 2026",
          time: "16h00",
          location: "Salle des fêtes de l'établissement"
        })
        break
      case "convocation":
        result = await mailer.sendConvocationEmail({
          to,
          title: "Entretien de suivi pédagogique",
          reason: "Baisse significative des résultats scolaires et retards répétés.",
          date: "8 Novembre 2026",
          time: "10h30",
          location: "Bureau du censeur"
        })
        break
      case "new_enrollment":
        result = await mailer.sendNewEnrollmentEmail({
          to,
          studentName: "Abou Traoré",
          className: "Terminal S",
          date: "15 Septembre 2026"
        })
        break
      case "forgot_password":
        result = await mailer.sendForgotPasswordEmail({
          to,
          resetLink: "https://monecoleplus.com/reset-password?token=mock_token_123"
        })
        break
      case "welcome":
        result = await mailer.sendWelcomeEmail({
          to,
          userName: "Abou Traoré",
          role: "Élève"
        })
        break
      case "verification":
        result = await mailer.sendVerificationEmail({
          to,
          code: "835291"
        })
        break
      default:
        return { success: false, error: "Modèle inconnu" }
    }

    revalidatePath("/dashboard/admin/emails")
    return { success: true, status: result.status }
  } catch (err: any) {
    console.error("Simulation error:", err)
    return { success: false, error: err.message || "Failed to dispatch simulation" }
  }
}

export async function testSmtpConnectionAction(toEmail: string) {
  const { getPrisma } = require("./tenant-context")
  const prisma = await getPrisma()
  const ecole = await prisma.ecole.findFirst()

  const host = ecole?.smtp_host
  const port = ecole?.smtp_port
  const user = ecole?.smtp_user
  const pass = ecole?.smtp_pass

  if (!host || !user || !pass) {
    return {
      success: false,
      error: "Configuration manquante. Veuillez d'abord saisir vos coordonnées SMTP dans les Paramètres de l'Établissement."
    }
  }

  const { logSystem } = require("./logger")
  const nodemailer = require("nodemailer")

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: port || 587,
      secure: port === 465,
      auth: { user, pass },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000
    })

    await transporter.verify()

    const sender = `${ecole.nom} <${user}>`
    const info = await transporter.sendMail({
      from: sender,
      to: toEmail,
      subject: "[MonÉcole+] Diagnostic de Connexion SMTP Réussi",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background: #ffffff;">
          <h2 style="color: #10b981; font-weight: 800; margin-top: 0;">Diagnostic Réussi !</h2>
          <p style="color: #334155; font-size: 14px; line-height: 1.6;">Le serveur SMTP de votre établissement <b>${ecole.nom}</b> est correctement configuré.</p>
          <p style="color: #334155; font-size: 14px; line-height: 1.6;"><b>Détails de connexion :</b></p>
          <ul style="color: #475569; font-size: 13px; font-family: monospace;">
            <li>Host: ${host}</li>
            <li>Port: ${port}</li>
            <li>Utilisateur: ${user}</li>
          </ul>
          <p style="color: #64748b; font-size: 11px; margin-top: 20px; border-top: 1px solid #f1f5f9; padding-top: 15px;">Cet email confirme la bonne transmission réseau de vos notifications.</p>
        </div>
      `
    })

    await logSystem(
      "info",
      "smtp_diagnostic",
      `Test email sent successfully to ${toEmail}. Message ID: ${info.messageId}`
    )

    return {
      success: true,
      messageId: info.messageId,
      envelope: info.envelope
    }
  } catch (err: any) {
    await logSystem("error", "smtp_diagnostic", `Connection failed: ${err.message || String(err)}`)
    return {
      success: false,
      error: err.message || String(err)
    }
  }
}
