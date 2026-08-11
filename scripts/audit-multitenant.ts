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
let hasProductionViolation = false

function scanDirectory(dir: string, isProduction: boolean) {
  if (!fs.existsSync(dir)) return

  const files = fs.readdirSync(dir)
  for (const file of files) {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      scanDirectory(fullPath, isProduction)
    } else if (file.endsWith(".ts") || file.endsWith(".tsx")) {
      const content = fs.readFileSync(fullPath, "utf8")
      FORBIDDEN.forEach((regex) => {
        if (regex.test(content)) {
          if (isProduction) {
            console.error(`❌ [PRODUCTION VIOLATION] Hardcoded tenant reference found in: ${fullPath} (Pattern: ${regex})`)
            hasProductionViolation = true
          } else {
            console.warn(`⚠️ [TEST/SCRIPT REFERENCE] Reference found in script: ${fullPath} (Pattern: ${regex})`)
          }
        }
      })
    }
  }
}

console.log("🔍 [Multi-Tenant Guard] Starting scan of production codebase...")
TARGET_DIRECTORIES.forEach(dir => scanDirectory(path.join(process.cwd(), dir), true))

console.log("\n🔍 [Multi-Tenant Guard] Scanning scripts and test directory (warnings only)...")
scanDirectory(path.join(process.cwd(), "scripts"), false)

if (hasProductionViolation) {
  console.error("\n❌ [Multi-Tenant Guard] Failed: Production code contains forbidden hardcoded tenant references.")
  process.exit(1)
} else {
  console.log("\n✅ [Multi-Tenant Guard] Passed successfully. No production violations found.")
  process.exit(0)
}
