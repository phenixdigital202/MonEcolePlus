import { registerUser } from "../lib/auth-actions";

async function testRegister() {
  const timestamp = Date.now().toString().slice(-4);
  const formData = new FormData();
  formData.append("firstName", "Audit");
  formData.append("lastName", "Tester");
  formData.append("school", `Lycée Audit Test ${timestamp}`);
  formData.append("email", `audit_test_${timestamp}@monecole.ci`);
  formData.append("password", "Password123!");
  formData.append("role", "admin");

  console.log("[TestRegister] Calling registerUser...");
  const start = Date.now();
  try {
    const result = await registerUser(formData);
    console.log(`[TestRegister] Completed in ${Date.now() - start}ms. Result:`, result);
  } catch (err: any) {
    console.error(`[TestRegister] Exception after ${Date.now() - start}ms:`, err);
  }
  process.exit(0);
}

testRegister();
