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

  // 2. Initialize schema using Prisma db push
  console.log(`[Provisioner] Initializing schema for ${dbName} via npx prisma db push...`)
  try {
    const cmd = `npx prisma db push --skip-generate --accept-data-loss`
    
    execSync(cmd, {
      env: {
        ...process.env,
        DATABASE_URL: tenantPoolUrl,
        DIRECT_URL: tenantDirectUrl,
      },
      stdio: 'pipe', 
      windowsHide: true,
      encoding: 'utf-8',
      timeout: 60000
    })
    
    console.log(`[Provisioner] Schema initialization successful for ${dbName}.`)
    return { success: true, url: tenantPoolUrl }
  } catch (error: any) {
    const errorMsg = error.stderr || error.stdout || error.message
    console.error(`[Provisioner] Prisma initialization failed:`, errorMsg)
    return { success: false, error: `Prisma error: ${errorMsg}` }
  }
}
