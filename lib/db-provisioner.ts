import mysql from 'mysql2/promise'
import { execSync } from 'child_process'
import path from 'path'

/**
 * Creates a new physical MySQL database for a tenant and initializes its schema.
 */
export async function provisionTenantDatabase(dbName: string) {
  const masterUrl = process.env.DATABASE_URL
  if (!masterUrl) throw new Error("DATABASE_URL not found")

  console.log(`[Provisioner] Starting provisioning for database: ${dbName}`)

  // Robust URL parsing - Force IPv4 (127.0.0.1) to avoid localhost/IPv6 issues on Windows
  let connUrl;
  try {
    connUrl = new URL(masterUrl.replace('mysql://', 'http://'))
  } catch (e) {
    throw new Error(`Invalid DATABASE_URL format: ${masterUrl}`)
  }

  const user = connUrl.username || 'root'
  const password = connUrl.password || ''
  const host = (connUrl.hostname === 'localhost' || connUrl.hostname === '0.0.0.0') ? '127.0.0.1' : connUrl.hostname
  const port = connUrl.port || '3306'

  // 1. Create the database using mysql2
  const connection = await mysql.createConnection({
    host,
    port: parseInt(port),
    user,
    password
  })

  try {
    console.log(`[Provisioner] Executing: CREATE DATABASE IF NOT EXISTS \`${dbName}\``)
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``)
    console.log(`[Provisioner] Database \`${dbName}\` is ready.`)
  } catch (error: any) {
    console.error(`[Provisioner] Failed to create database:`, error.message)
    throw error
  } finally {
    await connection.end()
  }

  // 2. Initialize schema using Prisma db push
  const tenantUrl = `mysql://${user}${password ? `:${password}` : ''}@${host}:${port}/${dbName}`
  
  console.log(`[Provisioner] Initializing schema for ${dbName} via npx prisma db push...`)
  try {
    // Force DATABASE_URL for this specific process
    // On Windows, use cmd /c to ensure PATH is handled correctly
    const cmd = `npx prisma db push --skip-generate --accept-data-loss`
    
    execSync(cmd, {
      env: {
        ...process.env,
        DATABASE_URL: tenantUrl,
      },
      stdio: 'pipe', 
      windowsHide: true,
      encoding: 'utf-8',
      timeout: 60000 // 60 seconds timeout for schema initialization
    })
    
    console.log(`[Provisioner] Schema initialization successful for ${dbName}.`)
    return { success: true, url: tenantUrl }
  } catch (error: any) {
    const errorMsg = error.stderr || error.stdout || error.message
    console.error(`[Provisioner] Prisma initialization failed:`, errorMsg)
    return { success: false, error: `Prisma error: ${errorMsg}` }
  }
}
