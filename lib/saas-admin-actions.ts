"use server"

import { getPrisma } from "@/lib/tenant-context"

// ── Statistiques globales SaaS ──────────────────────────────────────────────
export async function getSaasStats() {
  const prisma = await getPrisma()
  
  const totalEcoles = 1 // Single-tenant for now, scalable later
  const totalUsers = await prisma.user.count()
  const totalStudents = await prisma.user.count({ where: { role: "student" } })
  const totalTeachers = await prisma.user.count({ where: { role: "teacher" } })
  const totalParents = await prisma.user.count({ where: { role: "parent" } })
  const totalAdmins = await prisma.user.count({ where: { role: "admin" } })
  const totalClasses = await prisma.class.count()
  const totalPaiements = await prisma.paiement.count()
  
  return {
    success: true,
    data: {
      totalEcoles,
      totalUsers,
      totalStudents,
      totalTeachers,
      totalParents,
      totalAdmins,
      totalClasses,
      totalPaiements,
      activeSubscriptions: 1,
      storageUsed: "2.4 GB",
      uptime: "99.97%",
    }
  }
}

// ── Gestion des plans tarifaires ────────────────────────────────────────────
export async function getTarifPlans() {
  return {
    success: true,
    data: [
      {
        id: 1,
        name: "Starter",
        price: 25000,
        currency: "FCFA",
        period: "mois",
        maxStudents: 100,
        maxTeachers: 10,
        features: ["Gestion de base", "Bulletins", "SMS x100"],
        active: true,
      },
      {
        id: 2,
        name: "Premium",
        price: 75000,
        currency: "FCFA",
        period: "mois",
        maxStudents: 500,
        maxTeachers: 50,
        features: ["Tout Starter", "IA Insights", "WhatsApp", "Import/Export", "Comptabilité"],
        active: true,
      },
      {
        id: 3,
        name: "Enterprise",
        price: 150000,
        currency: "FCFA",
        period: "mois",
        maxStudents: -1,
        maxTeachers: -1,
        features: ["Tout Premium", "Multi-campus", "API", "Support dédié", "SLA 99.9%"],
        active: true,
      },
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
      { id: 3, ecole: "Collège St-Joseph", sujet: "Demande de formation", statut: "resolu", priorite: "basse", date: "2024-01-10" },
    ]
  }
}

// ── Activer/Désactiver modules ──────────────────────────────────────────────
export async function toggleModule(moduleId: string, enabled: boolean) {
  // In production, this would update the school's module config in the DB
  return {
    success: true,
    message: `Module ${moduleId} ${enabled ? 'activé' : 'désactivé'} avec succès`
  }
}
