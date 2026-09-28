import { cookies } from "next/headers"
import crypto from "crypto"
import prismaMaster from "./prisma"

const SESSION_SECRET = process.env.SESSION_SECRET || "monecole_secure_session_secret_key_2026_x89a_99z"

export interface SessionPayload {
  userId: number
  role: string
  schoolId: number | null
  databaseUrl?: string
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

declare global {
  var authenticatedUserCache: Map<number, { user: any; timestamp: number }> | undefined
}

const authUserCache = globalThis.authenticatedUserCache || new Map<number, { user: any; timestamp: number }>()
globalThis.authenticatedUserCache = authUserCache
const AUTH_CACHE_TTL_MS = 60 * 1000 // 60 seconds

export function invalidateAuthenticatedUserCache(userId?: number) {
  if (userId) {
    authUserCache.delete(userId)
  } else {
    authUserCache.clear()
  }
}

/**
 * Fonction centrale pour obtenir l'utilisateur authentifié de confiance côté serveur.
 * Résout le Master User depuis le jeton cryptographique de session, avec cache en mémoire.
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

    if (sessionToken) {
      const verified = verifySessionToken(sessionToken)
      if (verified) {
        // Fast path: Token HMAC valide et données utilisateur intégrées
        const cached = authUserCache.get(verified.userId)
        if (cached && (Date.now() - cached.timestamp < AUTH_CACHE_TTL_MS)) {
          return cached.user
        }

        const userObj = {
          id: verified.userId,
          role: verified.role,
          schoolId: verified.schoolId,
          databaseUrl: verified.databaseUrl,
          nom: cached?.user?.nom || "",
          email: cached?.user?.email || ""
        }
        authUserCache.set(verified.userId, { user: userObj, timestamp: Date.now() })
        return userObj
      } else {
        console.warn("[getAuthenticatedUser] Rejet d'un session_token invalide ou altéré.")
        return null
      }
    }

    // Transition de secours si pas de session_token mais user_id présent
    const legacyUserId = cookieStore.get("user_id")?.value
    if (!legacyUserId) return null
    
    const userId = parseInt(legacyUserId)
    if (isNaN(userId)) return null

    const cached = authUserCache.get(userId)
    if (cached && (Date.now() - cached.timestamp < AUTH_CACHE_TTL_MS)) {
      return cached.user
    }

    const masterUser = await prismaMaster.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nom: true,
        email: true,
        role: true,
        id_ecole: true,
        avatar_url: true,
        ecole: { select: { database_url: true } }
      }
    })

    if (!masterUser) {
      console.warn(`[getAuthenticatedUser] Utilisateur Master ${userId} introuvable en base.`)
      return null
    }

    const result = {
      id: masterUser.id,
      nom: masterUser.nom,
      email: masterUser.email,
      role: masterUser.role,
      schoolId: masterUser.id_ecole,
      databaseUrl: masterUser.ecole?.database_url,
      avatarUrl: masterUser.avatar_url
    }

    authUserCache.set(userId, { user: result, timestamp: Date.now() })
    return result
  } catch (error: any) {
    console.error("[getAuthenticatedUser] Erreur serveur:", error)
    return null
  }
}

