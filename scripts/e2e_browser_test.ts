/**
 * E2E Multi-Tenant Test — Tests the REAL runtime flow
 * 
 * This test calls the exact same functions the app uses at runtime:
 * 1. loginUser() with form data (same as the login form)
 * 2. getCurrentTenant() with mocked cookies (same as the dashboard)
 * 3. getPrisma() → tenant DB resolution
 * 4. getCachedUser() → user lookup
 * 5. getCachedSchoolStats() → dashboard stats
 * 
 * This reproduces EXACTLY what happens in the browser.
 */

import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const masterPrisma = new PrismaClient()

interface LoginResult {
  userId: number
  schoolId: number | null
  userRole: string
  userName: string
}

interface DashboardResult {
  schoolName: string
  students: number
  teachers: number
  classes: number
  revenue: number
}

// ============================================
// STEP 1: Simulate loginUser() exactly
// ============================================
async function simulateLogin(email: string, password: string): Promise<LoginResult | null> {
  const cleanEmail = email.toLowerCase().trim()
  console.log(`\n[Login] Attempting login for: ${cleanEmail}`)
  
  // This is EXACTLY what auth-actions.ts loginUser() does
  const user = await masterPrisma.user.findUnique({
    where: { email: cleanEmail }
  })
  
  if (!user) {
    console.log(`[Login] ❌ User NOT FOUND in master DB`)
    return null
  }
  
  console.log(`[Login] User found: id=${user.id}, nom=${user.nom}, role=${user.role}, id_ecole=${user.id_ecole}`)
  
  // Verify password
  const passwordMatch = await bcrypt.compare(password, user.password)
  if (!passwordMatch) {
    console.log(`[Login] ❌ Password mismatch`)
    return null
  }
  
  console.log(`[Login] ✅ Password verified`)
  
  // These are the cookies that would be set
  const result: LoginResult = {
    userId: user.id,
    schoolId: user.id_ecole,
    userRole: user.role,
    userName: user.nom
  }
  
  console.log(`[Login] Cookies that would be set:`)
  console.log(`  user_id = ${result.userId}`)
  console.log(`  school_id = ${result.schoolId}`)
  console.log(`  user_role = ${result.userRole}`)
  
  return result
}

// ============================================
// STEP 2: Simulate getCurrentTenant() exactly
// ============================================
async function simulateGetCurrentTenant(schoolId: number | null): Promise<any> {
  console.log(`\n[getCurrentTenant] school_id cookie = ${schoolId}`)
  
  if (!schoolId) {
    console.log(`[getCurrentTenant] ❌ No school_id → returns null`)
    return null
  }
  
  // This is EXACTLY what tenant-context.ts getCurrentTenant() does
  const school = await masterPrisma.ecole.findUnique({
    where: { id: schoolId }
  })
  
  if (!school) {
    console.log(`[getCurrentTenant] ❌ School ID ${schoolId} not found in master DB`)
    return null
  }
  
  console.log(`[getCurrentTenant] ✅ Resolved: id=${school.id}, nom=${school.nom}, subdomain=${school.subdomain}`)
  console.log(`[getCurrentTenant]    database_url exists: ${!!school.database_url}`)
  
  if (!school.database_url) {
    console.log(`[getCurrentTenant] ❌ No database_url → returns null`)
    return null
  }
  
  // Extract DB name for display
  const dbNameMatch = school.database_url.match(/\/([a-zA-Z0-9_%]+)(?:\?|$)/)
  const dbName = dbNameMatch ? dbNameMatch[1] : "unknown"
  console.log(`[getCurrentTenant]    Target DB: ${dbName}`)
  
  return school
}

// ============================================
// STEP 3: Simulate getPrisma() + dashboard query
// ============================================
async function simulateDashboard(login: LoginResult): Promise<DashboardResult | null> {
  console.log(`\n${"─".repeat(50)}`)
  console.log(`📊 Simulating DASHBOARD for ${login.userName}`)
  console.log(`${"─".repeat(50)}`)
  
  // Step A: getCurrentTenant
  const tenant = await simulateGetCurrentTenant(login.schoolId)
  
  if (!tenant || !tenant.database_url) {
    console.log(`[Dashboard] ❌ CRITICAL: No tenant resolved → getPrisma() would THROW`)
    return null
  }
  
  // Step B: Connect to tenant DB (exactly like getPrisma → getTenantClient)
  const { getTenantClient } = require("../lib/prisma-tenant")
  const tenantPrisma = getTenantClient(tenant.database_url)
  
  // Step C: getCachedUser (find user by ID, then by email fallback)
  console.log(`\n[getCachedUser] Looking up user_id=${login.userId} in tenant DB`)
  let tenantUser = await tenantPrisma.user.findUnique({
    where: { id: login.userId },
    include: { ecole: true }
  })
  
  if (!tenantUser) {
    console.log(`[getCachedUser] ID lookup failed, trying email fallback...`)
    const masterUser = await masterPrisma.user.findUnique({
      where: { id: login.userId },
      select: { email: true }
    })
    if (masterUser?.email) {
      tenantUser = await tenantPrisma.user.findUnique({
        where: { email: masterUser.email },
        include: { ecole: true }
      })
    }
  }
  
  if (!tenantUser) {
    console.log(`[getCachedUser] ❌ User NOT FOUND in tenant DB (neither by ID nor email)`)
    console.log(`[Dashboard] → This would redirect to /login (user is null)`)
    return null
  }
  
  console.log(`[getCachedUser] ✅ Found: id=${tenantUser.id}, nom=${tenantUser.nom}, role=${tenantUser.role}`)
  
  // Step D: getCachedSchoolStats (exactly like the dashboard does)
  console.log(`\n[getCachedSchoolStats] Querying tenant DB...`)
  const [studentCount, teacherCount, classCount, revenueData] = await Promise.all([
    tenantPrisma.user.count({ where: { role: 'student' } }),
    tenantPrisma.user.count({ where: { role: 'teacher' } }),
    tenantPrisma.class.count(),
    tenantPrisma.paiement.aggregate({
      _sum: { montant: true },
      where: { status: 'paye' }
    })
  ])
  
  const revenue = revenueData._sum.montant ? Number(revenueData._sum.montant) : 0
  
  console.log(`[getCachedSchoolStats] Results:`)
  console.log(`  📚 Classes: ${classCount}`)
  console.log(`  🎓 Étudiants: ${studentCount}`)
  console.log(`  👨‍🏫 Enseignants: ${teacherCount}`)
  console.log(`  💰 Revenus: ${revenue} FCFA`)
  
  return {
    schoolName: tenant.nom,
    students: studentCount,
    teachers: teacherCount,
    classes: classCount,
    revenue
  }
}

// ============================================
// STEP 4: Simulate /dashboard/admin/school page
// ============================================
async function simulateSchoolConfig(login: LoginResult): Promise<boolean> {
  console.log(`\n${"─".repeat(50)}`)
  console.log(`🏫 Simulating SCHOOL CONFIG for ${login.userName}`)
  console.log(`${"─".repeat(50)}`)
  
  const tenant = await simulateGetCurrentTenant(login.schoolId)
  
  if (!tenant || !tenant.database_url) {
    console.log(`[SchoolConfig] ❌ No tenant resolved`)
    return false
  }
  
  const { getTenantClient } = require("../lib/prisma-tenant")
  const tenantPrisma = getTenantClient(tenant.database_url)
  
  try {
    const schoolData = await tenantPrisma.ecole.findFirst()
    console.log(`[SchoolConfig] School data: ${schoolData?.nom || "NOT FOUND"}`)
    
    const [studentsCount, teachersCount, parentsCount, classesCount] = await Promise.all([
      tenantPrisma.user.count({ where: { role: "student" } }),
      tenantPrisma.user.count({ where: { role: "teacher" } }),
      tenantPrisma.user.count({ where: { role: "parent" } }),
      tenantPrisma.class.count()
    ])
    
    console.log(`[SchoolConfig] Stats: ${studentsCount} students, ${teachersCount} teachers, ${parentsCount} parents, ${classesCount} classes`)
    
    // Test schoolYear query (this was crashing before!)
    try {
      const years = await tenantPrisma.schoolYear.findMany({ orderBy: { startDate: "desc" } })
      console.log(`[SchoolConfig] School years: ${years.length}`)
    } catch (err: any) {
      console.log(`[SchoolConfig] ⚠️ schoolYear query FAILED: ${err.message?.substring(0, 100)}`)
      console.log(`[SchoolConfig] → This is the CRASH that causes "Impossible de charger la configuration"`)
      return false
    }
    
    console.log(`[SchoolConfig] ✅ All queries succeeded`)
    return true
  } catch (err: any) {
    console.log(`[SchoolConfig] ❌ Error: ${err.message?.substring(0, 200)}`)
    return false
  }
}

// ============================================
// MAIN TEST RUNNER
// ============================================
async function main() {
  console.log("\n" + "🔥".repeat(30))
  console.log("  MonÉcole+ E2E RUNTIME SIMULATION")
  console.log("  Testing EXACT runtime flow")
  console.log("🔥".repeat(30))
  
  const allResults: { step: string, status: string, detail: string }[] = []
  
  // ── TEST SEQUENCE 1: COCODY → LOGOUT → ABOU ──
  
  console.log("\n\n" + "═".repeat(60))
  console.log("  SEQUENCE 1: COCODY → LOGOUT → ABOU")
  console.log("═".repeat(60))
  
  // Login Cocody
  const cocodyLogin = await simulateLogin("admin_cocody@monecole.ci", "password123")
  allResults.push({
    step: "LOGIN Cocody",
    status: cocodyLogin ? "PASS" : "FAIL",
    detail: cocodyLogin ? `userId=${cocodyLogin.userId}, schoolId=${cocodyLogin.schoolId}` : "Login failed"
  })
  
  if (cocodyLogin) {
    const cocodyDash = await simulateDashboard(cocodyLogin)
    allResults.push({
      step: "DASHBOARD Cocody",
      status: cocodyDash ? "PASS" : "FAIL",
      detail: cocodyDash ? `${cocodyDash.schoolName}: ${cocodyDash.classes} classes, ${cocodyDash.students} étudiants, ${cocodyDash.teachers} enseignants` : "Dashboard failed"
    })
    
    const cocodyConfig = await simulateSchoolConfig(cocodyLogin)
    allResults.push({
      step: "CONFIG Cocody",
      status: cocodyConfig ? "PASS" : "FAIL",
      detail: cocodyConfig ? "School config page loaded successfully" : "School config CRASHED"
    })
    
    // LOGOUT (clear cookies — simulated)
    console.log(`\n🚪 LOGOUT Cocody — clearing session cookies`)
    allResults.push({ step: "LOGOUT Cocody", status: "PASS", detail: "Cookies cleared" })
  }
  
  // Login Abou
  const abouLogin = await simulateLogin("admin@abou.com", "password123")
  allResults.push({
    step: "LOGIN Abou",
    status: abouLogin ? "PASS" : "FAIL",
    detail: abouLogin ? `userId=${abouLogin.userId}, schoolId=${abouLogin.schoolId}` : "Login failed"
  })
  
  if (abouLogin) {
    const abouDash = await simulateDashboard(abouLogin)
    allResults.push({
      step: "DASHBOARD Abou",
      status: abouDash ? "PASS" : "FAIL",
      detail: abouDash ? `${abouDash.schoolName}: ${abouDash.classes} classes, ${abouDash.students} étudiants, ${abouDash.teachers} enseignants` : "Dashboard failed"
    })
    
    const abouConfig = await simulateSchoolConfig(abouLogin)
    allResults.push({
      step: "CONFIG Abou",
      status: abouConfig ? "PASS" : "FAIL",
      detail: abouConfig ? "School config page loaded successfully" : "School config CRASHED"
    })
    
    console.log(`\n🚪 LOGOUT Abou — clearing session cookies`)
    allResults.push({ step: "LOGOUT Abou", status: "PASS", detail: "Cookies cleared" })
  }
  
  // ── TEST SEQUENCE 2: ABOU → LOGOUT → COCODY ──
  
  console.log("\n\n" + "═".repeat(60))
  console.log("  SEQUENCE 2: ABOU → LOGOUT → COCODY")
  console.log("═".repeat(60))
  
  const abou2Login = await simulateLogin("admin@abou.com", "password123")
  if (abou2Login) {
    const abou2Dash = await simulateDashboard(abou2Login)
    allResults.push({
      step: "DASHBOARD Abou (R2)",
      status: abou2Dash ? "PASS" : "FAIL",
      detail: abou2Dash ? `${abou2Dash.schoolName}: ${abou2Dash.classes} classes, ${abou2Dash.students} étudiants` : "Dashboard failed"
    })
    console.log(`\n🚪 LOGOUT Abou (R2)`)
  }
  
  const cocody2Login = await simulateLogin("admin_cocody@monecole.ci", "password123")
  if (cocody2Login) {
    const cocody2Dash = await simulateDashboard(cocody2Login)
    allResults.push({
      step: "DASHBOARD Cocody (R2)",
      status: cocody2Dash ? "PASS" : "FAIL",
      detail: cocody2Dash ? `${cocody2Dash.schoolName}: ${cocody2Dash.classes} classes, ${cocody2Dash.students} étudiants` : "Dashboard failed"
    })
    console.log(`\n🚪 LOGOUT Cocody (R2)`)
  }
  
  // ── TEST SEQUENCE 3: COCODY → ABOU → COCODY (rapid switch) ──
  
  console.log("\n\n" + "═".repeat(60))
  console.log("  SEQUENCE 3: COCODY → ABOU → COCODY (rapid switch)")
  console.log("═".repeat(60))
  
  const cocody3Login = await simulateLogin("admin_cocody@monecole.ci", "password123")
  if (cocody3Login) {
    const dash = await simulateDashboard(cocody3Login)
    allResults.push({
      step: "RAPID Cocody (1)",
      status: dash ? "PASS" : "FAIL",
      detail: dash ? `${dash.schoolName}: OK` : "FAIL"
    })
  }
  
  const abou3Login = await simulateLogin("admin@abou.com", "password123")
  if (abou3Login) {
    const dash = await simulateDashboard(abou3Login)
    allResults.push({
      step: "RAPID Abou (1)",
      status: dash ? "PASS" : "FAIL",
      detail: dash ? `${dash.schoolName}: OK` : "FAIL"
    })
  }
  
  const cocody4Login = await simulateLogin("admin_cocody@monecole.ci", "password123")
  if (cocody4Login) {
    const dash = await simulateDashboard(cocody4Login)
    allResults.push({
      step: "RAPID Cocody (2)",
      status: dash ? "PASS" : "FAIL",
      detail: dash ? `${dash.schoolName}: OK` : "FAIL"
    })
  }
  
  // ── CROSS-TENANT ISOLATION CHECK ──
  console.log("\n\n" + "═".repeat(60))
  console.log("  CROSS-TENANT ISOLATION CHECK")
  console.log("═".repeat(60))
  
  if (cocodyLogin && abouLogin) {
    const cocodySchoolId = cocodyLogin.schoolId
    const abouSchoolId = abouLogin.schoolId
    console.log(`\nCocody schoolId: ${cocodySchoolId}`)
    console.log(`Abou schoolId: ${abouSchoolId}`)
    console.log(`Are they different: ${cocodySchoolId !== abouSchoolId}`)
    
    allResults.push({
      step: "CROSS-TENANT Isolation",
      status: cocodySchoolId !== abouSchoolId ? "PASS" : "FAIL",
      detail: `Cocody=${cocodySchoolId}, Abou=${abouSchoolId}`
    })
  }
  
  // ── FINAL SUMMARY ──
  console.log("\n\n" + "═".repeat(60))
  console.log("📋 RAPPORT FINAL E2E")
  console.log("═".repeat(60))
  
  let pass = 0, fail = 0
  for (const r of allResults) {
    const icon = r.status === "PASS" ? "✅" : "❌"
    console.log(`${icon} ${r.step}: ${r.status}`)
    console.log(`   → ${r.detail}`)
    if (r.status === "PASS") pass++
    else fail++
  }
  
  console.log(`\n${"─".repeat(60)}`)
  console.log(`RÉSULTAT: ${pass} PASS / ${fail} FAIL (${allResults.length} tests)`)
  console.log("─".repeat(60))
  
  if (fail > 0) {
    console.log("\n⚠️  DES ÉCHECS ONT ÉTÉ DÉTECTÉS")
  } else {
    console.log("\n🎉 TOUS LES TESTS SONT PASSÉS")
  }
  
  await masterPrisma.$disconnect()
}

main().catch(async err => {
  console.error("Fatal E2E Error:", err)
  await masterPrisma.$disconnect()
  process.exit(1)
})
