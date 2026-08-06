import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import fs from "fs"
import path from "path"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userRole = cookieStore.get("user_role")?.value
    
    if (userRole !== "admin" && userRole !== "super_admin") {
      return new NextResponse("Accès interdit", { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const filename = searchParams.get("filename")

    if (!filename) {
      return new NextResponse("Nom de fichier manquant", { status: 400 })
    }

    // Security check: prevent directory traversal attacks
    const safeFilename = path.basename(filename)
    if (safeFilename !== filename) {
      return new NextResponse("Nom de fichier invalide", { status: 400 })
    }

    const backupDir = path.join(process.cwd(), "backups")
    const filePath = path.join(backupDir, safeFilename)

    if (!fs.existsSync(filePath)) {
      return new NextResponse("Fichier introuvable", { status: 404 })
    }

    const fileBuffer = fs.readFileSync(filePath)

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/gzip",
        "Content-Disposition": `attachment; filename="${safeFilename}"`,
        "Content-Length": fileBuffer.length.toString()
      }
    })
  } catch (error: any) {
    console.error("[Download API Error]:", error)
    return new NextResponse("Erreur serveur", { status: 500 })
  }
}
