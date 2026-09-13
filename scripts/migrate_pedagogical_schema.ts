import masterPrisma from '../lib/prisma';
import { getTenantClient } from '../lib/prisma-tenant';

async function migratePedagogicalSchema() {
  console.log('🚀 Starting Pedagogical Schema Migration across Master and all Tenant DBs...');

  // Fetch all ecoles from Master DB
  const ecoles = await masterPrisma.ecole.findMany({
    select: {
      id: true,
      nom: true,
      subdomain: true,
      database_url: true,
      db_status: true,
    },
  });

  console.log(`📋 Found ${ecoles.length} schools in Master DB.`);

  const statements = [
    `ALTER TABLE "classes" ADD COLUMN IF NOT EXISTS "id_professeur_principal" INTEGER;`,
    `CREATE TABLE IF NOT EXISTS "class_subjects" (
      "id" SERIAL PRIMARY KEY,
      "id_classe" INTEGER NOT NULL,
      "matiere" TEXT NOT NULL,
      "coefficient" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
      "volume_horaire_hebdo" INTEGER NOT NULL DEFAULT 4,
      "ordre" INTEGER NOT NULL DEFAULT 1,
      CONSTRAINT "fk_class_subjects_classe" FOREIGN KEY ("id_classe") REFERENCES "classes"("id") ON DELETE CASCADE
    );`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "class_subjects_id_classe_matiere_key" ON "class_subjects"("id_classe", "matiere");`,
    `CREATE INDEX IF NOT EXISTS "class_subjects_id_classe_idx" ON "class_subjects"("id_classe");`,
    `CREATE TABLE IF NOT EXISTS "class_subject_teachers" (
      "id" SERIAL PRIMARY KEY,
      "id_class_subject" INTEGER NOT NULL,
      "id_enseignant" INTEGER NOT NULL,
      CONSTRAINT "fk_cst_class_subject" FOREIGN KEY ("id_class_subject") REFERENCES "class_subjects"("id") ON DELETE CASCADE,
      CONSTRAINT "fk_cst_enseignant" FOREIGN KEY ("id_enseignant") REFERENCES "users"("id") ON DELETE CASCADE
    );`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "cst_id_class_subject_id_enseignant_key" ON "class_subject_teachers"("id_class_subject", "id_enseignant");`,
    `CREATE INDEX IF NOT EXISTS "cst_id_class_subject_idx" ON "class_subject_teachers"("id_class_subject");`,
    `CREATE INDEX IF NOT EXISTS "cst_id_enseignant_idx" ON "class_subject_teachers"("id_enseignant");`
  ];

  async function applyStatements(client: any, label: string) {
    for (const sql of statements) {
      await client.$executeRawUnsafe(sql);
    }
    console.log(`✅ ${label} updated successfully.`);
  }

  // 1. Run migration on main database (Master / default connection)
  try {
    console.log(`\n⚙️ Migrating Master / Default DB...`);
    await applyStatements(masterPrisma, 'Master DB');
  } catch (err: any) {
    console.error(`❌ Failed migrating Master DB:`, err?.message || err);
  }

  // 2. Run migration on each Tenant database
  for (const ecole of ecoles) {
    if (!ecole.database_url) {
      console.log(`⏩ Skipping ecole ${ecole.id} (${ecole.nom}) - No database_url`);
      continue;
    }

    try {
      console.log(`\n⚙️ Migrating Tenant DB: ${ecole.subdomain || ecole.id} (${ecole.nom})...`);
      const tenantPrisma = getTenantClient(ecole.database_url);
      await applyStatements(tenantPrisma, `Tenant DB [${ecole.subdomain || ecole.id}]`);
    } catch (err: any) {
      console.error(`❌ Error migrating Tenant DB [${ecole.subdomain || ecole.id}]:`, err?.message || err);
    }
  }

  console.log(`\n🎉 Pedagogical Schema Migration complete across all targets!`);
  process.exit(0);
}

migratePedagogicalSchema().catch((err) => {
  console.error('Fatal migration error:', err);
  process.exit(1);
});
