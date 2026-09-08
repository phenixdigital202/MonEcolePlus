-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "inscriptions_statut" AS ENUM ('active', 'transferred', 'redoublant', 'exclu', 'terminee');

-- CreateEnum
CREATE TYPE "absences_statut" AS ENUM ('justifie', 'non_justifie', 'en_attente');

-- CreateEnum
CREATE TYPE "annonces_cible" AS ENUM ('tous', 'enseignants', 'parents', 'eleves');

-- CreateEnum
CREATE TYPE "paiements_status" AS ENUM ('paye', 'en_attente', 'annule');

-- CreateEnum
CREATE TYPE "emplois_du_temps_jour" AS ENUM ('Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi');

-- CreateEnum
CREATE TYPE "evaluations_type_eval" AS ENUM ('devoir', 'examen', 'controle');

-- CreateEnum
CREATE TYPE "paiements_type" AS ENUM ('scolarite', 'inscription', 'examen');

-- CreateEnum
CREATE TYPE "ecoles_plan" AS ENUM ('gratuit', 'standard', 'premium');

-- CreateEnum
CREATE TYPE "parcours_scolaires_resultat" AS ENUM ('Admis', 'Redoublant', 'Exclu', 'Transfert');

-- CreateEnum
CREATE TYPE "users_role" AS ENUM ('super_admin', 'admin', 'teacher', 'parent', 'student');

-- CreateTable
CREATE TABLE "abonnements" (
    "id" SERIAL NOT NULL,
    "id_ecole" INTEGER NOT NULL,
    "stripe_subscription_id" TEXT,
    "status" TEXT,
    "current_period_end" TIMESTAMP(3),

    CONSTRAINT "abonnements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "absences" (
    "id" SERIAL NOT NULL,
    "id_eleve" INTEGER NOT NULL,
    "date_absence" TIMESTAMP(3) NOT NULL,
    "statut" "absences_statut" DEFAULT 'non_justifie',
    "motif" TEXT,

    CONSTRAINT "absences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin" (
    "IDadmin" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "mot_de_passe" TEXT NOT NULL,

    CONSTRAINT "admin_pkey" PRIMARY KEY ("IDadmin")
);

-- CreateTable
CREATE TABLE "ai_insights" (
    "id" SERIAL NOT NULL,
    "id_utilisateur" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "score_confiance" DECIMAL(65,30),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_insights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "annonces" (
    "id" SERIAL NOT NULL,
    "titre" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "cible" "annonces_cible" NOT NULL DEFAULT 'tous',
    "id_auteur" INTEGER NOT NULL,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "annonces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "badges" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "icon_name" TEXT DEFAULT 'Award',
    "points_requis" INTEGER DEFAULT 0,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classes" (
    "id" SERIAL NOT NULL,
    "id_ecole" INTEGER,
    "nom" TEXT NOT NULL,
    "niveau" TEXT NOT NULL,
    "capacite" INTEGER NOT NULL DEFAULT 60,
    "id_level" INTEGER,
    "id_annee_scolaire" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ecoles" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "subdomain" TEXT,
    "logo_url" TEXT,
    "stripe_customer_id" TEXT,
    "plan" "ecoles_plan" DEFAULT 'gratuit',
    "database_url" TEXT,
    "db_status" TEXT NOT NULL DEFAULT 'ready',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "smtp_host" TEXT,
    "smtp_port" INTEGER,
    "smtp_user" TEXT,
    "smtp_pass" TEXT,
    "whatsapp_access_token" TEXT,
    "whatsapp_phone_number_id" TEXT,

    CONSTRAINT "ecoles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eleve_badges" (
    "id" SERIAL NOT NULL,
    "id_eleve" INTEGER NOT NULL,
    "id_badge" INTEGER NOT NULL,
    "date_obtention" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eleve_badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eleves" (
    "IDeleves" SERIAL NOT NULL,

    CONSTRAINT "eleves_pkey" PRIMARY KEY ("IDeleves")
);

-- CreateTable
CREATE TABLE "emplois_du_temps" (
    "id" SERIAL NOT NULL,
    "id_classe" INTEGER NOT NULL,
    "id_enseignant" INTEGER NOT NULL,
    "matiere" TEXT NOT NULL,
    "jour" "emplois_du_temps_jour" NOT NULL,
    "heure_debut" TIMESTAMP(3) NOT NULL,
    "heure_fin" TIMESTAMP(3) NOT NULL,
    "salle" TEXT,

    CONSTRAINT "emplois_du_temps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enseignants" (
    "IDenseign" SERIAL NOT NULL,

    CONSTRAINT "enseignants_pkey" PRIMARY KEY ("IDenseign")
);

-- CreateTable
CREATE TABLE "evaluations" (
    "id" SERIAL NOT NULL,
    "id_classe" INTEGER NOT NULL,
    "matiere" TEXT NOT NULL,
    "date_eval" TIMESTAMP(3) NOT NULL,
    "type_eval" "evaluations_type_eval" DEFAULT 'devoir',
    "bareme" INTEGER DEFAULT 20,
    "periode" TEXT,

    CONSTRAINT "evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inscriptions" (
    "id" SERIAL NOT NULL,
    "id_eleve" INTEGER NOT NULL,
    "id_classe" INTEGER NOT NULL,
    "annee_scolaire" TEXT NOT NULL,
    "statut" "inscriptions_statut" NOT NULL DEFAULT 'active',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "reason" TEXT,
    "id_annee_scolaire" INTEGER,

    CONSTRAINT "inscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" SERIAL NOT NULL,
    "id_expediteur" INTEGER NOT NULL,
    "id_destinataire" INTEGER NOT NULL,
    "contenu" TEXT NOT NULL,
    "lu" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notes" (
    "id" SERIAL NOT NULL,
    "id_evaluation" INTEGER NOT NULL,
    "id_eleve" INTEGER NOT NULL,
    "valeur" DECIMAL(65,30) NOT NULL,
    "commentaire" TEXT,

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paiements" (
    "id" SERIAL NOT NULL,
    "id_utilisateur" INTEGER NOT NULL,
    "montant" DECIMAL(65,30) NOT NULL,
    "status" "paiements_status" NOT NULL DEFAULT 'en_attente',
    "type" "paiements_type" NOT NULL,
    "date_paiement" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "provider" TEXT,
    "transactionRef" TEXT,
    "phoneNumber" TEXT,
    "receiptUrl" TEXT,

    CONSTRAINT "paiements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parcours_scolaires" (
    "id" SERIAL NOT NULL,
    "id_eleve" INTEGER NOT NULL,
    "annee_scolaire" TEXT NOT NULL,
    "classe_nom" TEXT NOT NULL,
    "moyenne_generale" DECIMAL(65,30),
    "resultat" "parcours_scolaires_resultat" DEFAULT 'Admis',
    "observations" TEXT,

    CONSTRAINT "parcours_scolaires_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parent_eleve" (
    "id" SERIAL NOT NULL,
    "id_parent" INTEGER NOT NULL,
    "id_eleve" INTEGER NOT NULL,

    CONSTRAINT "parent_eleve_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parents" (
    "IDparents" SERIAL NOT NULL,

    CONSTRAINT "parents_pkey" PRIMARY KEY ("IDparents")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" SERIAL NOT NULL,
    "key_name" TEXT NOT NULL,
    "value" TEXT,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "id_ecole" INTEGER,
    "nom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "users_role" NOT NULL,
    "matiere" TEXT,
    "points" INTEGER NOT NULL DEFAULT 0,
    "niveau" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_subjects" (
    "id" SERIAL NOT NULL,
    "id_enseignant" INTEGER NOT NULL,
    "matiere" TEXT NOT NULL,

    CONSTRAINT "teacher_subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_availabilities" (
    "id" SERIAL NOT NULL,
    "id_enseignant" INTEGER NOT NULL,
    "jour" "emplois_du_temps_jour" NOT NULL,
    "heure_debut" TIMESTAMP(3) NOT NULL,
    "heure_fin" TIMESTAMP(3) NOT NULL,
    "est_disponible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "teacher_availabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_levels" (
    "id" SERIAL NOT NULL,
    "id_ecole" INTEGER,
    "nom" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "school_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "level_subjects" (
    "id" SERIAL NOT NULL,
    "id_level" INTEGER NOT NULL,
    "matiere" TEXT NOT NULL,
    "volume_horaire_hebdo" INTEGER NOT NULL DEFAULT 4,
    "est_obligatoire" BOOLEAN NOT NULL DEFAULT true,
    "salle_specifique" TEXT,

    CONSTRAINT "level_subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedagogical_settings" (
    "id" SERIAL NOT NULL,
    "id_ecole" INTEGER NOT NULL,
    "max_heures_jour_eleve" INTEGER NOT NULL DEFAULT 7,
    "duree_pause_min" INTEGER NOT NULL DEFAULT 30,
    "heures_cours_debut" TEXT NOT NULL DEFAULT '08:00',
    "heures_cours_fin" TEXT NOT NULL DEFAULT '18:00',
    "jours_ouvres" TEXT NOT NULL DEFAULT 'Lundi,Mardi,Mercredi,Jeudi,Vendredi,Samedi',

    CONSTRAINT "pedagogical_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_emails" (
    "id" SERIAL NOT NULL,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "templateName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "scheduledFor" TIMESTAMP(3),

    CONSTRAINT "notification_emails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_whatsapps" (
    "id" SERIAL NOT NULL,
    "to" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "templateName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "scheduledFor" TIMESTAMP(3),
    "metaMessageId" TEXT,
    "httpStatus" INTEGER,

    CONSTRAINT "notification_whatsapps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backup_logs" (
    "id" SERIAL NOT NULL,
    "filename" TEXT NOT NULL,
    "backupType" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "errorMessage" TEXT,

    CONSTRAINT "backup_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions_comptables" (
    "id" SERIAL NOT NULL,
    "id_ecole" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "categorie" TEXT NOT NULL,
    "montant" DECIMAL(65,30) NOT NULL,
    "mode_paiement" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "reference" TEXT,
    "compte_caisse" TEXT,
    "compte_banque" TEXT,

    CONSTRAINT "transactions_comptables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "livres_pedagogiques" (
    "id" SERIAL NOT NULL,
    "titre" TEXT NOT NULL,
    "auteur" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "matiere" TEXT NOT NULL,
    "niveau" TEXT NOT NULL,
    "url" TEXT DEFAULT '/books/placeholder.pdf',
    "dateAjout" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "livres_pedagogiques_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "examens_nationaux" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "dateExamen" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "jurys" TEXT,
    "salles" TEXT,

    CONSTRAINT "examens_nationaux_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schema_versions" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "version" TEXT NOT NULL,
    "migration" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "error" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schema_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verified_documents" (
    "id" TEXT NOT NULL,
    "numeroUnique" TEXT NOT NULL,
    "hashSha256" TEXT NOT NULL,
    "typeDocument" TEXT NOT NULL,
    "dateGeneration" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_utilisateur" INTEGER NOT NULL,
    "id_ecole" INTEGER NOT NULL,
    "metadataJson" TEXT NOT NULL,

    CONSTRAINT "verified_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reset_password_tokens" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reset_password_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_logs" (
    "id" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_years" (
    "id" SERIAL NOT NULL,
    "id_ecole" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_years_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "abonnements_id_ecole_idx" ON "abonnements"("id_ecole");

-- CreateIndex
CREATE INDEX "absences_id_eleve_idx" ON "absences"("id_eleve");

-- CreateIndex
CREATE INDEX "absences_date_absence_idx" ON "absences"("date_absence");

-- CreateIndex
CREATE INDEX "absences_id_eleve_date_absence_idx" ON "absences"("id_eleve", "date_absence");

-- CreateIndex
CREATE INDEX "absences_statut_idx" ON "absences"("statut");

-- CreateIndex
CREATE INDEX "ai_insights_id_utilisateur_idx" ON "ai_insights"("id_utilisateur");

-- CreateIndex
CREATE INDEX "annonces_id_auteur_idx" ON "annonces"("id_auteur");

-- CreateIndex
CREATE INDEX "classes_id_ecole_idx" ON "classes"("id_ecole");

-- CreateIndex
CREATE INDEX "classes_id_level_idx" ON "classes"("id_level");

-- CreateIndex
CREATE UNIQUE INDEX "ecoles_subdomain_key" ON "ecoles"("subdomain");

-- CreateIndex
CREATE INDEX "eleve_badges_id_badge_idx" ON "eleve_badges"("id_badge");

-- CreateIndex
CREATE INDEX "eleve_badges_id_eleve_idx" ON "eleve_badges"("id_eleve");

-- CreateIndex
CREATE INDEX "emplois_du_temps_id_classe_idx" ON "emplois_du_temps"("id_classe");

-- CreateIndex
CREATE INDEX "emplois_du_temps_id_enseignant_idx" ON "emplois_du_temps"("id_enseignant");

-- CreateIndex
CREATE INDEX "emplois_du_temps_id_classe_jour_idx" ON "emplois_du_temps"("id_classe", "jour");

-- CreateIndex
CREATE INDEX "emplois_du_temps_id_enseignant_jour_idx" ON "emplois_du_temps"("id_enseignant", "jour");

-- CreateIndex
CREATE INDEX "evaluations_id_classe_idx" ON "evaluations"("id_classe");

-- CreateIndex
CREATE INDEX "evaluations_id_classe_date_eval_idx" ON "evaluations"("id_classe", "date_eval");

-- CreateIndex
CREATE INDEX "inscriptions_id_classe_idx" ON "inscriptions"("id_classe");

-- CreateIndex
CREATE INDEX "inscriptions_id_eleve_idx" ON "inscriptions"("id_eleve");

-- CreateIndex
CREATE INDEX "inscriptions_annee_scolaire_id_classe_idx" ON "inscriptions"("annee_scolaire", "id_classe");

-- CreateIndex
CREATE INDEX "inscriptions_id_eleve_annee_scolaire_statut_idx" ON "inscriptions"("id_eleve", "annee_scolaire", "statut");

-- CreateIndex
CREATE INDEX "messages_id_destinataire_idx" ON "messages"("id_destinataire");

-- CreateIndex
CREATE INDEX "messages_id_expediteur_idx" ON "messages"("id_expediteur");

-- CreateIndex
CREATE INDEX "messages_id_destinataire_lu_idx" ON "messages"("id_destinataire", "lu");

-- CreateIndex
CREATE INDEX "messages_id_expediteur_id_destinataire_idx" ON "messages"("id_expediteur", "id_destinataire");

-- CreateIndex
CREATE INDEX "notes_id_eleve_idx" ON "notes"("id_eleve");

-- CreateIndex
CREATE INDEX "notes_id_evaluation_idx" ON "notes"("id_evaluation");

-- CreateIndex
CREATE INDEX "notes_id_eleve_id_evaluation_idx" ON "notes"("id_eleve", "id_evaluation");

-- CreateIndex
CREATE INDEX "paiements_id_utilisateur_idx" ON "paiements"("id_utilisateur");

-- CreateIndex
CREATE INDEX "paiements_status_date_paiement_idx" ON "paiements"("status", "date_paiement");

-- CreateIndex
CREATE INDEX "parcours_scolaires_id_eleve_idx" ON "parcours_scolaires"("id_eleve");

-- CreateIndex
CREATE INDEX "parent_eleve_id_eleve_idx" ON "parent_eleve"("id_eleve");

-- CreateIndex
CREATE INDEX "parent_eleve_id_parent_idx" ON "parent_eleve"("id_parent");

-- CreateIndex
CREATE UNIQUE INDEX "settings_key_name_key" ON "settings"("key_name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_id_ecole_idx" ON "users"("id_ecole");

-- CreateIndex
CREATE INDEX "users_role_id_ecole_idx" ON "users"("role", "id_ecole");

-- CreateIndex
CREATE INDEX "teacher_subjects_id_enseignant_idx" ON "teacher_subjects"("id_enseignant");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_subjects_id_enseignant_matiere_key" ON "teacher_subjects"("id_enseignant", "matiere");

-- CreateIndex
CREATE INDEX "teacher_availabilities_id_enseignant_idx" ON "teacher_availabilities"("id_enseignant");

-- CreateIndex
CREATE INDEX "teacher_availabilities_id_enseignant_jour_idx" ON "teacher_availabilities"("id_enseignant", "jour");

-- CreateIndex
CREATE INDEX "school_levels_id_ecole_idx" ON "school_levels"("id_ecole");

-- CreateIndex
CREATE INDEX "level_subjects_id_level_idx" ON "level_subjects"("id_level");

-- CreateIndex
CREATE UNIQUE INDEX "pedagogical_settings_id_ecole_key" ON "pedagogical_settings"("id_ecole");

-- CreateIndex
CREATE INDEX "transactions_comptables_id_ecole_idx" ON "transactions_comptables"("id_ecole");

-- CreateIndex
CREATE INDEX "transactions_comptables_type_date_idx" ON "transactions_comptables"("type", "date");

-- CreateIndex
CREATE UNIQUE INDEX "verified_documents_numeroUnique_key" ON "verified_documents"("numeroUnique");

-- CreateIndex
CREATE UNIQUE INDEX "reset_password_tokens_tokenHash_key" ON "reset_password_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "school_years_id_ecole_idx" ON "school_years"("id_ecole");

-- CreateIndex
CREATE INDEX "school_years_status_idx" ON "school_years"("status");

-- CreateIndex
CREATE UNIQUE INDEX "school_years_id_ecole_label_key" ON "school_years"("id_ecole", "label");

-- AddForeignKey
ALTER TABLE "abonnements" ADD CONSTRAINT "abonnements_id_ecole_fkey" FOREIGN KEY ("id_ecole") REFERENCES "ecoles"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "absences" ADD CONSTRAINT "absences_id_eleve_fkey" FOREIGN KEY ("id_eleve") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "ai_insights" ADD CONSTRAINT "ai_insights_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "annonces" ADD CONSTRAINT "annonces_id_auteur_fkey" FOREIGN KEY ("id_auteur") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_id_ecole_fkey" FOREIGN KEY ("id_ecole") REFERENCES "ecoles"("id") ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_id_level_fkey" FOREIGN KEY ("id_level") REFERENCES "school_levels"("id") ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "eleve_badges" ADD CONSTRAINT "eleve_badges_id_eleve_fkey" FOREIGN KEY ("id_eleve") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "eleve_badges" ADD CONSTRAINT "eleve_badges_id_badge_fkey" FOREIGN KEY ("id_badge") REFERENCES "badges"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "emplois_du_temps" ADD CONSTRAINT "emplois_du_temps_id_classe_fkey" FOREIGN KEY ("id_classe") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "emplois_du_temps" ADD CONSTRAINT "emplois_du_temps_id_enseignant_fkey" FOREIGN KEY ("id_enseignant") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_id_classe_fkey" FOREIGN KEY ("id_classe") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "inscriptions" ADD CONSTRAINT "inscriptions_id_eleve_fkey" FOREIGN KEY ("id_eleve") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "inscriptions" ADD CONSTRAINT "inscriptions_id_classe_fkey" FOREIGN KEY ("id_classe") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_id_destinataire_fkey" FOREIGN KEY ("id_destinataire") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_id_expediteur_fkey" FOREIGN KEY ("id_expediteur") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_id_evaluation_fkey" FOREIGN KEY ("id_evaluation") REFERENCES "evaluations"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_id_eleve_fkey" FOREIGN KEY ("id_eleve") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "paiements" ADD CONSTRAINT "paiements_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "parcours_scolaires" ADD CONSTRAINT "parcours_scolaires_id_eleve_fkey" FOREIGN KEY ("id_eleve") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "parent_eleve" ADD CONSTRAINT "parent_eleve_id_eleve_fkey" FOREIGN KEY ("id_eleve") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parent_eleve" ADD CONSTRAINT "parent_eleve_id_parent_fkey" FOREIGN KEY ("id_parent") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_id_ecole_fkey" FOREIGN KEY ("id_ecole") REFERENCES "ecoles"("id") ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "teacher_subjects" ADD CONSTRAINT "teacher_subjects_id_enseignant_fkey" FOREIGN KEY ("id_enseignant") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_availabilities" ADD CONSTRAINT "teacher_availabilities_id_enseignant_fkey" FOREIGN KEY ("id_enseignant") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_levels" ADD CONSTRAINT "school_levels_id_ecole_fkey" FOREIGN KEY ("id_ecole") REFERENCES "ecoles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "level_subjects" ADD CONSTRAINT "level_subjects_id_level_fkey" FOREIGN KEY ("id_level") REFERENCES "school_levels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedagogical_settings" ADD CONSTRAINT "pedagogical_settings_id_ecole_fkey" FOREIGN KEY ("id_ecole") REFERENCES "ecoles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_years" ADD CONSTRAINT "school_years_id_ecole_fkey" FOREIGN KEY ("id_ecole") REFERENCES "ecoles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

