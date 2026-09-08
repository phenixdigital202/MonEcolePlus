import prismaMaster from "../lib/prisma";

async function main() {
  console.log("[Test DB Query] Starting query to Master DB...");
  try {
    const schools = await prismaMaster.ecole.findMany();
    console.log(`[Test DB Query] Found ${schools.length} schools:`);
    for (const school of schools) {
      console.log(` - ID: ${school.id}, Nom: "${school.nom}", Subdomain: "${school.subdomain}", DB_URL: ${school.database_url ? 'PRESENT' : 'NULL'}`);
    }

    const users = await prismaMaster.user.findMany({ take: 10 });
    console.log(`[Test DB Query] Found ${users.length} users in Master DB:`);
    for (const user of users) {
      console.log(` - ID: ${user.id}, Nom: "${user.nom}", Email: "${user.email}", Role: "${user.role}", EcoleID: ${user.id_ecole}`);
    }
  } catch (err: any) {
    console.error("[Test DB Query] ERROR:", err.message);
  } finally {
    await prismaMaster.$disconnect();
    console.log("[Test DB Query] Done.");
    process.exit(0);
  }
}

main();
