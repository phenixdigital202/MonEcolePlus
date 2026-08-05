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
   * Generates HTML template for a certified receipt
   */
  static getCertifiedReceiptHtml(cert: DocumentVerificationData, studentName: string, amount: number, paymentType: string) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: auto; padding: 30px; border: 2px solid #e2e8f0; border-radius: 16px; background: #fff; color: #334155;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #3b82f6; padding-bottom: 20px;">
          <div>
            <h1 style="color: #1e3a8a; margin: 0; font-size: 24px; font-weight: 800;">REÇU DE PAIEMENT CERTIFIÉ</h1>
            <p style="margin: 5px 0 0 0; font-size: 13px; color: #64748b; font-weight: bold;">N° unique : ${cert.numeroUnique}</p>
          </div>
          <div style="text-align: right;">
            <h2 style="margin: 0; color: #3b82f6; font-size: 16px;">${cert.schoolName}</h2>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #64748b;">Généré le ${new Date(cert.dateGeneration).toLocaleDateString("fr-FR")}</p>
          </div>
        </div>

        <div style="margin: 30px 0; line-height: 1.8;">
          <p>Le secrétariat général de l'établissement atteste avoir reçu de l'élève <strong>${studentName}</strong> la somme de :</p>
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
            <h3 style="margin: 0; color: #15803d; font-size: 28px; font-weight: 900;">${amount.toLocaleString("fr-FR")} FCFA</h3>
            <p style="margin: 5px 0 0 0; font-size: 13px; color: #166534; font-weight: bold;">Objet : Frais de ${paymentType}</p>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 50px; border-top: 1px solid #e2e8f0; pt: 20px;">
          <div style="font-size: 11px; color: #94a3b8; max-width: 400px;">
            <p style="margin: 0; font-weight: bold; color: #64748b;">🔒 Sécurité & Authenticité</p>
            <p style="margin: 5px 0 0 0; break-all: yes; font-family: monospace;">SHA256: ${cert.hashSha256}</p>
            <p style="margin: 5px 0 0 0;">Scannez le QR Code pour vérifier l'originalité de cette pièce sur le portail public.</p>
          </div>
          <div>
            <img src="${cert.qrCodeUrl}" style="width: 110px; height: 110px; border: 1px solid #cbd5e1; border-radius: 8px; padding: 4px;" alt="QR Verification" />
          </div>
        </div>
      </div>
    `
  }
}
