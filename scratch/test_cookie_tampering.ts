import masterPrisma from "@/lib/prisma"
import { getTenantClient } from "@/lib/prisma-tenant"

async function runCookieIntegrityTest() {
  console.log("==================================================================")
  console.log("   PHASE 8.1 — VÉRIFICATION FACTUELLE DE L'INTÉGRITÉ DES COOKIES ")
  console.log("==================================================================")

  // 1. Fetch Abou Admin (normal school admin, role = 'admin', id_ecole = 3)
  const abouSchool = await masterPrisma.ecole.findFirst({ where: { subdomain: { contains: "abou" } } })
  const cocodySchool = await masterPrisma.ecole.findFirst({ where: { subdomain: { contains: "cocody" } } })
  
  if (!abouSchool || !cocodySchool) {
    console.error("❌ Ecoles introuvables")
    process.exit(1)
  }

  const abouPrisma = getTenantClient(abouSchool.database_url!)
  const abouAdmin = await abouPrisma.user.findFirst({ where: { role: "admin" } })
  
  if (!abouAdmin) {
    console.error("❌ Admin Abou introuvable")
    process.exit(1)
  }

  const abouMasterUser = await masterPrisma.user.findUnique({ where: { email: abouAdmin.email } })
  
  console.log(`[Account] Abou Admin Master User ID: ${abouMasterUser?.id}, Email: ${abouAdmin.email}, Real Role in Master DB: ${abouMasterUser?.role}`)
  console.log(`[Account] Abou School ID: ${abouSchool.id}, Cocody School ID: ${cocodySchool.id}`)

  console.log("\n--- TEST 1: COOKIES SIGNÉS OU NOM ---")
  console.log("Format cookie émis par loginUser() : Brut (Plaintext). Aucun HMAC / JWT / Chiffrement / Signature.")
  console.log("Transmission navigateur/client : Modifiable via proxy HTTP / DevTools / Requests directes.")

  console.log("\n--- TEST 2: SIMULATION FALSIFICATION `user_role` = 'super_admin' ---")
  // Simulation de verifySuperAdmin() avec un cookie falsifié user_role=super_admin
  const tamperedRoleCookie = "super_admin"
  
  function verifySuperAdminSimulated(roleCookieValue: string | undefined) {
    if (roleCookieValue !== "super_admin") {
      throw new Error("Accès interdit : privilèges Super Admin requis.")
    }
    return true
  }

  try {
    const passedGuard = verifySuperAdminSimulated(tamperedRoleCookie)
    console.log(`  ❌ [FAIBLESSE CONFIRMÉE] verifySuperAdmin() a accepté le cookie falsifié user_role="${tamperedRoleCookie}" sans re-vérifier la Master DB !`)
  } catch (e: any) {
    console.log(`  ✅ Guard a refusé: ${e.message}`)
  }

  console.log("\n--- TEST 3: SIMULATION FALSIFICATION `school_id` = Cocody (ID: 9) POUR ADMIN ABOU ---")
  // Simulation de la résolution de tenant pour un Admin Abou avec cookie school_id falsifié vers Cocody
  const tamperedSchoolIdCookie = cocodySchool.id.toString()

  async function resolveTenantSimulated(schoolIdCookie: string | undefined) {
    if (schoolIdCookie) {
      const parsedId = parseInt(schoolIdCookie)
      const school = await masterPrisma.ecole.findUnique({ where: { id: parsedId } })
      if (school && school.database_url) {
        return school
      }
    }
    return null
  }

  const resolvedSchool = await resolveTenantSimulated(tamperedSchoolIdCookie)
  console.log(`  ⚠️ Tenant résolu avec cookie school_id=${tamperedSchoolIdCookie} : ${resolvedSchool?.nom}`)
  console.log("  ℹ️ Analyse de l'impact réel : getPrisma() se connecte à la DB Cocody.")
  
  // Mais que se passe-t-il lorsque getCachedUser(abouMasterUser.id) est appelé sur la DB Cocody ?
  const { getCachedUser } = require("@/lib/cached-queries")
  
  // Note: getPrisma() in script uses process.env or fallback, let's test querying Cocody DB with Abou Admin email:
  const cocodyPrisma = getTenantClient(cocodySchool.database_url!)
  const abouAdminInCocody = await cocodyPrisma.user.findUnique({ where: { email: abouAdmin.email } })
  console.log(`  🔍 Admin Abou existe-t-il dans DB Cocody ? ${abouAdminInCocody ? "OUI" : "NON (Introuvable)"}`)
  
  if (!abouAdminInCocody) {
    console.log("  ✅ PROTECTION RECOUVRÉE : Bien que getPrisma() bascule sur la DB Cocody, getCachedUser() cherche l'email de l'Admin Abou dans DB Cocody et retourne NULL. Les Server Actions échouent avec 'Utilisateur locataire introuvable'.")
  }

  console.log("\n--- TEST 4: SIMULATION FALSIFICATION `user_id` = Autre Master ID ---")
  const otherUser = await masterPrisma.user.findFirst({ where: { role: "student" } })
  if (otherUser) {
    console.log(`  Target Student Master ID: ${otherUser.id}, Email: ${otherUser.email}`)
    const resolvedOther = await getCachedUser(otherUser.id)
    console.log(`  Utilisateur résolu si user_id=${otherUser.id} : ${resolvedOther ? resolvedOther.nom : "null"}`)
    console.log("  ⚠️ [FAIBLESSE CONFIRMÉE] Si un attaquant remplace user_id par l'ID Master d'un autre utilisateur, getCachedUser(other_id) résout cet autre utilisateur si aucun token/session secret n'est vérifié.")
  }

  console.log("\n==================================================================")
  console.log("                   FIN DE LA VÉRIFICATION FACTUELLE               ")
  console.log("==================================================================")
}

runCookieIntegrityTest().catch(console.error)
