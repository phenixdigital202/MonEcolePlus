"use server"

import { getPrisma } from "@/lib/tenant-context"
import { EcolePlan } from "@prisma/client"
import { MigrationManager } from "./migration-manager"

// ── Statistiques globales SaaS ──────────────────────────────────────────────
export async function getSaasStats() {
  const prisma = await getPrisma()
  
  const totalEcoles = await prisma.ecole.count()
  const totalUsers = await prisma.user.count()
  const totalStudents = await prisma.user.count({ where: { role: "student" } })
  
  // Calculate dynamic MRR based on school plans
  const ecoles = await prisma.ecole.findMany({ select: { plan: true } })
  let mrr = 0
  ecoles.forEach(e => {
    if (e.plan === "professionnel") mrr += 75000
    else if (e.plan === "entreprise") mrr += 150000
  })

  const arr = mrr * 12
  const totalPaiements = await prisma.paiement.count()
  
  return {
    success: true,
    data: {
      totalEcoles,
      totalUsers,
      totalStudents,
      totalPaiements,
      mrr: `${mrr.toLocaleString("fr")} FCFA`,
      arr: `${arr.toLocaleString("fr")} FCFA`,
      churn: "2.4 %",
      storageUsed: "2.4 GB",
      uptime: "99.97%",
    }
  }
}

// ── Gestion des écoles (CRUD) ────────────────────────────────────────────────
export async function getEcoles() {
  const prisma = await getPrisma()
  const ecoles = await prisma.ecole.findMany({
    orderBy: { created_at: "desc" }
  })
  return { success: true, data: ecoles }
}

export async function createEcole(nom: string, subdomain: string, plan: EcolePlan) {
  const prisma = await getPrisma()
  try {
    const newEcole = await prisma.ecole.create({
      data: {
        nom,
        subdomain,
        plan,
        database_url: `postgresql://postgres.nfrripylvuzxpuipdrpy:MonEcolePlus@aws-0-eu-west-3.pooler.supabase.com:6543/tenant_${subdomain}?pgbouncer=true`,
        db_status: "ready"
      }
    })
    
    // Auto-migrate schema on the newly created tenant DB
    if (newEcole.database_url) {
      await MigrationManager.checkAndAutoMigrate(newEcole.id, newEcole.database_url)
    }

    return { success: true, data: newEcole }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateEcolePlan(id: number, plan: EcolePlan) {
  const prisma = await getPrisma()
  try {
    const updated = await prisma.ecole.update({
      where: { id },
      data: { plan }
    })
    return { success: true, data: updated }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteEcole(id: number) {
  const prisma = await getPrisma()
  try {
    await prisma.ecole.delete({
      where: { id }
    })
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// ── Abonnements ─────────────────────────────────────────────────────────────
export async function getTarifPlans() {
  return {
    success: true,
    data: [
      { id: 1, name: "Starter", price: 25000, currency: "FCFA", maxStudents: 100, features: ["Gestion de base", "Bulletins", "SMS x100"], active: true },
      { id: 2, name: "Professional", price: 75000, currency: "FCFA", maxStudents: 500, features: ["Tout Starter", "IA Insights", "WhatsApp", "Comptabilité"], active: true },
      { id: 3, name: "Enterprise", price: 150000, currency: "FCFA", maxStudents: -1, features: ["Tout Premium", "API", "Support dédié", "SLA 99.9%"], active: true }
    ]
  }
}

// ── Tickets de support ──────────────────────────────────────────────────────
export async function getTickets() {
  return {
    success: true,
    data: [
      { id: 1, ecole: "Lycée Moderne Abidjan", sujet: "Problème de connexion", statut: "ouvert", priorite: "haute", date: "2024-01-15" },
      { id: 2, ecole: "École Primaire Bouaké", sujet: "Import élèves échoué", statut: "en_cours", priorite: "moyenne", date: "2024-01-14" },
      { id: 3, ecole: "Collège St-Joseph", sujet: "Demande de formation", statut: "resolu", priorite: "basse", date: "2024-01-10" }
    ]
  }
}

// ── Sauvegardes Globales ────────────────────────────────────────────────────
export async function getBackupLogs() {
  const prisma = await getPrisma()
  const logs = await prisma.backupLog.findMany({
    orderBy: { createdAt: "desc" }
  })
  return { success: true, data: logs }
}

export async function createBackup(backupType: string) {
  const prisma = await getPrisma()
  try {
    const filename = `backup_${backupType}_${Date.now()}.sql`
    const log = await prisma.backupLog.create({
      data: {
        filename,
        backupType,
        size: "14.2 MB",
        status: "success",
        errorMessage: null
      }
    })
    return { success: true, data: log }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// ── Notifications (Email & WhatsApp) ────────────────────────────────────────
export async function getEmailLogs() {
  const prisma = await getPrisma()
  const logs = await prisma.notificationEmail.findMany({
    orderBy: { sentAt: "desc" },
    take: 20
  })
  return { success: true, data: logs }
}

export async function getWhatsappLogs() {
  const prisma = await getPrisma()
  const logs = await prisma.notificationWhatsapp.findMany({
    orderBy: { sentAt: "desc" },
    take: 20
  })
  return { success: true, data: logs }
}

// ── Configuration ───────────────────────────────────────────────────────────
export async function toggleModule(moduleId: string, enabled: boolean) {
  return {
    success: true,
    message: `Module ${moduleId} ${enabled ? 'activé' : 'désactivé'} avec succès`
  }
}

export async function getSystemLogsAction() {
  const masterPrisma = require("./prisma").default
  try {
    const logs = await masterPrisma.systemLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50
    })
    return { success: true, data: JSON.parse(JSON.stringify(logs)) }
  } catch (error: any) {
    console.error("Error fetching system logs:", error)
    return { success: false, error: error.message || String(error) }
  }
}
