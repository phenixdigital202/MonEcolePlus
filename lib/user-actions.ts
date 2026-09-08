"use server"

import { cookies } from "next/headers"
import prismaMaster from "@/lib/prisma"
import { getPrisma } from "@/lib/tenant-context"
import bcrypt from "bcryptjs"

/**
 * Updates the user's profile photo (avatar_url) in both Tenant DB and Master DB.
 */
export async function updateUserProfilePhotoAction(avatarUrl: string) {
  try {
    const cookieStore = await cookies()
    const sessionUserId = cookieStore.get("user_id")?.value

    if (!sessionUserId) {
      return { success: false, error: "Non authentifié." }
    }

    if (!avatarUrl || typeof avatarUrl !== "string") {
      return { success: false, error: "URL d'image invalide." }
    }

    const { getCachedUser } = require("@/lib/cached-queries")
    const masterUser = await getCachedUser(parseInt(sessionUserId))

    if (!masterUser) {
      return { success: false, error: "Utilisateur introuvable." }
    }

    const tenantPrisma = await getPrisma()

    // 1. Find tenant user by email
    const tenantUser = await tenantPrisma.user.findUnique({
      where: { email: masterUser.email.toLowerCase().trim() }
    })

    if (!tenantUser) {
      return { success: false, error: "Utilisateur locataire introuvable." }
    }

    // 2. Update avatar_url in Tenant DB
    await tenantPrisma.user.update({
      where: { id: tenantUser.id },
      data: { avatar_url: avatarUrl }
    })

    // 3. Update avatar_url in Master DB by email
    try {
      await prismaMaster.user.update({
        where: { email: masterUser.email.toLowerCase().trim() },
        data: { avatar_url: avatarUrl }
      })
    } catch (masterErr: any) {
      console.warn("[updateUserProfilePhotoAction] Master DB sync warning:", masterErr.message)
    }

    console.log(`[updateUserProfilePhotoAction] Profile photo updated for user ${masterUser.email}`)
    return { success: true, avatar_url: avatarUrl }

  } catch (error: any) {
    console.error("[updateUserProfilePhotoAction] Error:", error)
    return { success: false, error: error.message || "Erreur lors de la mise à jour de la photo." }
  }
}

/**
 * Updates user profile information (firstName, lastName, email).
 */
export async function updateUserProfileInfoAction(formData: {
  firstName: string
  lastName: string
  email: string
}) {
  try {
    const cookieStore = await cookies()
    const sessionUserId = cookieStore.get("user_id")?.value

    if (!sessionUserId) {
      return { success: false, error: "Non authentifié." }
    }

    const { firstName, lastName, email } = formData
    if (!firstName || !firstName.trim() || !lastName || !lastName.trim()) {
      return { success: false, error: "Le prénom et le nom sont requis." }
    }

    const newEmail = (email || "").toLowerCase().trim()
    if (!newEmail || !newEmail.includes("@")) {
      return { success: false, error: "Adresse email invalide." }
    }

    const { getCachedUser } = require("@/lib/cached-queries")
    const masterUser = await getCachedUser(parseInt(sessionUserId))

    if (!masterUser) {
      return { success: false, error: "Utilisateur introuvable." }
    }

    const newFullName = `${firstName.trim()} ${lastName.trim()}`
    const tenantPrisma = await getPrisma()

    // Find current tenant user by email
    const tenantUser = await tenantPrisma.user.findUnique({
      where: { email: masterUser.email.toLowerCase().trim() }
    })

    if (!tenantUser) {
      return { success: false, error: "Utilisateur locataire introuvable." }
    }

    // Check email change uniqueness
    if (newEmail !== masterUser.email.toLowerCase().trim()) {
      const existingMaster = await prismaMaster.user.findUnique({
        where: { email: newEmail }
      })
      if (existingMaster) {
        return { success: false, error: "Cet email est déjà utilisé par un autre compte." }
      }
    }

    // 1. Update Tenant DB
    const updatedTenantUser = await tenantPrisma.user.update({
      where: { id: tenantUser.id },
      data: {
        nom: newFullName,
        email: newEmail
      }
    })

    // 2. Update Master DB by email
    try {
      await prismaMaster.user.update({
        where: { email: masterUser.email.toLowerCase().trim() },
        data: {
          nom: newFullName,
          email: newEmail
        }
      })
    } catch (masterErr: any) {
      console.warn("[updateUserProfileInfoAction] Master DB sync warning:", masterErr.message)
    }

    console.log(`[updateUserProfileInfoAction] Profile updated for user ${masterUser.id}: nom="${newFullName}", email="${newEmail}"`)

    return { 
      success: true, 
      user: {
        nom: updatedTenantUser.nom,
        email: updatedTenantUser.email
      }
    }

  } catch (error: any) {
    console.error("[updateUserProfileInfoAction] Error:", error)
    return { success: false, error: error.message || "Erreur lors de la mise à jour du profil." }
  }
}

/**
 * Changes user password with bcrypt hashing and validation across Master DB & Tenant DB.
 */
export async function changeUserPasswordAction(formData: {
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
}) {
  try {
    const cookieStore = await cookies()
    const sessionUserId = cookieStore.get("user_id")?.value

    if (!sessionUserId) {
      return { success: false, error: "Non authentifié." }
    }

    const { currentPassword, newPassword, confirmPassword } = formData

    if (!currentPassword) {
      return { success: false, error: "Le mot de passe actuel est requis." }
    }

    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: "Le nouveau mot de passe doit contenir au moins 6 caractères." }
    }

    if (newPassword !== confirmPassword) {
      return { success: false, error: "La confirmation du mot de passe ne correspond pas." }
    }

    const { getCachedUser } = require("@/lib/cached-queries")
    const masterUser = await getCachedUser(parseInt(sessionUserId))

    if (!masterUser) {
      return { success: false, error: "Utilisateur introuvable." }
    }

    // Verify current password against Master DB user by email
    const dbMasterUser = await prismaMaster.user.findUnique({
      where: { email: masterUser.email.toLowerCase().trim() }
    })

    if (!dbMasterUser) {
      return { success: false, error: "Compte utilisateur introuvable." }
    }

    const isMatch = await bcrypt.compare(currentPassword, dbMasterUser.password)
    if (!isMatch) {
      return { success: false, error: "Le mot de passe actuel est incorrect." }
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10)

    // 1. Update Master DB by email
    await prismaMaster.user.update({
      where: { email: masterUser.email.toLowerCase().trim() },
      data: { password: hashedNewPassword }
    })

    // 2. Update Tenant DB
    try {
      const tenantPrisma = await getPrisma()
      const tenantUser = await tenantPrisma.user.findUnique({
        where: { email: masterUser.email.toLowerCase().trim() }
      })

      if (tenantUser) {
        await tenantPrisma.user.update({
          where: { id: tenantUser.id },
          data: { password: hashedNewPassword }
        })
      }
    } catch (tenantErr: any) {
      console.warn("[changeUserPasswordAction] Tenant DB password update warning:", tenantErr.message)
    }

    console.log(`[changeUserPasswordAction] Password changed successfully for user ${masterUser.email}`)
    return { success: true }

  } catch (error: any) {
    console.error("[changeUserPasswordAction] Error:", error)
    return { success: false, error: error.message || "Erreur lors du changement de mot de passe." }
  }
}
