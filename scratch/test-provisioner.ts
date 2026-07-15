import { provisionTenantDatabase } from "../lib/db-provisioner"

async function test() {
  console.log("Starting provisioning test...")
  const result = await provisionTenantDatabase("monecole_test_academy_debug")
  console.log("Result:", result)
  process.exit(result.success ? 0 : 1)
}

test().catch(err => {
  console.error("Test failed with error:", err)
  process.exit(1)
})
