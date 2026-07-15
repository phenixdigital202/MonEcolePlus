
const mysql = require('mysql2/promise');
const { execSync } = require('child_process');

async function cleanup() {
  const masterUrl = "mysql://root:@127.0.0.1:3306";
  const connection = await mysql.createConnection(masterUrl);

  try {
    console.log("Searching for tenant databases...");
    const [dbs] = await connection.query("SHOW DATABASES LIKE 'monecole_%'");
    
    for (const dbRow of dbs) {
      const dbName = Object.values(dbRow)[0];
      if (dbName === 'monecole') continue; // Safety
      
      console.log(`Dropping database: ${dbName}...`);
      await connection.query(`DROP DATABASE \`${dbName}\``);
    }

    console.log("Tenant databases cleared.");

    console.log("Resetting master database 'monecole'...");
    // We use prisma db push --force-reset to clear all tables and apply schema
    const cmd = `npx prisma db push --force-reset --accept-data-loss`;
    execSync(cmd, { stdio: 'inherit' });
    
    console.log("Master database reset successfully.");

  } catch (error) {
    console.error("Cleanup failed:", error);
  } finally {
    await connection.end();
  }
}

cleanup();
