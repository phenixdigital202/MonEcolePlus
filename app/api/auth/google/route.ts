import { NextResponse } from "next/server"

export async function GET() {
  const client_id = process.env.GOOGLE_CLIENT_ID
  const nextauth_url = process.env.NEXTAUTH_URL || "http://localhost:3000"
  const redirect_uri = `${nextauth_url}/api/auth/google/callback`

  if (!client_id) {
    console.error("GOOGLE_CLIENT_ID missing in env.")
    return NextResponse.json({ error: "Configuration OAuth manquante sur le serveur." }, { status: 500 })
  }

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${client_id}&redirect_uri=${encodeURIComponent(
    redirect_uri
  )}&response_type=code&scope=openid%20email%20profile`

  return NextResponse.redirect(googleAuthUrl)
}
