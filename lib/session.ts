import { cookies } from "next/headers"
import crypto from "crypto"
import prismaMaster from "./prisma"

const SESSION_SECRET = process.env.SESSION_SECRET || "monecole_secure_session_secret_key_2026_x89a_99z"

export interface SessionPayload {
  userId: number
  role: string
  schoolId: number | null
  expiresAt: number
}

function hmacSign(data: string): string {
  return crypto.createHmac("sha256", SESSION_SECRET).update(data).digest("hex")
}

export function createSessionToken(payload: Omit<SessionPayload, "expiresAt">, durationMs = 7 * 24 * 3600 * 1000): string {
  const fullPayload: SessionPayload = {
    ...payload,
    expiresAt: Date.now() + durationMs
  }
  const payloadStr = Buffer.from(JSON.stringify(fullPayload)).toString("base64url")
  const signature = hmacSign(payloadStr)
  return `${payloadStr}.${signature}`
}

export function verifySessionToken(token: string): SessionPayload | null {
  if (!token || !token.includes(".")) return null
  try {
    const [payloadStr, signature] = token.split(".")
    if (!payloadStr || !signature) return null

    const expectedSignature = hmacSign(payloadStr)
    const sigBuffer = Buffer.from(signature, "utf8")
    const expBuffer = Buffer.from(expectedSignature, "utf8")

    if (sigBuffer.length !== expBuffer.length || !crypto.timingSafeEqual(sigBuffer, expBuffer)) {
      console.warn("[verifySessionToken] Signature invalid / Cookie falsifié détecté !")
      return null
    }

    const payload: SessionPayload = JSON.parse(Buffer.from(payloadStr, "base64url").toString("utf8"))
    
    if (Date.now() > payload.expiresAt) {
      console.warn("[verifySessionToken] Session expirée !")
      return null
    }

    return payload
  } catch (error) {
    console.error("[verifySessionToken] Erreur de décodage:", error)
    return null
  }
}

/**
 * Fonction centrale pour obtenir l'utilisateur authentifié de confiance côté serveur.
 * Résout le Master User depuis la Master DB en vérifiant le jeton cryptographique de session.
 */
export async function getAuthenticatedUser() {
  try {
    let cookieStore
    try {
      cookieStore = await cookies()
    } catch (e) {
      return null
    }

    const sessionToken = cookieStore.get("session_token")?.value
    let userId: number | null = null

    if (sessionToken) {
      const verified = verifySessionToken(sessionToken)
      if (verified) {
        userId = verified.userId
      } else {
        console.warn("[getAuthenticatedUser] Rejet d'un session_token invalide ou altéré.")
        return null
      }
    } else {
      // Transition sécurisée: Si session_token est absent mais user_id brut présent,
      // on extrait user_id ET on vérifie en Master DB que le compte existe réellement
      const legacyUserId = cookieStore.get("user_id")?.value
      if (legacyUserId) {
        const parsed = parseInt(legacyUserId)
        if (!isNaN(parsed)) userId = parsed
      }
    }

    if (!userId) {
      return null
    }

    // Interrogation obligatoire de la Master DB pour obtenir le rôle et l'établissement réels de confiance
    const masterUser = await prismaMaster.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nom: true,
        email: true,
        role: true,
        id_ecole: true,
        avatar_url: true
      }
    })

    if (!masterUser) {
      console.warn(`[getAuthenticatedUser] Utilisateur Master ${userId} introuvable en base.`)
      return null
    }

    return {
      id: masterUser.id,
      nom: masterUser.nom,
      email: masterUser.email,
      role: masterUser.role,
      schoolId: masterUser.id_ecole,
      avatarUrl: masterUser.avatar_url
    }
  } catch (error: any) {
    console.error("[getAuthenticatedUser] Erreur serveur:", error)
    return null
  }
}
