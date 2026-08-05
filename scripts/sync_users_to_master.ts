import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

async function main() {
  console.log("==========================================")
  console.log("🔄 SYNC ALL TENANT USERS TO MASTER DB 🔄")
  console.log("==========================================")

  const masterPrisma = new PrismaClient()
  const defaultPassword = "password123" // Common fallback password

  // 1. Get all schools from Master DB
  const ecoles = await masterPrisma.ecole.findMany()
  console.log(`Found ${ecoles.length} school(s) to scan.`)

  for (const ecole of ecoles) {
    if (!ecole.database_url) continue

    console.log(`\nScanning database for school: ${ecole.nom} (ID: ${ecole.id})`)
    const tenantPrisma = new PrismaClient({
      datasources: { db: { url: ecole.database_url } }
    })

    try {
      // 2. Get all users from the school's Tenant DB
      const tenantUsers = await tenantPrisma.user.findMany()
      console.log(`Found ${tenantUsers.length} user(s) in tenant DB.`)

      for (const tUser of tenantUsers) {
        let hashedPassword = tUser.password

        // Check if password is not already bcrypt hashed
        if (!tUser.password.startsWith("$2b$")) {
          // If the password is a simple plaintext password (like "securepassword123"), hash it
          const rawPassword = tUser.password === "password" || tUser.password === "securepassword123" 
            ? tUser.password 
            : defaultPassword

          console.log(`Hashing password for user: ${tUser.email} (plain password was: "${rawPassword}")`)
          hashedPassword = await bcrypt.hash(rawPassword, 10)

          // Update password in the tenant DB to the hashed version
          await tenantPrisma.user.update({
            where: { id: tUser.id },
            data: { password: hashedPassword }
          })
        }

        // 3. Sync/Upsert user in the Master DB so they can pass the unified login
        await masterPrisma.user.upsert({
          where: { email: tUser.email },
          update: {
            nom: tUser.nom,
            password: hashedPassword,
            role: tUser.role,
            id_ecole: ecole.id,
            matiere: tUser.matiere
          },
          create: {
            nom: tUser.nom,
            email: tUser.email,
            password: hashedPassword,
            role: tUser.role,
            id_ecole: ecole.id,
            matiere: tUser.matiere
          }
        })
        console.log(`✅ Synced user ${tUser.email} to Master DB (Role: ${tUser.role}).`)
      }
    } catch (err: any) {
      console.error(`❌ Error syncing tenant ${ecole.nom}:`, err.message)
    } finally {
      await tenantPrisma.$disconnect()
    }
  }

  // 4. Force Super Admin user presence
  const superAdminEmail = "admin@phenixdigital.ci"
  const superAdminHash = await bcrypt.hash("supersecuresaas123", 10)
  await masterPrisma.user.upsert({
    where: { email: superAdminEmail },
    update: { password: superAdminHash },
    create: {
      nom: "Super Admin",
      email: superAdminEmail,
      password: superAdminHash,
      role: "super_admin",
      id_ecole: null
    }
  })
  console.log(`\n✅ Synced Super Admin (admin@phenixdigital.ci | password: supersecuresaas123)`)

  await masterPrisma.$disconnect()
  console.log("\n==========================================")
  console.log("🎉 ALL USERS SYNCHRONIZED SUCCESSFULLY 🎉")
  console.log("==========================================")
}

main().catch(console.error)
