import fs from "fs"
import path from "path"

const FORBIDDEN = [
  /id_ecole:\s*9/,
  /id_ecole\s*===\s*9/,
  /id_ecole\s*==\s*9/,
  /id_ecole\s*=\s*9/,
  /school_id:\s*9/,
  /school_id\s*=\s*9/,
  /schoolId:\s*9/,
  /schoolId\s*=\s*9/,
  /tenantId:\s*9/,
  /tenantId\s*=\s*9/,
  /"Lycée Moderne de Cocody"/,
  /"Lycée Moderne de Cocody - UAT"/,
  /tenant_cocody/
]

const TARGET_DIRECTORIES = ["app", "components", "lib"]
let productionViolations: string[] = []
let scriptWarnings: string[] = []

function scanDirectory(dir: string, isProduction: boolean) {
  if (!fs.existsSync(dir)) return

  const files = fs.readdirSync(dir)
  for (const file of files) {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      scanDirectory(fullPath, isProduction)
    } else if (file.endsWith(".ts") || file.endsWith(".tsx") || file.endsWith(".js")) {
      const content = fs.readFileSync(fullPath, "utf8")
      FORBIDDEN.forEach((regex) => {
        if (regex.test(content)) {
          // Exclude self reference to avoid false positive in the guard itself
          if (file === "audit-multitenant.ts") return

          const relativePath = path.relative(process.cwd(), fullPath)
          if (isProduction) {
            productionViolations.push(`- ${relativePath} (Pattern: ${regex})`)
          } else {
            scriptWarnings.push(`- ${relativePath} (Pattern: ${regex})`)
          }
        }
      })
    }
  }
}

console.log("🔍 [Multi-Tenant Guard] Starting scan of codebase...")
TARGET_DIRECTORIES.forEach(dir => scanDirectory(path.join(process.cwd(), dir), true))
scanDirectory(path.join(process.cwd(), "scripts"), false)

console.log("\n=== MULTI-TENANT GUARD ===")

console.log("\nPRODUCTION:")
if (productionViolations.length === 0) {
  console.log("✅ No hardcoded tenant detected.")
} else {
  console.log("❌ Production violations found:")
  productionViolations.forEach(v => console.error(v))
}

console.log("\nSCRIPTS / TESTS:")
if (scriptWarnings.length === 0) {
  console.log("✅ No tenant references found in scripts or tests.")
} else {
  console.log(`⚠️ ${scriptWarnings.length} references found in test/maintenance scripts.`)
  console.log("ℹ️ These references are allowed because they are outside production runtime.")
}

console.log("\nCRITICAL:")
console.log(`❌ ${productionViolations.length} production violations.`)

console.log("\nFINAL:")
if (productionViolations.length === 0) {
  console.log("✅ PASS")
  process.exit(0)
} else {
  console.log("❌ FAIL")
  process.exit(1)
}
