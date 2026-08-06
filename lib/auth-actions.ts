"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import prismaMaster from "@/lib/prisma"
import { getPrisma, getCurrentTenant } from "@/lib/tenant-context"
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

  try {
    // Signup is usually global (Master DB) or specific to a subdomain
    const tenant = await getCurrentTenant()
    const prisma = await getPrisma()

    // Check if user already exists in THIS context
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return { error: "Cet email est déjà utilisé." }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    let targetPrisma = prisma
    let schoolId: number | null = tenant?.id || null

    let newSchoolSlug = ""

    // If we are on the main signup and creating a new school
    if (!tenant && schoolName) {
      const slug = schoolName
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Enlève les accents
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]/g, '-') // Remplace les caractères non alphanumériques par des tirets
        .replace(/-+/g, '-') // Enlève les tirets multiples
        .replace(/^-|-$/g, '') // Enlève les tirets aux extrémités
      const dbName = `monecole_${slug.replace(/-/g, '_')}_${Date.now().toString().slice(-4)}`
      
      // 1. Provision the database
      const provisionStatus = await provisionTenantDatabase(dbName)
      if (!provisionStatus.success) {
        return { error: `Erreur lors de la création de la base de données : ${provisionStatus.error}` }
      }

      // 2. Create the school in Master DB
      const newSchool = await prismaMaster.ecole.create({
        data: {
          nom: schoolName,
          subdomain: slug,
          database_url: provisionStatus.url
        }
      })
      schoolId = newSchool.id
      newSchoolSlug = slug
      targetPrisma = getTenantClient(newSchool.database_url!)

      // CRITICAL FIX: Create the school stub in the tenant DB to satisfy FK constraints
      await targetPrisma.ecole.create({
        data: {
          id: schoolId,
          nom: schoolName,
          subdomain: slug
        }
      })
    }

    // Create the user in the appropriate DB
    const newUser = await targetPrisma.user.create({
      data: {
        nom: `${firstName} ${lastName}`,
        email,
        password: hashedPassword,
        role: role || "admin",
        id_ecole: schoolId
      }
    })

    // Create the user in Master DB for centralized login
    if (schoolId) {
      try {
        await prismaMaster.user.create({
          data: {
            nom: `${firstName} ${lastName}`,
            email,
            password: hashedPassword,
            role: role || "admin",
            id_ecole: schoolId
          }
        })
      } catch (e) {
        console.error("Could not sync user to master DB:", e)
      }
    }

    // Set a simple session cookie
    const cookieStore = await cookies()
    cookieStore.set("user_id", newUser.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    if (schoolId) {
      cookieStore.set("school_id", schoolId.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      })
    }
    
    if (schoolId) {
      return { success: true, url: `/signup/success?school=${schoolName}&subdomain=${newSchoolSlug}` }
    }
    
    return { success: true, url: "/dashboard" }
    
  } catch (error: any) {
    if (error.message?.includes("NEXT_REDIRECT")) throw error;
    console.error("Signup error:", error)
    return { error: `Une erreur est survenue lors de l'inscription: ${error.message}` }
  }

  redirect("/dashboard")
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

    if (user.id_ecole) {
      // Find the school to get its database_url
      const ecole = await prismaMaster.ecole.findUnique({
        where: { id: user.id_ecole }
      })
      if (ecole && ecole.database_url) {
        const tenantPrisma = getTenantClient(ecole.database_url)
        const tenantUser = await tenantPrisma.user.findUnique({
          where: { email }
        })
        if (tenantUser) {
          tenantUserId = tenantUser.id
        }
      }
    }

    // Set session cookie using the TENANT USER ID (crucial for dashboard)
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
