import prismaMaster from "../lib/prisma";
import { getTenantClient } from "../lib/prisma-tenant";

async function main() {
  console.log("[Add Avatar Column] Updating Master DB...");
  try {
    await prismaMaster.$executeRawUnsafe(`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;`);
    console.log("[Add Avatar Column] Master DB updated successfully.");
  } catch (e: any) {
    console.error("[Add Avatar Column] Master DB error:", e.message);
  }

  const ecoles = await prismaMaster.ecole.findMany();
  for (const ecole of ecoles) {
    if (ecole.database_url) {
      try {
        console.log(`[Add Avatar Column] Updating Tenant DB for school ${ecole.id} (${ecole.nom})...`);
        const tenantPrisma = getTenantClient(ecole.database_url);
        await tenantPrisma.$executeRawUnsafe(`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;`);
        console.log(`[Add Avatar Column] Tenant DB ${ecole.id} updated successfully.`);
      } catch (err: any) {
        console.error(`[Add Avatar Column] Tenant DB ${ecole.id} error:`, err.message);
      }
    }
  }

  console.log("[Add Avatar Column] Done.");
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
