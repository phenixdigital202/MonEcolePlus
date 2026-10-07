import { NextResponse } from "next/server"
import { getPrisma } from "@/lib/tenant-context"

export async function GET() {
  try {
    const prisma = await getPrisma()
    const classes = await prisma.class.findMany({
      orderBy: { nom: "asc" },
      select: {
        id: true,
        nom: true,
        niveau: true
      }
    })
    return NextResponse.json({ success: true, data: classes })
  } catch (error: any) {
    console.error("[GET /api/classes] Error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
