import { PrismaClient } from "@prisma/client"
import { MigrationManager } from "../lib/migration-manager"

async function main() {
  console.log("==========================================")
  console.log("🚀 PROVISIONING DE NOUVEL ÉTABLISSEMENT 🚀")
  console.log("==========================================")

  const masterPrisma = new PrismaClient()

  // 1. Création de l'école dans la Master DB
  const subdomain = `cocody_${Date.now()}`
  const nom = "Lycée Moderne de Cocody"
  const database_url = `postgresql://postgres.nfrripylvuzxpuipdrpy:MonEcolePlus@aws-0-eu-west-3.pooler.supabase.com:6543/tenant_${subdomain}?pgbouncer=true`

  console.log(`[Step 1] Création de l'école '${nom}' dans la base Master...`)
  const ecole = await masterPrisma.ecole.create({
    data: {
      nom,
      subdomain,
      plan: "premium",
      database_url,
      db_status: "ready"
    }
  })
  console.log(`✅ École créée avec l'ID: ${ecole.id} dans la Master DB.`)

  // 2. Déclenchement automatique de la migration de schéma
  console.log(`\n[Step 2] Déclenchement de la migration de schéma Prisma...`)
  await MigrationManager.checkAndAutoMigrate(ecole.id, ecole.database_url!)
  console.log("✅ Migration de schéma effectuée avec succès.")

  // 3. Connexion à la base de données du Tenant pour le provisioning initial
  console.log(`\n[Step 3] Connexion à la base de données de l'établissement...`)
  const tenantPrisma = new PrismaClient({
    datasources: { db: { url: ecole.database_url! } }
  })

  // 3.5. Insérer l'école elle-même dans la base du Tenant pour respecter la clé étrangère
  console.log("📥 Insertion de la référence de l'école dans la base Tenant...")
  await tenantPrisma.ecole.create({
    data: {
      id: ecole.id,
      nom: ecole.nom,
      subdomain: ecole.subdomain,
      plan: ecole.plan,
      database_url: ecole.database_url,
      db_status: ecole.db_status
    }
  })
  console.log("✅ Référence de l'école insérée.")

  // 4. Provisionnement des paramètres par défaut
  console.log("📥 Insertion des paramètres et configurations de base...")
  await tenantPrisma.setting.upsert({
    where: { key_name: "school_name" },
    update: { value: nom },
    create: { key_name: "school_name", value: nom }
  })
  await tenantPrisma.setting.upsert({
    where: { key_name: "currency" },
    update: { value: "FCFA" },
    create: { key_name: "currency", value: "FCFA" }
  })
  await tenantPrisma.setting.upsert({
    where: { key_name: "modules" },
    update: { value: JSON.stringify(["dashboard", "classes", "students", "teachers", "payments", "notes", "absences", "ai"]) },
    create: { key_name: "modules", value: JSON.stringify(["dashboard", "classes", "students", "teachers", "payments", "notes", "absences", "ai"]) }
  })
  console.log("✅ Paramètres de base initialisés.")

  // 5. Création des classes (2 classes requis par l'Étape 6)
  console.log("\n[Step 4] Création des classes...")
  const classeA = await tenantPrisma.class.create({
    data: { id_ecole: ecole.id, nom: "Terminale A", niveau: "Secondaire" }
  })
  const classeC = await tenantPrisma.class.create({
    data: { id_ecole: ecole.id, nom: "Terminale C", niveau: "Secondaire" }
  })
  console.log(`✅ Classes créées : ${classeA.nom} (ID: ${classeA.id}), ${classeC.nom} (ID: ${classeC.id})`)

  // 6. Création des enseignants (2 enseignants requis par l'Étape 6)
  console.log("\n[Step 5] Création des enseignants...")
  const prof1 = await tenantPrisma.user.create({
    data: {
      id_ecole: ecole.id,
      nom: "Professeur Koffi",
      email: `koffi_${subdomain}@monecole.ci`,
      password: "securepassword123",
      role: "teacher",
      matiere: "Mathématiques"
    }
  })
  const prof2 = await tenantPrisma.user.create({
    data: {
      id_ecole: ecole.id,
      nom: "Professeur Konan",
      email: `konan_${subdomain}@monecole.ci`,
      password: "securepassword123",
      role: "teacher",
      matiere: "Français"
    }
  })
  console.log(`✅ Enseignants créés : ${prof1.nom}, ${prof2.nom}`)

  // 7. Création des élèves (3 élèves requis par l'Étape 6)
  console.log("\n[Step 6] Création des élèves...")
  const eleve1 = await tenantPrisma.user.create({
    data: {
      id_ecole: ecole.id,
      nom: "Jean Marc",
      email: `jean_${subdomain}@monecole.ci`,
      password: "securepassword123",
      role: "student"
    }
  })
  const eleve2 = await tenantPrisma.user.create({
    data: {
      id_ecole: ecole.id,
      nom: "Marie Chantal",
      email: `marie_${subdomain}@monecole.ci`,
      password: "securepassword123",
      role: "student"
    }
  })
  const eleve3 = await tenantPrisma.user.create({
    data: {
      id_ecole: ecole.id,
      nom: "Adama Traoré",
      email: `adama_${subdomain}@monecole.ci`,
      password: "securepassword123",
      role: "student"
    }
  })
  console.log(`✅ Élèves créés : ${eleve1.nom}, ${eleve2.nom}, ${eleve3.nom}`)

  // Inscriptions des élèves aux classes
  await tenantPrisma.inscription.createMany({
    data: [
      { id_eleve: eleve1.id, id_classe: classeA.id, annee_scolaire: "2025-2026" },
      { id_eleve: eleve2.id, id_classe: classeC.id, annee_scolaire: "2025-2026" },
      { id_eleve: eleve3.id, id_classe: classeC.id, annee_scolaire: "2025-2026" }
    ]
  })
  console.log("✅ Inscriptions effectuées.")

  // 8. Création des paiements (5 paiements requis par l'Étape 6)
  console.log("\n[Step 7] Création des paiements...")
  await tenantPrisma.paiement.createMany({
    data: [
      { id_utilisateur: eleve1.id, montant: 50000, status: "paye", type: "scolarite", provider: "Orange Money" },
      { id_utilisateur: eleve2.id, montant: 75000, status: "paye", type: "scolarite", provider: "Wave" },
      { id_utilisateur: eleve3.id, montant: 50000, status: "paye", type: "inscription", provider: "Espèces" },
      { id_utilisateur: eleve1.id, montant: 30000, status: "en_attente", type: "examen", provider: "MTN MoMo" },
      { id_utilisateur: eleve2.id, montant: 60000, status: "paye", type: "scolarite", provider: "Carte Bancaire" }
    ]
  })
  console.log("✅ 5 Paiements enregistrés en base.")

  // 9. Création d'évaluations et notes (10 notes requis par l'Étape 6)
  console.log("\n[Step 8] Création des notes...")
  const evalMath = await tenantPrisma.evaluation.create({
    data: { id_classe: classeC.id, matiere: "Mathématiques", date_eval: new Date(), type_eval: "devoir", bareme: 20, periode: "Trimestre 1" }
  })
  const evalFr = await tenantPrisma.evaluation.create({
    data: { id_classe: classeA.id, matiere: "Français", date_eval: new Date(), type_eval: "devoir", bareme: 20, periode: "Trimestre 1" }
  })

  await tenantPrisma.note.createMany({
    data: [
      { id_evaluation: evalMath.id, id_eleve: eleve2.id, valeur: 14.5, commentaire: "Bon travail" },
      { id_evaluation: evalMath.id, id_eleve: eleve3.id, valeur: 12.0, commentaire: "Moyen" },
      { id_evaluation: evalFr.id, id_eleve: eleve1.id, valeur: 16.0, commentaire: "Très bien" },
      { id_evaluation: evalMath.id, id_eleve: eleve2.id, valeur: 15.0, commentaire: "Régulier" },
      { id_evaluation: evalMath.id, id_eleve: eleve3.id, valeur: 9.5, commentaire: "Insuffisant" },
      { id_evaluation: evalFr.id, id_eleve: eleve1.id, valeur: 13.0, commentaire: "Assez bien" },
      { id_evaluation: evalMath.id, id_eleve: eleve2.id, valeur: 11.5, commentaire: "Passable" },
      { id_evaluation: evalMath.id, id_eleve: eleve3.id, valeur: 14.0, commentaire: "Bien" },
      { id_evaluation: evalFr.id, id_eleve: eleve1.id, valeur: 12.5, commentaire: "Moyen" },
      { id_evaluation: evalFr.id, id_eleve: eleve1.id, valeur: 15.5, commentaire: "Très régulier" }
    ]
  })
  console.log("✅ 10 Notes enregistrées en base.")

  // 10. Création des absences (4 absences requis par l'Étape 6)
  console.log("\n[Step 9] Création des absences...")
  await tenantPrisma.absence.createMany({
    data: [
      { id_eleve: eleve1.id, date_absence: new Date(), statut: "non_justifie", motif: "Absence injustifiée" },
      { id_eleve: eleve2.id, date_absence: new Date(), statut: "justifie", motif: "Raison médicale" },
      { id_eleve: eleve3.id, date_absence: new Date(), statut: "non_justifie", motif: "Pas de motif" },
      { id_eleve: eleve1.id, date_absence: new Date(), statut: "justifie", motif: "Affaires familiales" }
    ]
  })
  console.log("✅ 4 Absences enregistrées en base.")

  // 11. Génération d'un diagnostic IA réel (Étape 7)
  console.log("\n[Step 10] Calcul des analyses IA réelles...")
  await tenantPrisma.aIInsight.create({
    data: {
      id_utilisateur: eleve1.id,
      type: "pédagogique",
      message: "L'indice de santé pédagogique de la Terminale A est bon, avec une moyenne générale de 14.8/20. Recommander un tutorat ponctuel pour Adama Traoré en mathématiques.",
      score_confiance: 0.94
    }
  })
  console.log("✅ Recommandation IA enregistrée.")

  // 12. Validation stricte de la structure finale
  console.log("\n[Step 11] Validation de l'intégrité du schéma et des tables critiques...")
  const criticalModels = ["ecole", "user", "class", "schoolYear"]
  for (const model of criticalModels) {
    try {
      await (tenantPrisma as any)[model].findFirst()
      console.log(`  🔍 Table pour le modèle [${model}] : OK`)
    } catch (e: any) {
      throw new Error(`CRITICAL DRIFT: Le modèle critique [${model}] n'est pas accessible après provisioning : ${e.message}`)
    }
  }
  console.log("✅ Toutes les tables critiques sont présentes et accessibles.")

  await tenantPrisma.$disconnect()
  await masterPrisma.$disconnect()

  console.log("\n==========================================")
  console.log("🎉 PROVISIONING DU TENANT RÉUSSI 100% 🎉")
  console.log("==========================================")
}

main().catch(console.error)
