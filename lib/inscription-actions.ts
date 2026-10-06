"use server"

import { getPrisma } from "@/lib/tenant-context"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

export interface InscriptionFormData {
  type_inscription: "Inscription" | "Réinscription"
  matricule?: string
  nom: string
  email?: string
  date_naissance?: string
  lieu_naissance?: string
  nationalite?: string
  sexe?: "M" | "F"
  etablissement_origine?: string
  statut_affectation?: "Affecté" | "Non Affecté" | "Aucun"
  statut_redoublement?: "Redoublant" | "Non Redoublant"
  cantine?: boolean
  transport?: boolean
  lv2?: string
  id_classe: number
  annee_scolaire?: string
  montant_scolarite?: number
  // Représentant Légal / Tuteur
  tuteur_type?: "Père" | "Mère" | "Tuteur"
  tuteur_nom?: string
  tuteur_profession?: string
  tuteur_tel_mobile?: string
  tuteur_tel_bureau?: string
  tuteur_tel_domicile?: string
  tuteur_adresse?: string
  tuteur_email?: string
}

export async function createInscriptionAction(data: InscriptionFormData) {
  try {
    const prisma = await getPrisma()

    if (!data.nom || !data.nom.trim()) {
      return { success: false, error: "Le nom et prénom de l'élève sont requis." }
    }

    if (!data.id_classe) {
      return { success: false, error: "Veuillez sélectionner une classe pour l'élève." }
    }

    // 1. Generate or validate Matricule
    let finalMatricule = data.matricule?.trim()
    if (!finalMatricule) {
      const yearPrefix = new Date().getFullYear()
      const randomSuffix = Math.floor(1000 + Math.random() * 9000)
      const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26))
      finalMatricule = `${yearPrefix}-${randomSuffix}${letter}`
    } else {
      // Check if matricule already exists in tenant DB
      const existingMatricule = await prisma.user.findFirst({
        where: { matricule: finalMatricule }
      })
      if (existingMatricule) {
        return { success: false, error: `Le matricule "${finalMatricule}" est déjà attribué à un autre élève.` }
      }
    }

    // 2. Generate student email if not provided
    const cleanEmail = data.email && data.email.trim()
      ? data.email.trim().toLowerCase()
      : `eleve.${finalMatricule.toLowerCase().replace(/[^a-z0-9]/g, '')}@ecole.ci`

    // Password for student login
    const defaultPassword = await bcrypt.hash("eleve123", 10)

    // Parse date de naissance
    let parsedDateNaissance: Date | null = null
    if (data.date_naissance) {
      const d = new Date(data.date_naissance)
      if (!isNaN(d.getTime())) parsedDateNaissance = d
    }

    // 3. Create or update Student User in Tenant DB
    let studentUser = await prisma.user.findUnique({
      where: { email: cleanEmail }
    })

    if (!studentUser) {
      studentUser = await prisma.user.create({
        data: {
          nom: data.nom.trim(),
          email: cleanEmail,
          password: defaultPassword,
          role: "student",
          matricule: finalMatricule,
          date_naissance: parsedDateNaissance,
          lieu_naissance: data.lieu_naissance?.trim(),
          nationalite: data.nationalite?.trim() || "Ivoirienne",
          sexe: data.sexe || "M",
          etablissement_origine: data.etablissement_origine?.trim(),
          statut_affectation: data.statut_affectation || "Non Affecté",
          statut_redoublement: data.statut_redoublement || "Non Redoublant",
          cantine: data.cantine || false,
          transport: data.transport || false,
          lv2: data.lv2?.trim(),
          tuteur_type: data.tuteur_type || "Père",
          tuteur_nom: data.tuteur_nom?.trim(),
          tuteur_profession: data.tuteur_profession?.trim(),
          tuteur_tel_mobile: data.tuteur_tel_mobile?.trim(),
          tuteur_tel_bureau: data.tuteur_tel_bureau?.trim(),
          tuteur_tel_domicile: data.tuteur_tel_domicile?.trim(),
          tuteur_adresse: data.tuteur_adresse?.trim(),
          tuteur_email: data.tuteur_email?.trim()
        }
      })
    } else {
      // Update existing student info
      studentUser = await prisma.user.update({
        where: { id: studentUser.id },
        data: {
          nom: data.nom.trim(),
          matricule: finalMatricule,
          date_naissance: parsedDateNaissance,
          lieu_naissance: data.lieu_naissance?.trim(),
          nationalite: data.nationalite?.trim() || "Ivoirienne",
          sexe: data.sexe || "M",
          etablissement_origine: data.etablissement_origine?.trim(),
          statut_affectation: data.statut_affectation || "Non Affecté",
          statut_redoublement: data.statut_redoublement || "Non Redoublant",
          cantine: data.cantine || false,
          transport: data.transport || false,
          lv2: data.lv2?.trim(),
          tuteur_type: data.tuteur_type || "Père",
          tuteur_nom: data.tuteur_nom?.trim(),
          tuteur_profession: data.tuteur_profession?.trim(),
          tuteur_tel_mobile: data.tuteur_tel_mobile?.trim(),
          tuteur_tel_bureau: data.tuteur_tel_bureau?.trim(),
          tuteur_tel_domicile: data.tuteur_tel_domicile?.trim(),
          tuteur_adresse: data.tuteur_adresse?.trim(),
          tuteur_email: data.tuteur_email?.trim()
        }
      })
    }

    // 4. Determine Active School Year
    let currentSchoolYear = data.annee_scolaire?.trim()
    if (!currentSchoolYear) {
      const activeYear = await prisma.schoolYear.findFirst({ where: { status: "ACTIVE" } })
      currentSchoolYear = activeYear?.label || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
    }

    // 5. Create Inscription Record
    const newInscription = await prisma.inscription.create({
      data: {
        id_eleve: studentUser.id,
        id_classe: Number(data.id_classe),
        annee_scolaire: currentSchoolYear,
        statut: "active",
        type_inscription: data.type_inscription || "Inscription",
        montant_scolarite: data.montant_scolarite ? Number(data.montant_scolarite) : undefined
      },
      include: {
        user: true,
        classe: true
      }
    })

    // 6. Create or link Parent account if tuteur details provided
    if (data.tuteur_email && data.tuteur_email.trim()) {
      const parentEmail = data.tuteur_email.trim().toLowerCase()
      let parentUser = await prisma.user.findUnique({ where: { email: parentEmail } })
      
      if (!parentUser) {
        const parentPassword = await bcrypt.hash("parent123", 10)
        parentUser = await prisma.user.create({
          data: {
            nom: data.tuteur_nom?.trim() || "Parent d'élève",
            email: parentEmail,
            password: parentPassword,
            role: "parent"
          }
        })
      }

      // Link Parent to Student if not linked
      const existingLink = await prisma.parentEleve.findFirst({
        where: { id_parent: parentUser.id, id_eleve: studentUser.id }
      })
      if (!existingLink) {
        await prisma.parentEleve.create({
          data: { id_parent: parentUser.id, id_eleve: studentUser.id }
        })
      }
    }

    revalidatePath("/dashboard/inscriptions")
    revalidatePath("/dashboard/classes")
    revalidatePath("/dashboard/admin/students")

    return {
      success: true,
      data: JSON.parse(JSON.stringify(newInscription))
    }
  } catch (error: any) {
    console.error("[createInscriptionAction] Error creating inscription:", error)
    return { success: false, error: error.message || "Erreur lors de la création de la fiche d'inscription." }
  }
}

export async function getInscriptionsAction(query?: string) {
  try {
    const prisma = await getPrisma()
    
    let whereClause: any = {}
    if (query && query.trim()) {
      const search = query.trim()
      whereClause = {
        OR: [
          { user: { nom: { contains: search, mode: "insensitive" } } },
          { user: { matricule: { contains: search, mode: "insensitive" } } },
          { user: { email: { contains: search, mode: "insensitive" } } },
          { classe: { nom: { contains: search, mode: "insensitive" } } },
          { annee_scolaire: { contains: search, mode: "insensitive" } }
        ]
      }
    }

    const inscriptions = await prisma.inscription.findMany({
      where: whereClause,
      include: {
        user: true,
        classe: true
      },
      orderBy: { startDate: "desc" }
    })

    return {
      success: true,
      data: JSON.parse(JSON.stringify(inscriptions))
    }
  } catch (error: any) {
    console.error("[getInscriptionsAction] Error:", error)
    return { success: false, error: error.message, data: [] }
  }
}

export async function getInscriptionDetailsAction(id: number) {
  try {
    const prisma = await getPrisma()
    const inscription = await prisma.inscription.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            parcoursScolaires: { orderBy: { id: "asc" } },
            ecole: true
          }
        },
        classe: true
      }
    })

    if (!inscription) {
      return { success: false, error: "Fiche d'inscription introuvable." }
    }

    const school = await prisma.ecole.findFirst()

    return {
      success: true,
      data: JSON.parse(JSON.stringify(inscription)),
      school: school ? JSON.parse(JSON.stringify(school)) : null
    }
  } catch (error: any) {
    console.error("[getInscriptionDetailsAction] Error:", error)
    return { success: false, error: error.message }
  }
}
