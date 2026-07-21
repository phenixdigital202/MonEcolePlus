import { Client } from 'pg'
import { execSync } from 'child_process'

/**
 * Creates a new physical PostgreSQL database for a tenant and initializes its schema.
 */
export async function provisionTenantDatabase(dbName: string) {
  const directUrl = process.env.DIRECT_URL
  const poolUrl = process.env.DATABASE_URL
  
  if (!directUrl || !poolUrl) throw new Error("DATABASE_URL or DIRECT_URL not found")

  console.log(`[Provisioner] Starting provisioning for database: ${dbName}`)

  // 1. Create the database using pg
  const client = new Client({ connectionString: directUrl })

  try {
    await client.connect()
    console.log(`[Provisioner] Executing: CREATE DATABASE "${dbName}"`)
    await client.query(`CREATE DATABASE "${dbName}"`)
    console.log(`[Provisioner] Database "${dbName}" is ready.`)
  } catch (error: any) {
    if (!error.message.includes('already exists')) {
       console.error(`[Provisioner] Failed to create database:`, error.message)
       throw error
    }
  } finally {
    await client.end()
  }

  // Generate tenant URLs
  const parsedDirect = new URL(directUrl)
  parsedDirect.pathname = `/${dbName}`
  const tenantDirectUrl = parsedDirect.toString()

  const parsedPool = new URL(poolUrl)
  parsedPool.pathname = `/${dbName}`
  const tenantPoolUrl = parsedPool.toString()

  // 2. Initialize schema using pure SQL (Vercel compatible)
  console.log(`[Provisioner] Initializing schema for ${dbName} via SQL script...`)
  
  const tenantClient = new Client({ connectionString: tenantDirectUrl })
  
  try {
    const fs = require('fs')
    const path = require('path')
    
    // Read the init.sql file generated during build
    const sqlPath = path.join(process.cwd(), 'prisma', 'init.sql')
    if (!fs.existsSync(sqlPath)) {
        throw new Error("Init SQL script not found. Please run 'npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > prisma/init.sql'")
    }
    
    const sql = fs.readFileSync(sqlPath, 'utf8')
    
    await tenantClient.connect()
    console.log(`[Provisioner] Executing schema SQL on tenant database...`)
    await tenantClient.query(sql)
    console.log(`[Provisioner] Schema initialization successful for ${dbName}.`)
    
    return { success: true, url: tenantPoolUrl }
  } catch (error: any) {
    console.error(`[Provisioner] Schema initialization failed:`, error.message)
    return { success: false, error: `Initialization error: ${error.message}` }
  } finally {
    await tenantClient.end()
  }
}
