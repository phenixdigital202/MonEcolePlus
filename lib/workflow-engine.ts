import { PrintEngine } from "./print-engine"
import { sendEmail, sendPaymentReceivedEmail } from "./mail"
import { sendWhatsAppMessage } from "./whatsapp"
import { getPrisma } from "./tenant-context"

/**
 * WorkflowEngine coordinates automated sequences (triggers and actions)
 * when key school events occur.
 */
export class WorkflowEngine {
  /**
   * Workflow: Payment Validated -> Certify -> Email Receipt -> WhatsApp Notification -> Log
   */
  static async triggerPaymentValidatedWorkflow({
    paymentId,
    studentName,
    studentEmail,
    parentPhoneNumber,
    amount,
    paymentType,
    id_utilisateur,
    id_ecole
  }: {
    paymentId: number
    studentName: string
    studentEmail: string
    parentPhoneNumber?: string
    amount: number
    paymentType: string
    id_utilisateur: number
    id_ecole: number
  }) {
    console.log(`[WorkflowEngine] Starting workflow for validated payment (ID: ${paymentId})...`)

    try {
      const prisma = await getPrisma()

      // 1. Generate certified document & verification details
      const cert = await PrintEngine.certifyDocument({
        typeDocument: "recu",
        id_utilisateur,
        id_ecole,
        payload: { paymentId, studentName, amount, paymentType }
      })
      console.log(`[WorkflowEngine] Document certified. Serial: ${cert.numeroUnique}`)

      // 2. Format HTML receipt template
      const receiptHtml = PrintEngine.getCertifiedReceiptHtml(cert, studentName, amount, paymentType)

      // 3. Dispatch Email confirmation
      await sendEmail({
        to: studentEmail,
        subject: `[MonÉcole+] Reçu de Paiement Certifié - ${cert.numeroUnique}`,
        bodyHtml: receiptHtml,
        templateName: "payment_received"
      })
      console.log(`[WorkflowEngine] Email receipt dispatched to: ${studentEmail}`)

      // 4. Dispatch WhatsApp confirmation if parent phone is available
      if (parentPhoneNumber) {
        const whatsAppMsg = `✅ *MonÉcole+ | Reçu de Paiement*\n\nBonjour, le paiement de *${amount.toLocaleString("fr-FR")} FCFA* pour l'élève *${studentName}* (Frais de ${paymentType}) a été validé avec succès.\n\nN° unique de reçu : *${cert.numeroUnique}*\n\nSHA256 : ${cert.hashSha256}`
        await sendWhatsAppMessage({
          to: parentPhoneNumber,
          message: whatsAppMsg,
          templateName: "payment_received"
        })
        console.log(`[WorkflowEngine] WhatsApp notification dispatched to: ${parentPhoneNumber}`)
      }

      // 5. Update payment status in Tenant DB
      await prisma.paiement.update({
        where: { id: paymentId },
        data: {
          status: "paye",
          transactionRef: cert.numeroUnique
        }
      })
      console.log(`[WorkflowEngine] Payment ID ${paymentId} marked as validated.`)

      return { success: true, cert }
    } catch (err: any) {
      console.error(`[WorkflowEngine] Error running payment workflow:`, err.message)
      return { success: false, error: err.message }
    }
  }
}
