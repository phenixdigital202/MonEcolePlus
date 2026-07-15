import { registerUser } from "../lib/auth-actions"

async function debugSignup() {
  const formData = new FormData()
  formData.append("firstName", "Debug")
  formData.append("lastName", "User")
  formData.append("email", `debug_${Date.now()}@test.com`)
  formData.append("password", "password123")
  formData.append("school", "Debug Academy")
  formData.append("role", "admin")

  console.log("Starting debug signup simulation...")
  try {
    const result = await registerUser(formData)
    console.log("Signup result:", result)
  } catch (err) {
    console.error("CRITICAL ERROR during signup simulation:", err)
  }
}

debugSignup().then(() => process.exit(0))
