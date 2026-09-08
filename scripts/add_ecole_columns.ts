import prismaMaster from "../lib/prisma";
import { getTenantClient } from "../lib/prisma-tenant";

async function addEcoleColumns() {
  console.log("=== ADDING MISSING COLUMNS TO ECOLES TABLE IN MASTER & TENANTS ===");

  const alterStatements = [
    "ALTER TABLE ecoles ADD COLUMN IF NOT EXISTS directeur TEXT;",
    "ALTER TABLE ecoles ADD COLUMN IF NOT EXISTS adresse TEXT;",
    "ALTER TABLE ecoles ADD COLUMN IF NOT EXISTS telephone TEXT;",
    "ALTER TABLE ecoles ADD COLUMN IF NOT EXISTS email TEXT;",
    "ALTER TABLE ecoles ADD COLUMN IF NOT EXISTS website TEXT;"
  ];

  // 1. Master DB
  try {
    for (const sql of alterStatements) {
      await prismaMaster.$executeRawUnsafe(sql);
    }
    console.log("[Master DB] Added missing ecole columns successfully.");
  } catch (e: any) {
    console.error("[Master DB] Error adding ecole columns:", e.message);
  }

  // 2. Tenant DBs
  try {
    const schools = await prismaMaster.ecole.findMany({
      where: { database_url: { not: null } }
    });

    for (const school of schools) {
      if (!school.database_url) continue;
      try {
        const tenantPrisma = getTenantClient(school.database_url);
        for (const sql of alterStatements) {
          await tenantPrisma.$executeRawUnsafe(sql);
        }
        console.log(`[Tenant DB: ${school.nom}] Added missing ecole columns.`);
        await tenantPrisma.$disconnect();
      } catch (err: any) {
        console.error(`[Tenant DB: ${school.nom}] Error:`, err.message);
      }
    }
  } catch (err: any) {
    console.error("Error fetching tenant schools:", err.message);
  } finally {
    await prismaMaster.$disconnect();
  }

  console.log("=== COMPLETED ADDING ECOLE COLUMNS ===");
}

addEcoleColumns();
