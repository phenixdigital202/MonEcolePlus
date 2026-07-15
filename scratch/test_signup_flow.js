
const { registerUser } = require('../lib/auth-actions');

async function testSignup() {
  const formData = new FormData();
  formData.append("firstName", "Test");
  formData.append("lastName", "User");
  formData.append("email", `test${Date.now()}@school.com`);
  formData.append("password", "password123");
  formData.append("role", "admin");
  formData.append("school", "Test School " + Date.now());

  console.log("Starting signup test...");
  try {
    const result = await registerUser(formData);
    console.log("Signup Result:", result);
  } catch (error) {
    console.error("Signup failed with exception:", error);
  }
}

// Mock FormData since it's not global in Node < 18 or specific environments
if (typeof FormData === 'undefined') {
    global.FormData = require('form-data');
}

testSignup();
