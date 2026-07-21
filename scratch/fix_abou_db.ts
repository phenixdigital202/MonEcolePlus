import { PrismaClient } from '@prisma/client';
import { Client } from 'pg';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

async function provisionTenantDatabase(dbName: string) {
  const directUrl = process.env.DIRECT_URL;
  const poolUrl = process.env.DATABASE_URL;
  if (!directUrl || !poolUrl) throw new Error("DATABASE_URL or DIRECT_URL not found");

  const client = new Client({ connectionString: directUrl });
  try {
    await client.connect();
    await client.query(`CREATE DATABASE "${dbName}"`);
  } catch (error: any) {
    if (!error.message.includes('already exists')) throw error;
  } finally {
    await client.end();
  }

  const parsedDirect = new URL(directUrl);
  parsedDirect.pathname = `/${dbName}`;
  const tenantDirectUrl = parsedDirect.toString();

  const parsedPool = new URL(poolUrl);
  parsedPool.pathname = `/${dbName}`;
  const tenantPoolUrl = parsedPool.toString();

  const tenantClient = new Client({ connectionString: tenantDirectUrl });
  try {
    const sqlPath = path.join(process.cwd(), 'prisma', 'init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8').replace(/^\uFEFF/, '');
    
    await tenantClient.connect();
    await tenantClient.query(sql);
    return { success: true, url: tenantPoolUrl };
  } catch (error: any) {
    return { success: false, error: `Initialization error: ${error.message}` };
  } finally {
    await tenantClient.end();
  }
}

async function fixAbou() {
  const masterPrisma = new PrismaClient();
  try {
    console.log("[Fix] Starting DB provisioning for Abou...");
    const dbName = `monecole_abou_${Date.now().toString().slice(-4)}`;
    
    const provision = await provisionTenantDatabase(dbName);
    if (!provision.success) throw new Error(`Failed to provision: ${provision.error}`);
    const tenantUrl = provision.url!;
    console.log(`[Fix] Provisioned tenant DB: ${tenantUrl}`);

    await masterPrisma.ecole.update({
      where: { id: 3 },
      data: { database_url: tenantUrl }
    });
    console.log(`[Fix] Updated Ecole ID 3 with new database_url.`);

    const tenantPrisma = new PrismaClient({
      datasources: { db: { url: tenantUrl } }
    });

    await tenantPrisma.ecole.create({
      data: {
        id: 3,
        nom: "Lycée Moderne d'Abou",
        subdomain: "abou",
      }
    });

    const hashedPassword = await bcrypt.hash("admin123", 10);
    await tenantPrisma.user.create({
      data: {
        nom: "Admin Abou",
        email: "admin@abou.com",
        password: hashedPassword,
        role: "admin",
        id_ecole: 3
      }
    });

    const classes = [
      { nom: "CP1", niveau: "Primaire" },
      { nom: "CP2", niveau: "Primaire" },
      { nom: "CE1", niveau: "Primaire" },
      { nom: "CE2", niveau: "Primaire" },
      { nom: "CM1", niveau: "Primaire" },
      { nom: "CM2", niveau: "Primaire" },
      { nom: "6ème", niveau: "Collège" },
      { nom: "5ème", niveau: "Collège" },
      { nom: "4ème", niveau: "Collège" },
      { nom: "3ème", niveau: "Collège" },
      { nom: "2nde", niveau: "Lycée" },
      { nom: "1ère", niveau: "Lycée" },
      { nom: "Terminale", niveau: "Lycée" }
    ];

    for (const c of classes) {
      await tenantPrisma.class.create({
        data: {
          nom: c.nom,
          niveau: c.niveau,
          id_ecole: 3
        }
      });
    }
    console.log(`[Fix] Created 13 classes in tenant DB.`);
    console.log("[Fix] Success! Abou is now fully isolated in its own database.");

  } catch (error) {
    console.error("[Fix] Error:", error);
  } finally {
    await masterPrisma.$disconnect();
  }
}

fixAbou();
