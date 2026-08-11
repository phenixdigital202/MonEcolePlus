import { getTenantClient } from "../lib/prisma-tenant"

async function main() {
  const url = "postgresql://postgres.nfrripylvuzxpuipdrpy:MonEcolePlus@aws-0-eu-west-3.pooler.supabase.com:6543/monecole_abou_4366?pgbouncer=true"
  const prisma = getTenantClient(url)
  console.log("Connecting to Abou Tenant...")
  try {
    const ecoles = await prisma.ecole.findMany()
    console.log("Ecoles in Abou DB:", ecoles)
  } catch (err: any) {
    console.log("Error querying ecole table in Abou DB:", err.message)
  }
}

main().catch(console.error)
