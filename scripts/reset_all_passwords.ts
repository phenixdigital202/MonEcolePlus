import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

async function main() {
  console.log("==================================================")
  console.log("🔑 RESETTING ALL USERS PASSWORDS TO password123 🔑")
  console.log("==================================================")

  const masterPrisma = new PrismaClient()
  const targetPassword = "password123"
  const hashedPassword = await bcrypt.hash(targetPassword, 10)

  // 1. Fetch all schools
  const ecoles = await masterPrisma.ecole.findMany()
  console.log(`Found ${ecoles.length} school(s) to process.`)

  for (const ecole of ecoles) {
    if (!ecole.database_url) continue

    console.log(`\nProcessing school: ${ecole.nom} (ID: ${ecole.id})`)
    const tenantPrisma = new PrismaClient({
      datasources: { db: { url: ecole.database_url } }
    })

    try {
      // 2. Fetch all users in tenant DB
      const tenantUsers = await tenantPrisma.user.findMany()
      
      for (const tUser of tenantUsers) {
        // Reset password in Tenant DB
        await tenantPrisma.user.update({
          where: { id: tUser.id },
          data: { password: hashedPassword }
        })

        // Reset password in Master DB
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
        console.log(`  - Reset password for: ${tUser.email} (Role: ${tUser.role})`)
      }
    } catch (err: any) {
      console.warn(`  ⚠️ Could not reset tenant ${ecole.nom}: ${err.message}`)
    } finally {
      await tenantPrisma.$disconnect()
    }
  }

  // Ensure Super Admin remains correct
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
  console.log(`\n✅ Verified Super Admin (admin@phenixdigital.ci | password: supersecuresaas123)`)

  await masterPrisma.$disconnect()
  console.log("\n==================================================")
  console.log("🎉 ALL PASSWORDS RESET TO 'password123' SUCCESSFULLY 🎉")
  console.log("==================================================")
}

main().catch(console.error)
