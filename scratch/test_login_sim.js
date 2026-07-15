
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function testLoginSimulation() {
  const prisma = new PrismaClient();
  const email = "admin@monecole.com";
  const password = "any-password";

  try {
    console.log(`Simulating login for ${email}...`);
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log("User not found.");
      return;
    }

    console.log("User found, checking password...");
    // This will likely return false but shouldn't throw
    const match = await bcrypt.compare(password, user.password);
    console.log("Password match result:", match);
    
  } catch (error) {
    console.error("Simulation error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testLoginSimulation();
