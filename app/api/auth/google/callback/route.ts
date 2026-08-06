import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prismaMaster = new PrismaClient()

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  
  const client_id = process.env.GOOGLE_CLIENT_ID
  const client_secret = process.env.GOOGLE_CLIENT_SECRET
  const nextauth_url = process.env.NEXTAUTH_URL || "http://localhost:3000"
  const redirect_uri = `${nextauth_url}/api/auth/google/callback`

  if (!code || !client_id || !client_secret) {
    return NextResponse.json({ error: "Code d'autorisation ou configuration manquante." }, { status: 400 })
  }

  try {
    // 1. Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id,
        client_secret,
        redirect_uri,
        grant_type: "authorization_code"
      })
    })

    const tokenData = await tokenRes.json()
    if (!tokenRes.ok) {
      throw new Error(`Google token exchange failed: ${JSON.stringify(tokenData)}`)
    }

    // 2. Fetch user profile from Google
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    })

    const userData = await userRes.json()
    if (!userRes.ok) {
      throw new Error(`Google userinfo fetch failed: ${JSON.stringify(userData)}`)
    }

    const email = userData.email.toLowerCase().trim()
    const name = userData.name || "Utilisateur Google"

    // 3. Search user in Master DB
    let user = await prismaMaster.user.findUnique({
      where: { email }
    })

    // 4. Auto-creation / onboarding if user doesn't exist
    if (!user) {
      console.log(`[Google OAuth] Creating new user for: ${email}`)
      const randomPassword = Math.random().toString(36).substring(2, 15)
      const hashedPassword = await bcrypt.hash(randomPassword, 10)
      
      user = await prismaMaster.user.create({
        data: {
          nom: name,
          email,
          password: hashedPassword,
          role: "admin", // Default role for new signups
          id_ecole: null
        }
      })
    }

    // 5. Establish session cookies (Exactly matches existing session format)
    const cookieStore = await cookies()
    cookieStore.set("user_id", user.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/"
    })

    cookieStore.set("user_role", user.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/"
    })

    if (user.id_ecole) {
      cookieStore.set("school_id", user.id_ecole.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
        path: "/"
      })
    }

    // 6. Redirect depending on role
    let redirectPath = "/dashboard"
    if (user.role === "super_admin") {
      redirectPath = "/super-admin"
    } else if (user.role === "parent") {
      redirectPath = "/dashboard/parent"
    } else if (user.role === "student") {
      redirectPath = "/dashboard/student"
    }

    return NextResponse.redirect(`${nextauth_url}${redirectPath}`)
  } catch (error: any) {
    console.error("[Google Callback Error] OAuth flow failed:", error)
    return NextResponse.redirect(`${nextauth_url}/login?error=${encodeURIComponent("Échec de la connexion via Google.")}`)
  }
}
