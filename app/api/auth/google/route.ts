import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const client_id = process.env.GOOGLE_CLIENT_ID
  const urlObj = new URL(request.url)
  const searchParams = urlObj.searchParams
  const from = searchParams.get("from") || (request.headers.get("referer")?.includes("/signup") ? "signup" : "login")

  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || urlObj.host
  const proto = request.headers.get("x-forwarded-proto") || urlObj.protocol.replace(":", "") || "http"
  
  const currentOrigin = `${proto}://${host}`
  const nextauth_url = process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : currentOrigin)
  const redirect_uri = `${nextauth_url}/api/auth/google/callback`

  if (!client_id) {
    console.error("GOOGLE_CLIENT_ID missing in environment variables.")
    return NextResponse.redirect(`${nextauth_url}/${from}?error=${encodeURIComponent("Configuration OAuth Google non configurée sur le serveur (GOOGLE_CLIENT_ID manquant dans les variables d'environnement Vercel).")}`)
  }

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${client_id}&redirect_uri=${encodeURIComponent(
    redirect_uri
  )}&response_type=code&scope=openid%20email%20profile&state=${from}`

  return NextResponse.redirect(googleAuthUrl)
}

