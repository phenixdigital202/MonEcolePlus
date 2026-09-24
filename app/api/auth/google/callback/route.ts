import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import prismaMaster from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const errorParam = searchParams.get("error")
  
  const urlObj = new URL(request.url)
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || urlObj.host
  const proto = request.headers.get("x-forwarded-proto") || urlObj.protocol.replace(":", "") || "http"
  const currentOrigin = `${proto}://${host}`
  
  const client_id = process.env.GOOGLE_CLIENT_ID
  const client_secret = process.env.GOOGLE_CLIENT_SECRET
  const nextauth_url = process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : currentOrigin)
  const redirect_uri = `${nextauth_url}/api/auth/google/callback`

  if (errorParam) {
    return NextResponse.redirect(`${nextauth_url}/login?error=${encodeURIComponent("Connexion Google annulée.")}`)
  }

  if (!code || !client_id || !client_secret) {
    return NextResponse.redirect(`${nextauth_url}/login?error=${encodeURIComponent("Échec Google OAuth : configuration serveur manquante.")}`)
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
      console.error("[Google OAuth] Token exchange error:", tokenData)
      throw new Error("Erreur lors de la validation des identifiants Google.")
    }

    // 2. Fetch user profile from Google
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    })

    const userData = await userRes.json()
    if (!userRes.ok) {
      console.error("[Google OAuth] Userinfo fetch error:", userData)
      throw new Error("Erreur d'accès aux informations du profil Google.")
    }

    const email = userData.email.toLowerCase().trim()
    const name = userData.name || "Utilisateur Google"
    const picture = userData.picture || null

    // 3. Search user in Master DB
    let user = await prismaMaster.user.findUnique({
      where: { email }
    })

    // 4. Auto-creation / onboarding if user doesn't exist
    if (!user) {
      console.log(`[Google OAuth] Auto-creating user for: ${email}`)
      const randomPassword = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      const hashedPassword = await bcrypt.hash(randomPassword, 10)
      
      user = await prismaMaster.user.create({
        data: {
          nom: name,
          email,
          password: hashedPassword,
          role: "admin", // Default role for Google signup
          avatar_url: picture,
          id_ecole: null
        }
      })
    } else if (picture && !user.avatar_url) {
      await prismaMaster.user.update({
        where: { id: user.id },
        data: { avatar_url: picture }
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
    return NextResponse.redirect(`${nextauth_url}/login?error=${encodeURIComponent(error.message || "Échec de la connexion via Google.")}`)
  }
}

