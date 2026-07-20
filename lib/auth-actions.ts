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
    let schoolId: number | null = null

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

    // Set a simple session cookie
    const cookieStore = await cookies()
    cookieStore.set("user_id", newUser.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })
    
    if (schoolId) {
      redirect(`/signup/success?school=${schoolName}&subdomain=${newSchoolSlug}`)
    }
    
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
    const prisma = await getPrisma()
    console.log(`[Login] Attempting login for: ${email}`)
    const user = await prisma.user.findUnique({
      where: { email }
    })

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

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set("user_id", user.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

  } catch (error) {
    console.error("Login error:", error)
    return { error: "Une erreur est survenue lors de la connexion." }
  }

  redirect("/dashboard")
}

export async function logoutUser() {
  const cookieStore = await cookies()
  cookieStore.delete("user_id")
  redirect("/login")
}
