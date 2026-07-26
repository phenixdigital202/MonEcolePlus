import nodemailer from "nodemailer"
import { getPrisma } from "@/lib/tenant-context"

// SMTP Configuration details
const smtpHost = process.env.SMTP_HOST || ""
const smtpPort = parseInt(process.env.SMTP_PORT || "587")
const smtpUser = process.env.SMTP_USER || ""
const smtpPass = process.env.SMTP_PASSWORD || ""
const smtpFrom = process.env.SMTP_FROM || "MonÉcole+ <noreply@monecoleplus.com>"

// Cache/Reusable nodemailer transporter
let transporter: any = null

function getTransporter() {
  if (transporter) return transporter

  if (smtpHost && smtpUser && smtpPass) {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })
  } else {
    // Console fallback logger transporter for development/testing
    transporter = {
      sendMail: async (options: any) => {
        console.log("=== [SMTP Fallback Log] Email Sent ===")
        console.log(`From: ${options.from}`)
        console.log(`To: ${options.to}`)
        console.log(`Subject: ${options.subject}`)
        console.log(`Body Snippet: ${options.text || options.html?.slice(0, 300)}...`)
        return { messageId: `mock_${Date.now()}` }
      }
    }
  }
  return transporter
}

/**
 * Base email layout helper
 */
function getEmailHtmlTemplate(title: string, contentHtml: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 24px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
          .header { background: linear-gradient(135deg, #2563eb, #4f46e5); color: #ffffff; padding: 32px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.05em; }
          .content { padding: 32px; line-height: 1.6; }
          .content h2 { color: #0f172a; margin-top: 0; font-size: 18px; font-weight: 700; }
          .btn { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff !important; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px; margin-top: 20px; text-align: center; }
          .footer { background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
          .footer a { color: #2563eb; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>MonÉcole+</h1>
          </div>
          <div class="content">
            ${contentHtml}
          </div>
          <div class="footer">
            <p>Cet email a été envoyé par <strong>MonÉcole+</strong>.</p>
            <p>© 2026 MonÉcole+. Tous droits réservés.</p>
          </div>
        </div>
      </body>
    </html>
  `
}

/**
 * Log and send helper (Saves record to DB and executes dispatch)
 */
export async function sendEmail({
  to,
  subject,
  bodyHtml,
  templateName,
  scheduledFor = null
}: {
  to: string
  subject: string
  bodyHtml: string
  templateName: string
  scheduledFor?: Date | null
}) {
  const prisma = await getPrisma()
  
  // 1. Create database log entry
  const emailLog = await prisma.notificationEmail.create({
    data: {
      to,
      subject,
      body: bodyHtml,
      templateName,
      status: scheduledFor ? "pending" : "sending",
      scheduledFor,
    }
  })

  // If scheduled for future, do not send yet
  if (scheduledFor && scheduledFor.getTime() > Date.now()) {
    await prisma.notificationEmail.update({
      where: { id: emailLog.id },
      data: { status: "pending" }
    })
    return emailLog
  }

  // 2. Dispatch email immediately
  try {
    const mailTransporter = getTransporter()
    await mailTransporter.sendMail({
      from: smtpFrom,
      to,
      subject,
      html: bodyHtml,
    })

    // 3. Mark as sent
    return await prisma.notificationEmail.update({
      where: { id: emailLog.id },
      data: {
        status: "sent",
        sentAt: new Date()
      }
    })
  } catch (error: any) {
    console.error(`[Email Error] Failed to send to ${to}:`, error)
    
    // 4. Mark as failed with error log
    return await prisma.notificationEmail.update({
      where: { id: emailLog.id },
      data: {
        status: "failed",
        errorMessage: error.message || String(error)
      }
    })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL SENDERS FOR 12 TEMPLATES
// ─────────────────────────────────────────────────────────────────────────────

export async function sendNewGradeEmail({ to, studentName, subjectName, grade, max = 20, comment }: { to: string, studentName: string, subjectName: string, grade: number, max?: number, comment?: string }) {
  const title = "Nouvelle Note Disponible"
  const content = `
    <h2>Bonjour,</h2>
    <p>Une nouvelle note a été enregistrée pour l'élève <strong>${studentName}</strong> :</p>
    <div style="background-color: #f1f5f9; padding: 16px; border-radius: 12px; margin: 16px 0;">
      <p style="margin: 0; font-size: 14px; color: #64748b;">Matière :</p>
      <p style="margin: 4px 0 0 0; font-weight: bold; font-size: 16px; color: #0f172a;">${subjectName}</p>
      <p style="margin: 12px 0 0 0; font-size: 14px; color: #64748b;">Note :</p>
      <p style="margin: 4px 0 0 0; font-weight: 900; font-size: 24px; color: #2563eb;">${grade} / ${max}</p>
      ${comment ? `
        <p style="margin: 12px 0 0 0; font-size: 14px; color: #64748b;">Commentaire :</p>
        <p style="margin: 4px 0 0 0; font-style: italic; color: #334155;">"${comment}"</p>
      ` : ""}
    </div>
    <p>Connectez-vous à la plateforme pour consulter le bulletin complet.</p>
    <a href="https://monecoleplus.com/login" class="btn">Accéder à MonÉcole+</a>
  `
  return sendEmail({ to, subject: `[MonÉcole+] Nouvelle note en ${subjectName}`, bodyHtml: getEmailHtmlTemplate(title, content), templateName: "new_grade" })
}

export async function sendNewAbsenceEmail({ to, studentName, dateAbsence, status, motif }: { to: string, studentName: string, dateAbsence: string, status: string, motif?: string }) {
  const title = "Notification d'Absence"
  const content = `
    <h2>Bonjour,</h2>
    <p>Nous vous informons que l'élève <strong>${studentName}</strong> a été marqué absent :</p>
    <div style="background-color: #fef2f2; padding: 16px; border-radius: 12px; margin: 16px 0; border: 1px solid #fee2e2;">
      <p style="margin: 0; font-size: 14px; color: #991b1b;">Date : <strong>${dateAbsence}</strong></p>
      <p style="margin: 4px 0 0 0; font-size: 14px; color: #991b1b;">Statut : <strong>${status}</strong></p>
      ${motif ? `<p style="margin: 8px 0 0 0; font-size: 13px; color: #7f1d1d;">Motif : ${motif}</p>` : ""}
    </div>
    <p>Veuillez fournir un justificatif officiel à l'administration de l'école dans les plus brefs délais.</p>
  `
  return sendEmail({ to, subject: `[MonÉcole+] Notification d'absence - ${studentName}`, bodyHtml: getEmailHtmlTemplate(title, content), templateName: "new_absence" })
}

export async function sendPaymentReceivedEmail({ to, userName, amount, type, date }: { to: string, userName: string, amount: string, type: string, date: string }) {
  const title = "Reçu de Paiement"
  const content = `
    <h2>Bonjour ${userName},</h2>
    <p>Nous confirmons la bonne réception de votre paiement :</p>
    <div style="background-color: #ecfdf5; padding: 16px; border-radius: 12px; margin: 16px 0; border: 1px solid #d1fae5;">
      <p style="margin: 0; font-size: 14px; color: #065f46;">Type de paiement : <strong>${type}</strong></p>
      <p style="margin: 4px 0 0 0; font-size: 14px; color: #065f46;">Montant payé : <strong>${amount} CFA</strong></p>
      <p style="margin: 4px 0 0 0; font-size: 14px; color: #065f46;">Date de validation : <strong>${date}</strong></p>
    </div>
    <p>Merci pour votre confiance. Votre reçu officiel est téléchargeable dans votre espace personnel.</p>
  `
  return sendEmail({ to, subject: `[MonÉcole+] Reçu de paiement - ${amount} CFA`, bodyHtml: getEmailHtmlTemplate(title, content), templateName: "payment_received" })
}

export async function sendLatePaymentEmail({ to, userName, amount, type, dateLimit }: { to: string, userName: string, amount: string, type: string, dateLimit: string }) {
  const title = "Rappel de Paiement"
  const content = `
    <h2>Bonjour ${userName},</h2>
    <p>Sauf erreur ou omission de notre part, nous n'avons pas reçu le paiement requis pour :</p>
    <div style="background-color: #fffbeb; padding: 16px; border-radius: 12px; margin: 16px 0; border: 1px solid #fef3c7;">
      <p style="margin: 0; font-size: 14px; color: #92400e;">Frais concernés : <strong>${type}</strong></p>
      <p style="margin: 4px 0 0 0; font-size: 14px; color: #92400e;">Montant en attente : <strong>${amount} CFA</strong></p>
      <p style="margin: 4px 0 0 0; font-size: 14px; color: #b45309;">Date limite de règlement : <strong>${dateLimit}</strong></p>
    </div>
    <p>Veuillez régulariser votre situation afin d'éviter toute suspension d'accès aux services scolaires.</p>
  `
  return sendEmail({ to, subject: `[MonÉcole+] Rappel important - Paiement en attente`, bodyHtml: getEmailHtmlTemplate(title, content), templateName: "late_payment" })
}

export async function sendReportCardAvailableEmail({ to, studentName, period, average }: { to: string, studentName: string, period: string, average: string }) {
  const title = "Bulletin de Notes Disponible"
  const content = `
    <h2>Bonjour,</h2>
    <p>Le bulletin de notes officiel de l'élève <strong>${studentName}</strong> pour le <strong>${period}</strong> est disponible :</p>
    <div style="background-color: #f1f5f9; padding: 16px; border-radius: 12px; margin: 16px 0;">
      <p style="margin: 0; font-size: 14px; color: #475569;">Période : <strong>${period}</strong></p>
      <p style="margin: 4px 0 0 0; font-size: 14px; color: #475569;">Moyenne obtenue : <strong>${average} / 20</strong></p>
    </div>
    <p>Vous pouvez consulter, imprimer et télécharger le bulletin au format PDF signé numériquement dans votre espace.</p>
    <a href="https://monecoleplus.com/login" class="btn">Consulter le bulletin</a>
  `
  return sendEmail({ to, subject: `[MonÉcole+] Bulletin de notes disponible - ${studentName}`, bodyHtml: getEmailHtmlTemplate(title, content), templateName: "report_card" })
}

export async function sendAdminMessageEmail({ to, authorName, subject, content }: { to: string, authorName: string, subject: string, content: string }) {
  const title = "Message de la Direction"
  const body = `
    <h2>Bonjour,</h2>
    <p>Vous avez reçu une nouvelle communication de la part de <strong>${authorName}</strong> :</p>
    <div style="background-color: #f8fafc; padding: 20px; border-radius: 16px; border: 1px solid #e2e8f0; margin: 16px 0; line-height: 1.7;">
      <p style="margin: 0; font-weight: bold; color: #0f172a; border-b: 1px solid #e2e8f0; padding-bottom: 8px;">Sujet : ${subject}</p>
      <p style="margin: 12px 0 0 0; color: #334155; white-space: pre-line;">${content}</p>
    </div>
  `
  return sendEmail({ to, subject: `[MonÉcole+] ${subject}`, bodyHtml: getEmailHtmlTemplate(title, body), templateName: "admin_message" })
}

export async function sendMeetingEmail({ to, title, description, date, time, location }: { to: string, title: string, description: string, date: string, time: string, location: string }) {
  const emailTitle = "Invitation Réunion"
  const content = `
    <h2>Bonjour,</h2>
    <p>Vous êtes convié à participer à la réunion suivante :</p>
    <div style="background-color: #f1f5f9; padding: 16px; border-radius: 12px; margin: 16px 0;">
      <p style="margin: 0; font-weight: bold; font-size: 16px; color: #0f172a;">${title}</p>
      <p style="margin: 8px 0; font-size: 14px; color: #475569;">${description}</p>
      <p style="margin: 12px 0 0 0; font-size: 13px; color: #64748b;">📅 Date : <strong>${date} à ${time}</strong></p>
      <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;">📍 Lieu : <strong>${location}</strong></p>
    </div>
  `
  return sendEmail({ to, subject: `[MonÉcole+] Invitation : ${title}`, bodyHtml: getEmailHtmlTemplate(emailTitle, content), templateName: "meeting" })
}

export async function sendConvocationEmail({ to, title, reason, date, time, location }: { to: string, title: string, reason: string, date: string, time: string, location: string }) {
  const emailTitle = "Convocation Officielle"
  const content = `
    <h2>Bonjour,</h2>
    <p>Nous vous adressons cette convocation officielle concernant :</p>
    <div style="background-color: #fff5f5; padding: 16px; border-radius: 12px; border: 1px solid #fed7d7; margin: 16px 0;">
      <p style="margin: 0; font-weight: bold; font-size: 16px; color: #c53030;">${title}</p>
      <p style="margin: 8px 0; font-size: 14px; color: #9b2c2c;">Motif : <strong>${reason}</strong></p>
      <p style="margin: 12px 0 0 0; font-size: 13px; color: #9b2c2c;">📅 Date d'entretien : <strong>${date} à ${time}</strong></p>
      <p style="margin: 4px 0 0 0; font-size: 13px; color: #9b2c2c;">📍 Bureau / Lieu : <strong>${location}</strong></p>
    </div>
    <p>Votre présence est obligatoire.</p>
  `
  return sendEmail({ to, subject: `[MonÉcole+] Convocation officielle : ${title}`, bodyHtml: getEmailHtmlTemplate(emailTitle, content), templateName: "convocation" })
}

export async function sendNewEnrollmentEmail({ to, studentName, className, date }: { to: string, studentName: string, className: string, date: string }) {
  const title = "Confirmation d'Inscription"
  const content = `
    <h2>Bonjour,</h2>
    <p>Nous avons le plaisir de vous confirmer l'inscription complète de l'élève <strong>${studentName}</strong> :</p>
    <div style="background-color: #f1f5f9; padding: 16px; border-radius: 12px; margin: 16px 0;">
      <p style="margin: 0; font-size: 14px; color: #475569;">Élève : <strong>${studentName}</strong></p>
      <p style="margin: 4px 0 0 0; font-size: 14px; color: #475569;">Classe affectée : <strong>${className}</strong></p>
      <p style="margin: 4px 0 0 0; font-size: 14px; color: #475569;">Date d'effet : <strong>${date}</strong></p>
    </div>
    <p>Vous pouvez dès à présent vous connecter pour accéder à l'emploi du temps.</p>
  `
  return sendEmail({ to, subject: `[MonÉcole+] Inscription validée pour ${studentName}`, bodyHtml: getEmailHtmlTemplate(title, content), templateName: "new_enrollment" })
}

export async function sendForgotPasswordEmail({ to, resetLink }: { to: string, resetLink: string }) {
  const title = "Réinitialisation de Mot de Passe"
  const content = `
    <h2>Bonjour,</h2>
    <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte MonÉcole+.</p>
    <p>Veuillez cliquer sur le lien ci-dessous pour définir un nouveau mot de passe :</p>
    <a href="${resetLink}" class="btn">Réinitialiser mon mot de passe</a>
    <p style="margin-top: 24px; font-size: 12px; color: #64748b;">Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail en toute sécurité.</p>
  `
  return sendEmail({ to, subject: `[MonÉcole+] Réinitialisation de votre mot de passe`, bodyHtml: getEmailHtmlTemplate(title, content), templateName: "forgot_password" })
}

export async function sendWelcomeEmail({ to, userName, role }: { to: string, userName: string, role: string }) {
  const title = "Bienvenue sur MonÉcole+"
  const content = `
    <h2>Bienvenue ${userName} !</h2>
    <p>Nous sommes ravis de vous compter parmi les utilisateurs de <strong>MonÉcole+</strong>.</p>
    <p>Votre compte a été créé avec le rôle : <strong style="text-transform: capitalize;">${role}</strong>.</p>
    <p>Découvrez dès maintenant votre nouvel espace et gérez vos activités scolaires en toute simplicité.</p>
    <a href="https://monecoleplus.com/login" class="btn">Commencer</a>
  `
  return sendEmail({ to, subject: `[MonÉcole+] Bienvenue sur notre plateforme !`, bodyHtml: getEmailHtmlTemplate(title, content), templateName: "welcome" })
}

export async function sendVerificationEmail({ to, code }: { to: string, code: string }) {
  const title = "Vérification d'Adresse Email"
  const content = `
    <h2>Bonjour,</h2>
    <p>Merci pour votre inscription. Afin de valider votre adresse e-mail, veuillez saisir le code de validation à 6 chiffres suivant sur la plateforme :</p>
    <div style="background-color: #f1f5f9; padding: 20px; border-radius: 16px; text-align: center; margin: 24px 0;">
      <span style="font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #2563eb;">${code}</span>
    </div>
    <p>Ce code expire dans 24 heures.</p>
  `
  return sendEmail({ to, subject: `[MonÉcole+] Code de vérification : ${code}`, bodyHtml: getEmailHtmlTemplate(title, content), templateName: "verification" })
}
