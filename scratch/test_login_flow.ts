import { loginUser } from "../lib/auth-actions"
import { cookies } from "next/headers"

// We will run this within a NextJS environment context, or we can mock/evaluate the loginUser output directly.
// Let's create a test function that calls loginUser with the admin credentials.
async function test() {
  const formData = new FormData()
  formData.append("email", "admin@phenixdigital.ci")
  formData.append("password", "supersecuresaas123")
  
  console.log("Calling loginUser...")
  const res = await loginUser(formData)
  console.log("Result:", res)
}

test().catch(console.error)
