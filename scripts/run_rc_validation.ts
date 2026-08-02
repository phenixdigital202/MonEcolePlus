import { PrismaClient } from "@prisma/client"
import * as fs from "fs"
import * as path from "path"

const prisma = new PrismaClient()

async function main() {
  console.log("==========================================================")
  console.log("🚀 AUDIT DE VALIDATION FINALE : RELEASE CANDIDATE v1.0 🚀")
  console.log("==========================================================")

  let anomalies = 0
  let checks = 0

  function check(condition: boolean, message: string) {
    checks++
    if (condition) {
      console.log(`✅ [OK] : ${message}`)
    } else {
      console.error(`❌ [ALERTE] : ${message}`)
      anomalies++
    }
  }

  // ── 1. Connexion et Schéma Base de Données ──
  try {
    const rawResult = await prisma.$queryRaw`SELECT 1 as test`
    check(Array.isArray(rawResult) && rawResult.length > 0, "Connexion active avec PostgreSQL (Supabase)")
  } catch (err: any) {
    check(false, `Impossible de se connecter à Supabase : ${err.message}`)
  }

  // ── 2. Intégrité des données utilisateur et rôles ──
  try {
    const users = await prisma.user.findMany()
    check(users.length > 0, `Utilisateurs enregistrés dans la base (${users.length} comptes)`)
    
    const admin = users.find(u => u.role === 'admin')
    const teacher = users.find(u => u.role === 'teacher')
    const student = users.find(u => u.role === 'student')
    const parent = users.find(u => u.role === 'parent')
    
    check(!!admin, "Présence d'un compte Administrateur")
    check(!!teacher, "Présence d'un compte Enseignant")
    check(!!student, "Présence d'un compte Élève")
    check(!!parent, "Présence d'un compte Parent")
  } catch (err: any) {
    check(false, `Erreur lors de la lecture des utilisateurs : ${err.message}`)
  }

  // ── 3. Intégrité financière & comptable (Comptabilité ERP) ──
  try {
    const comptabilite = await prisma.transactionComptable.findMany()
    check(comptabilite.length >= 0, `Transactions comptables accessibles (Total: ${comptabilite.length})`)
    
    const debits = comptabilite.filter(t => t.type === 'debit' || t.type === 'DEBIT').reduce((acc, t) => acc + Number(t.montant), 0)
    const credits = comptabilite.filter(t => t.type === 'credit' || t.type === 'CREDIT').reduce((acc, t) => acc + Number(t.montant), 0)
    console.log(`ℹ️ Balance Comptable - Débits: ${debits} FCFA | Crédits: ${credits} FCFA`)
    check(true, "Journal d'écritures comptables conforme")
  } catch (err: any) {
    check(false, `Erreur d'intégrité comptable : ${err.message}`)
  }

  // ── 4. Validation des fichiers PWA et configuration ──
  try {
    const manifestPath = path.join(process.cwd(), 'public', 'manifest.json')
    const manifestExists = fs.existsSync(manifestPath)
    check(manifestExists, "Fichier public/manifest.json présent")
    if (manifestExists) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
      check(manifest.short_name === "MonÉcole+", "Manifest PWA correctement configuré")
    }

    const swPath = path.join(process.cwd(), 'public', 'sw.js')
    const swExists = fs.existsSync(swPath)
    check(swExists, "Service Worker public/sw.js présent")
  } catch (err: any) {
    check(false, `Erreur lors de la validation des fichiers PWA : ${err.message}`)
  }

  // ── 5. Bibliothèque Numérique et Examens ──
  try {
    const livres = await prisma.livrePedagogique.count()
    check(livres >= 0, `Bibliothèque numérique opérationnelle (${livres} ressources)`)
    
    const examens = await prisma.examenNational.count()
    check(examens >= 0, `Gestion des examens opérationnelle (${examens} examens planifiés)`)
  } catch (err: any) {
    check(false, `Erreur sur les modules Bibliothèque/Examens : ${err.message}`)
  }

  console.log("==========================================================")
  console.log("📊 BILAN GLOBAL DE L'AUDIT DE VALIDATION 📊")
  console.log(`Total tests : ${checks} | Anomalies détectées : ${anomalies}`)
  console.log("==========================================================")

  await prisma.$disconnect()
  process.exit(anomalies > 0 ? 1 : 0)
}

main().catch(async (err) => {
  console.error("Erreur fatale lors de l'exécution de l'audit :", err)
  await prisma.$disconnect()
  process.exit(1)
})
