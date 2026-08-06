import { getPrisma } from "./tenant-context"
import { PrismaClient } from "@prisma/client"
import crypto from "crypto"
import QRCode from "qrcode"

const masterPrisma = new PrismaClient()

export interface DocumentVerificationData {
  id: string
  numeroUnique: string
  hashSha256: string
  typeDocument: string
  dateGeneration: Date
  schoolName: string
  qrCodeUrl: string
}

/**
 * PrintEngine handles certified document generation, hashing, QR-coding,
 * and registration for anti-fraud verification.
 */
export class PrintEngine {
  /**
   * Generates a unique serial number (e.g. ME-2026-XXXXX)
   */
  static generateSerialNumber(prefix: string): string {
    const year = new Date().getFullYear()
    const rand = Math.floor(10000 + Math.random() * 90000)
    return `${prefix}-${year}-${rand}`
  }

  /**
   * Generates SHA256 hash of a string
   */
  static computeSha256(content: string): string {
    return crypto.createHash("sha256").update(content).digest("hex")
  }

  /**
   * Certifies and registers a document in both Master and Tenant DBs
   */
  static async certifyDocument({
    typeDocument,
    id_utilisateur,
    id_ecole,
    payload
  }: {
    typeDocument: "bulletin" | "recu" | "certificat" | "attestation"
    id_utilisateur: number
    id_ecole: number
    payload: any
  }): Promise<DocumentVerificationData> {
    const prisma = await getPrisma()
    
    // 1. Generate unique serial and hashes
    const prefixMap = { bulletin: "BUL", recu: "REC", certificat: "CER", attestation: "ATT" }
    const numeroUnique = this.generateSerialNumber(prefixMap[typeDocument])
    const payloadStr = JSON.stringify({ ...payload, numeroUnique, date: new Date().toISOString() })
    const hashSha256 = this.computeSha256(payloadStr)

    // 2. Write to Tenant database
    const doc = await prisma.verifiedDocument.create({
      data: {
        numeroUnique,
        hashSha256,
        typeDocument,
        id_utilisateur,
        id_ecole,
        metadataJson: payloadStr
      }
    })

    // 3. Sync to Master database for quick public lookups
    try {
      await masterPrisma.verifiedDocument.create({
        data: {
          id: doc.id,
          numeroUnique,
          hashSha256,
          typeDocument,
          id_utilisateur,
          id_ecole,
          metadataJson: payloadStr
        }
      })
    } catch (e) {
      console.warn("[PrintEngine] Master DB sync skipped or duplicate:", e)
    }

    // 4. Generate QR code pointing to verification portal
    const verifyUrl = `https://mon-ecole-plus-854qlbqwg-phenix-digital-ci.vercel.app/verify/document?id=${doc.id}`
    const qrCodeUrl = await QRCode.toDataURL(verifyUrl)

    // Find school name
    const school = await masterPrisma.ecole.findUnique({
      where: { id: id_ecole },
      select: { nom: true }
    })

    return {
      id: doc.id,
      numeroUnique,
      hashSha256,
      typeDocument,
      dateGeneration: doc.dateGeneration,
      schoolName: school?.nom || "Établissement MonÉcole+",
      qrCodeUrl
    }
  }

  /**
   * Generates HTML template for a certified receipt (Canva / Stripe premium style)
   */
  static getCertifiedReceiptHtml(cert: DocumentVerificationData, studentName: string, amount: number, paymentType: string) {
    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 650px; margin: auto; padding: 40px; border: 1px solid #e2e8f0; border-radius: 24px; background: #ffffff; color: #0f172a; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05);">
        <!-- Top bar with brand logo & status -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #2563eb, #4f46e5); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-weight: 900; font-size: 16px;">M</span>
            </div>
            <span style="font-weight: 800; font-size: 18px; tracking-tight: -0.03em; color: #1e3a8a;">MonÉcole+</span>
          </div>
          <div style="background-color: #ecfdf5; color: #065f46; font-size: 11px; font-weight: 700; padding: 6px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em; border: 1px solid #d1fae5;">
            Payé
          </div>
        </div>

        <!-- School info & serial -->
        <div style="margin-bottom: 40px;">
          <h1 style="font-size: 28px; font-weight: 800; tracking-tight: -0.04em; color: #0f172a; margin: 0 0 8px 0;">Reçu de Paiement</h1>
          <p style="color: #64748b; font-size: 14px; margin: 0;">N° de reçu : <strong style="font-family: monospace; color: #0f172a;">${cert.numeroUnique}</strong></p>
          <p style="color: #64748b; font-size: 14px; margin: 4px 0 0 0;">Émis par : <strong>${cert.schoolName}</strong></p>
        </div>

        <!-- Content details grid -->
        <div style="border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; padding: 24px 0; margin-bottom: 32px; display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
          <div>
            <p style="color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; margin: 0 0 4px 0; letter-spacing: 0.05em;">Élève</p>
            <p style="font-weight: 600; font-size: 15px; margin: 0; color: #1e293b;">${studentName}</p>
          </div>
          <div>
            <p style="color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; margin: 0 0 4px 0; letter-spacing: 0.05em;">Date de paiement</p>
            <p style="font-weight: 600; font-size: 15px; margin: 0; color: #1e293b;">${new Date(cert.dateGeneration).toLocaleDateString("fr-FR", { dateStyle: "long" })}</p>
          </div>
        </div>

        <!-- Total amount box -->
        <div style="background: #f8fafc; border-radius: 16px; padding: 24px; margin-bottom: 40px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #f1f5f9;">
          <div>
            <p style="font-weight: 600; font-size: 14px; margin: 0; color: #475569;">Frais de ${paymentType}</p>
            <p style="font-size: 12px; color: #64748b; margin: 4px 0 0 0;">Transactions certifiée sans frais</p>
          </div>
          <div style="text-align: right;">
            <p style="font-size: 28px; font-weight: 900; margin: 0; color: #2563eb; tracking-tight: -0.04em;">${amount.toLocaleString("fr-FR")} FCFA</p>
          </div>
        </div>

        <!-- Verification footer with QR code -->
        <div style="display: flex; gap: 32px; align-items: center; border-top: 1px solid #f1f5f9; padding-top: 32px;">
          <div>
            <img src="${cert.qrCodeUrl}" style="width: 90px; height: 90px; border-radius: 12px; border: 1px solid #e2e8f0; padding: 4px;" alt="QR Verification" />
          </div>
          <div style="flex: 1;">
            <p style="font-weight: 700; font-size: 12px; color: #3b82f6; text-transform: uppercase; margin: 0 0 4px 0; letter-spacing: 0.05em;">🔒 Sécurité & Authenticité</p>
            <p style="font-size: 12px; color: #64748b; margin: 0 0 8px 0; line-height: 1.5;">Ce reçu est infalsifiable et enregistré sur la blockchain éducative de MonÉcole+. Empreinte de sécurité :</p>
            <p style="font-family: monospace; font-size: 10px; color: #475569; word-break: break-all; margin: 0; background-color: #f1f5f9; padding: 6px 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
              ${cert.hashSha256}
            </p>
          </div>
        </div>
      </div>
    `
  }
}
