"use server"

import masterPrisma from "@/lib/prisma"
import { getCurrentTenant } from "@/lib/tenant-context"
import { revalidatePath } from "next/cache"

export async function updateAlertSettings(settings: { smsEnabled: boolean, emailEnabled: boolean }) {
  try {
    const school = await getCurrentTenant()
    
    if (!school) {
      return { error: "Établissement non trouvé" }
    }

    await masterPrisma.ecoles.update({
      where: { id: school.id },
      data: {
        sms_alerts_enabled: settings.smsEnabled,
        email_alerts_enabled: settings.emailEnabled,
      }
    })

    revalidatePath("/dashboard/absences/alerts")
    return { success: true }
  } catch (error) {
    console.error("Failed to update alert settings:", error)
    return { error: "Erreur lors de la mise à jour des paramètres" }
  }
}

export async function getAlertTemplates() {
  const { getPrisma } = await import("@/lib/tenant-context")
  const prisma = await getPrisma()
  
  const settings = await prisma.settings.findMany({
    where: {
      key_name: {
        in: ["absences_sms_template", "absences_email_template"]
      }
    }
  })

  const smsTemplate = settings.find(s => s.key_name === "absences_sms_template")?.value || "Cher parent, votre enfant {nom} est absent ce jour. Merci de justifier."
  const emailTemplate = settings.find(s => s.key_name === "absences_email_template")?.value || "Bonjour,\n\nNous vous informons que votre enfant {nom} a été marqué absent ce jour.\n\nCordialement,\nLa Direction"

  return { smsTemplate, emailTemplate }
}

export async function updateAlertTemplates(templates: { smsTemplate: string, emailTemplate: string }) {
  try {
    const { getPrisma } = await import("@/lib/tenant-context")
    const prisma = await getPrisma()

    await prisma.settings.upsert({
      where: { key_name: "absences_sms_template" },
      update: { value: templates.smsTemplate },
      create: { key_name: "absences_sms_template", value: templates.smsTemplate }
    })

    await prisma.settings.upsert({
      where: { key_name: "absences_email_template" },
      update: { value: templates.emailTemplate },
      create: { key_name: "absences_email_template", value: templates.emailTemplate }
    })

    return { success: true }
  } catch (error) {
    console.error("Failed to update templates:", error)
    return { error: "Erreur lors de la mise à jour des modèles" }
  }
}
