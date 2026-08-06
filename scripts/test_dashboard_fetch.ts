import { getCachedSchoolStats } from "../lib/cached-queries"
import { getPrisma } from "../lib/tenant-context"

async function main() {
  // Mock cookies by setting environment/process state or mock headers
  // Wait, getPrisma uses cookies() which throws if run outside of Next request.
  // But wait, getPrisma has a CLI fallback!
  // "If in CLI/script context, we can override targeting using DATABASE_URL env"
  // So let's run with DATABASE_URL env set to Cocody's tenant URL!
  const dbUrl = "postgresql://postgres.nfrripylvuzxpuipdrpy:MonEcolePlus@aws-0-eu-west-3.pooler.supabase.com:5432/tenant_cocody_1785950690672"
  process.env.DATABASE_URL = dbUrl

  const prisma = await getPrisma()
  console.log("=== SIMULATING ADMINDATAFETCHER ===")
  const stats = await getCachedSchoolStats(9)
  console.log(`stats.studentCount: ${stats.studentCount}`)
  console.log(`stats.teacherCount: ${stats.teacherCount}`)
  console.log(`stats.classCount: ${stats.classCount}`)

  // Let's check classes query
  const dbClasses = await prisma.class.findMany({
    select: {
      id: true,
      nom: true,
      niveau: true,
      _count: { select: { inscriptions: true } }
    }
  })
  console.log(`dbClasses length: ${dbClasses.length}`)
  dbClasses.forEach(c => console.log(`- Class: ${c.nom}, Inscriptions count: ${c._count?.inscriptions}`))
}

main().catch(console.error)
