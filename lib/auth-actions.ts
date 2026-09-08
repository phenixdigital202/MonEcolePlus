"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import prismaMaster from "@/lib/prisma"
import { getTenantClient } from "@/lib/prisma-tenant"
import { provisionTenantDatabase } from "./db-provisioner"
import bcrypt from "bcryptjs"

export async function registerUser(formData: FormData) {
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const role = formData.get("role") as any
  const schoolName = formData.get("school") as string

  if (!email || !password) {
    return { error: "L'email et le mot de passe sont requis." }
  }

  if (!schoolName || !schoolName.trim()) {
    return { error: "Le nom de l'établissement est requis." }
  }

  const cleanEmail = email.toLowerCase().trim()

  try {
    // ─── STEP 1: Check if user already exists in MASTER DB ───
    // CRITICAL: We must NOT call getPrisma() here because no tenant exists yet.
    // A new user has no school_id cookie, so getPrisma() would throw.
    const existingUser = await prismaMaster.user.findUnique({
      where: { email: cleanEmail }
    })

    if (existingUser) {
      return { error: "Cet email est déjà utilisé." }
    }

    // ─── STEP 2: Provision the new tenant database ───
    const slug = schoolName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
    const dbName = `monecole_${slug.replace(/-/g, '_')}_${Date.now().toString().slice(-4)}`
    
    console.log(`[registerUser] Provisioning tenant database: ${dbName}`)
    const provisionStatus = await provisionTenantDatabase(dbName)
    if (!provisionStatus.success) {
      return { error: `Erreur lors de la création de la base de données : ${provisionStatus.error}` }
    }
    console.log(`[registerUser] Tenant database provisioned successfully: ${dbName}`)

    // ─── STEP 3: Create school in Master DB ───
    const newSchool = await prismaMaster.ecole.create({
      data: {
        nom: schoolName.trim(),
        subdomain: slug,
        database_url: provisionStatus.url
      }
    })
    const schoolId = newSchool.id
    console.log(`[registerUser] School created in Master DB: ID=${schoolId}, nom=${schoolName}`)

    // ─── STEP 4: Initialize the school stub in Tenant DB (FK constraint) ───
    const tenantPrisma = getTenantClient(newSchool.database_url!)
    try {
      await tenantPrisma.ecole.create({
        data: {
          id: schoolId,
          nom: schoolName.trim(),
          subdomain: slug
        }
      })
      console.log(`[registerUser] School stub created in Tenant DB`)
    } catch (e: any) {
      console.error(`[registerUser] Tenant school stub creation failed:`, e.message)
      // Non-fatal: FK may not exist for ecole in some schemas
    }

    // ─── STEP 5: Hash password ───
    const hashedPassword = await bcrypt.hash(password, 10)
    const fullName = `${firstName} ${lastName}`.trim()
    const userRole = role || "admin"

    // ─── STEP 6: Create user in Tenant DB ───
    const tenantUser = await tenantPrisma.user.create({
      data: {
        nom: fullName,
        email: cleanEmail,
        password: hashedPassword,
        role: userRole,
        id_ecole: schoolId
      }
    })
    console.log(`[registerUser] Tenant user created: ID=${tenantUser.id}, email=${cleanEmail}`)

    // ─── STEP 7: Create user in Master DB (for centralized login) ───
    let masterUser;
    try {
      masterUser = await prismaMaster.user.create({
        data: {
          nom: fullName,
          email: cleanEmail,
          password: hashedPassword,
          role: userRole,
          id_ecole: schoolId
        }
      })
      console.log(`[registerUser] Master user created: ID=${masterUser.id}`)
    } catch (e: any) {
      console.error("[registerUser] Master DB user sync error (non-fatal):", e.message)
      // The tenant user is the source of truth for this tenant
    }

    // ─── STEP 8: Set session cookies ───
    // IMPORTANT: user_id in cookie = Master user ID (used by login/getCachedUser)
    const cookieStore = await cookies()
    const sessionUserId = masterUser?.id || tenantUser.id

    cookieStore.set("user_id", sessionUserId.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    cookieStore.set("user_role", userRole, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    cookieStore.set("school_id", schoolId.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    console.log(`[registerUser] Session cookies set: user_id=${sessionUserId}, user_role=${userRole}, school_id=${schoolId}`)

    return { success: true, url: `/signup/success?school=${encodeURIComponent(schoolName)}&subdomain=${slug}` }
    
  } catch (error: any) {
    if (error.message?.includes("NEXT_REDIRECT")) throw error;
    console.error("[registerUser] FATAL ERROR:", error)
    return { error: `Une erreur est survenue lors de l'inscription: ${error.message}` }
  }
}

export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "L'email et le mot de passe sont requis." }
  }

  try {
    const cleanEmail = email.toLowerCase().trim()
    // ALWAYS search in Master DB for unified login
    console.log(`[Login] Attempting login for: ${cleanEmail}`)
    let user = await prismaMaster.user.findUnique({
      where: { email: cleanEmail }
    })

    // Auto-guerison : Si absent (notamment sur la base de production Vercel), on le cree a la volee
    if (!user && cleanEmail === "admin@phenixdigital.ci") {
      console.log(`[Login] Auto-provisioning Super Admin pour: ${cleanEmail}`)
      const hashedPassword = await bcrypt.hash("supersecuresaas123", 10)
      user = await prismaMaster.user.create({
        data: {
          nom: "Phénix Digital CI",
          email: cleanEmail,
          password: hashedPassword,
          role: "super_admin",
          id_ecole: null
        }
      })
    }

    if (!user) {
      console.log(`[Login] User not found in database.`)
      return { error: "Identifiants invalides." }
    }
    
    console.log(`[Login] User found: ${user.nom}`)

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return { error: "Identifiants invalides." }
    }

    let tenantUserId = user.id;

    // Set session cookie using the UNIFIED MASTER USER ID (avoids ID mismatches across tenant databases)
    const cookieStore = await cookies()
    cookieStore.set("user_id", tenantUserId.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    cookieStore.set("user_role", user.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })
    
    if (user.role === "super_admin") {
      // Nettoyage complet de toute trace de tenant
      cookieStore.delete("school_id")
      cookieStore.delete("tenant_id")
      cookieStore.delete("tenant_slug")
      cookieStore.delete("school_slug")
      cookieStore.delete("database")
    } else if (user.id_ecole) {
      cookieStore.set("school_id", user.id_ecole.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      })
    }

    return { success: true, role: user.role }
  } catch (error: any) {
    if (error.message?.includes("NEXT_REDIRECT")) throw error;
    console.error("Login error:", error)
    return { error: "Une erreur est survenue lors de la connexion." }
  }
}

export async function logoutUser() {
  const cookieStore = await cookies()
  cookieStore.delete("user_id")
  cookieStore.delete("user_role")
  cookieStore.delete("school_id")
  cookieStore.delete("tenant_id")
  cookieStore.delete("tenant_slug")
  cookieStore.delete("school_slug")
  cookieStore.delete("database")
  redirect("/login")
}

export async function forgotPasswordAction(email: string) {
  if (!email) {
    return { error: "L'adresse email est requise." }
  }

  const cleanEmail = email.toLowerCase().trim()

  try {
    // 1. Check if user exists in Master DB
    const user = await prismaMaster.user.findUnique({
      where: { email: cleanEmail }
    })

    if (!user) {
      // Security: Do not reveal user existence
      return { success: true, message: "Si cette adresse existe, un lien de réinitialisation a été envoyé." }
    }

    // 2. Generate secure token
    const crypto = require("crypto")
    const rawToken = crypto.randomBytes(32).toString("hex")
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex")
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes

    // 3. Delete any active tokens for this user
    await prismaMaster.resetPasswordToken.deleteMany({
      where: { userId: user.id }
    })

    // 4. Save new token
    await prismaMaster.resetPasswordToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt
      }
    })

    // 5. Send email using SMTP
    const { sendEmail } = require("./mail")
    const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${rawToken}`
    
    await sendEmail({
      to: cleanEmail,
      subject: "[MonÉcole+] Réinitialisation de votre mot de passe",
      templateName: "forgot_password",
      bodyHtml: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #e2e8f0; border-radius: 24px; background: #ffffff;">
          <h2 style="color: #0f172a; font-weight: 800; font-size: 22px; margin-top: 0;">Bonjour ${user.nom},</h2>
          <p style="color: #475569; font-size: 15px; line-height: 1.6;">Vous avez demandé la réinitialisation de votre mot de passe pour votre compte MonÉcole+.</p>
          <p style="color: #475569; font-size: 15px; line-height: 1.6;">Veuillez cliquer sur le bouton ci-dessous pour configurer un nouveau mot de passe sécurisé :</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="display: inline-block; padding: 14px 28px; background-color: #2563eb; color: #ffffff !important; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 15px; box-shadow: 0 10px 15px -3px rgba(37,99,235,0.2);">Réinitialiser mon mot de passe</a>
          </div>
          <p style="color: #64748b; font-size: 12px; margin-top: 30px; line-height: 1.5; border-top: 1px solid #f1f5f9; padding-top: 20px;">Ce lien expira automatiquement dans 30 minutes. Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail en toute sécurité.</p>
        </div>
      `
    })

    return { success: true, message: "Si cette adresse existe, un lien de réinitialisation a été envoyé." }
  } catch (error: any) {
    console.error("Forgot password error:", error)
    return { error: "Une erreur est survenue lors de la demande." }
  }
}

export async function resetPasswordAction(token: string, newPassword: string) {
  if (!token || !newPassword) {
    return { error: "Paramètres invalides." }
  }

  try {
    // 1. Hash incoming token for lookup
    const crypto = require("crypto")
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex")

    // 2. Fetch token from DB
    const tokenRecord = await prismaMaster.resetPasswordToken.findUnique({
      where: { tokenHash }
    })

    if (!tokenRecord || tokenRecord.used || tokenRecord.expiresAt.getTime() < Date.now()) {
      return { error: "Le lien de réinitialisation est invalide ou a expiré." }
    }

    // 3. Get user
    const user = await prismaMaster.user.findUnique({
      where: { id: tokenRecord.userId }
    })

    if (!user) {
      return { error: "Utilisateur introuvable." }
    }

    // 4. Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // 5. Update password in Master DB
    await prismaMaster.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    })

    // 6. If user belongs to school, update password in Tenant DB
    if (user.id_ecole) {
      const ecole = await prismaMaster.ecole.findUnique({
        where: { id: user.id_ecole }
      })
      if (ecole && ecole.database_url) {
        const tenantPrisma = getTenantClient(ecole.database_url)
        // Find user by email in tenant DB
        const tenantUser = await tenantPrisma.user.findUnique({
          where: { email: user.email }
        })
        if (tenantUser) {
          await tenantPrisma.user.update({
            where: { id: tenantUser.id },
            data: { password: hashedPassword }
          })
        }
      }
    }

    // 7. Mark token as used
    await prismaMaster.resetPasswordToken.update({
      where: { id: tokenRecord.id },
      data: { used: true }
    })

    return { success: true }
  } catch (error: any) {
    console.error("Reset password error:", error)
    return { error: "Une erreur est survenue lors de la réinitialisation." }
  }
}
