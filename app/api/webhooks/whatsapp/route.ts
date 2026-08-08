import { NextRequest, NextResponse } from "next/server"
import { getPrisma } from "@/lib/tenant-context"

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "MonEcolePlusVerifyToken123"

/**
 * GET - Meta Webhook Verification
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("[WhatsApp Webhook] Verification successful!")
      return new NextResponse(challenge, { status: 200 })
    } else {
      console.warn("[WhatsApp Webhook] Verification failed. Token mismatch.")
      return new NextResponse("Forbidden", { status: 403 })
    }
  }

  return new NextResponse("Bad Request", { status: 400 })
}

/**
 * POST - Meta Event Updates (status changes & messages)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log("[WhatsApp Webhook] Event received:", JSON.stringify(body))

    const entry = body.entry?.[0]
    const changes = entry?.changes?.[0]
    const value = changes?.value

    if (!value) {
      return NextResponse.json({ success: true, message: "No data payload" })
    }

    const prisma = await getPrisma()

    // 1. Process Status Updates (sent, delivered, read, failed)
    if (value.statuses && value.statuses.length > 0) {
      for (const statusUpdate of value.statuses) {
        const metaMessageId = statusUpdate.id
        const metaStatus = statusUpdate.status // "delivered" | "read" | "failed" | "sent"
        
        console.log(`[WhatsApp Webhook] Status update for ${metaMessageId} -> ${metaStatus}`)

        // Update database notification status
        const notification = await prisma.notificationWhatsapp.findFirst({
          where: { metaMessageId }
        })

        if (notification) {
          let dbStatus = "sent"
          if (metaStatus === "delivered") dbStatus = "delivered"
          else if (metaStatus === "read") dbStatus = "read"
          else if (metaStatus === "failed") dbStatus = "failed"

          await prisma.notificationWhatsapp.update({
            where: { id: notification.id },
            data: {
              status: dbStatus,
              errorMessage: metaStatus === "failed" ? (statusUpdate.errors?.[0]?.message || "Failed status update from Meta") : null
            }
          })
          console.log(`[WhatsApp Webhook] DB updated successfully for notification #${notification.id}`)
        } else {
          console.log(`[WhatsApp Webhook] No matching notification found for Meta ID: ${metaMessageId}`)
        }
      }
    }

    // 2. Process incoming messages (if user responds)
    if (value.messages && value.messages.length > 0) {
      for (const message of value.messages) {
        const from = message.from // User's phone number
        const textBody = message.text?.body // Message body
        console.log(`[WhatsApp Webhook] Incoming message from ${from}: "${textBody}"`)
        
        // Log in system logs or save to database messages if needed
        const { logSystem } = require("@/lib/logger")
        await logSystem("info", "whatsapp_incoming", `From: ${from}, Content: ${textBody}`)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[WhatsApp Webhook Error]:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
