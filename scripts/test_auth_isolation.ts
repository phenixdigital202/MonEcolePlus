import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("==================================================")
  console.log("🧪 TESTS AUTOMATIQUES DE L'ISOLATION DES COMPTES 🧪")
  console.log("==================================================")

  const accounts = [
    { email: "Admin@judith.com", expectedRole: "admin", expectedUrl: "/dashboard" },
    { email: "admin@phenixdigital.ci", expectedRole: "super_admin", expectedUrl: "/super-admin" },
    { email: "admin@bambaissa.com", expectedRole: "parent", expectedUrl: "/dashboard/parent" },
    { email: "prof@abou.com", expectedRole: "teacher", expectedUrl: "/dashboard" },
    { email: "eleve@bancoul.com", expectedRole: "student", expectedUrl: "/dashboard" },
  ]

  console.log("| Compte | Rôle attendu | Rôle détecté | URL obtenue | Résultat |")
  console.log("| :--- | :--- | :--- | :--- | :--- |")

  for (const acc of accounts) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: acc.email }
      })
      
      if (!user) {
        console.log(`| ${acc.email} | ${acc.expectedRole} | INTROUVABLE | — | ❌ ÉCHEC |`)
        continue
      }

      // REDIRECTION LOGIC SIMULATION MATCHING LoginPage and middleware
      let finalUrl = "/dashboard"
      if (user.role === "super_admin") {
        finalUrl = "/super-admin"
      } else if (user.role === "parent") {
        finalUrl = "/dashboard/parent"
      }

      const match = user.role === acc.expectedRole && finalUrl === acc.expectedUrl
      const status = match ? "✅ SUCCÈS" : "❌ ERREUR"

      console.log(`| ${acc.email} | ${acc.expectedRole} | ${user.role} | ${finalUrl} | ${status} |`)
    } catch (err: any) {
      console.log(`| ${acc.email} | ${acc.expectedRole} | ERREUR: ${err.message} | — | ❌ ÉCHEC |`)
    }
  }

  await prisma.$disconnect()
}

main().catch(console.error)
