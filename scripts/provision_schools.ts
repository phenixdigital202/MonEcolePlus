import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

const masterPrisma = new PrismaClient()

async function provisionSchool(name: string, slug: string, adminEmail: string) {
  console.log(`\n--- Provisioning School: ${name} ---`)
  
  const dbName = `monecole_${slug.replace(/-/g, '_')}`
  const dbUrl = `mysql://root:@127.0.0.1:3306/${dbName}`

  // 1. Create in Master
  console.log(`[1/5] Registering in Master DB...`)
  const school = await masterPrisma.ecoles.create({
    data: {
      nom: name,
      subdomain: slug,
      database_url: dbUrl,
      db_status: 'provisioning'
    }
  })

  // 2. Physical DB Creation
  console.log(`[2/5] Creating Physical Database: ${dbName}...`)
  try {
    const tempPrisma = new PrismaClient({
      datasources: { db: { url: "mysql://root:@127.0.0.1:3306/mysql" } }
    })
    await tempPrisma.$executeRawUnsafe(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``)
    await tempPrisma.$disconnect()
  } catch (e) {
    console.error(`Database creation failed:`, e)
  }

  // 3. Schema Push
  console.log(`[3/5] Initializing Schema (This takes ~30s)...`)
  try {
    execSync(`npx prisma db push`, {
      env: { ...process.env, DATABASE_URL: dbUrl },
      timeout: 60000
    })
  } catch (e) {
    console.error(`Prisma push failed:`, e.message)
  }

  // 4. Seeding Classes
  console.log(`[4/5] Seeding Classes...`)
  const tenantPrisma = new PrismaClient({
    datasources: { db: { url: dbUrl } }
  })

  // Create school stub in tenant for FK (Upsert to be safe)
  await tenantPrisma.ecoles.upsert({
    where: { id: school.id },
    update: { nom: name, subdomain: slug },
    create: { id: school.id, nom: name, subdomain: slug }
  })

  const classStructure = [
    // Primary (6)
    { nom: 'CP1', niveau: 'Primaire' },
    { nom: 'CP2', niveau: 'Primaire' },
    { nom: 'CE1', niveau: 'Primaire' },
    { nom: 'CE2', niveau: 'Primaire' },
    { nom: 'CM1', niveau: 'Primaire' },
    { nom: 'CM2', niveau: 'Primaire' },
    // Middle (4)
    { nom: '6ème', niveau: 'Collège' },
    { nom: '5ème', niveau: 'Collège' },
    { nom: '4ème', niveau: 'Collège' },
    { nom: '3ème', niveau: 'Collège' },
    // High (3)
    { nom: '2nde', niveau: 'Lycée' },
    { nom: '1ère', niveau: 'Lycée' },
    { nom: 'Tle', niveau: 'Lycée' },
  ]

  await tenantPrisma.class.createMany({
    data: classStructure.map(c => ({
      ...c,
      id_ecole: school.id
    }))
  })

  // 5. Create Admin
  console.log(`[5/5] Creating Admin Account...`)
  const hashedPassword = await bcrypt.hash('admin123', 10)
  await tenantPrisma.user.create({
    data: {
      nom: 'Directeur',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      id_ecole: school.id
    }
  })

  // Mark as ready
  await masterPrisma.ecoles.update({
    where: { id: school.id },
    data: { db_status: 'ready' }
  })

  await tenantPrisma.$disconnect()
  console.log(`✅ Success: ${name} is ready.`)
}

async function main() {
  try {
    // Lycée Moderne d'Abou -> lycee-abou
    await provisionSchool("Lycée Moderne d'Abou", "lycee-abou", "admin@abou.com")
    // Lycée Moderne de Judith -> lycee-judith
    await provisionSchool("Lycée Moderne de Judith", "lycee-judith", "admin@judith.com")
  } catch (e) {
    console.error("Critical Failure:", e)
  } finally {
    await masterPrisma.$disconnect()
  }
}

main()
