
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function debugLogin() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: "mysql://root:@127.0.0.1:3306/monecole"
      }
    }
  });

  try {
    console.log("Checking database connection...");
    await prisma.$connect();
    console.log("Database connected successfully.");

    const email = "admin@example.com"; // Change if you know a user email
    console.log(`Searching for user with email: ${email}`);
    
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log("User not found in Master DB.");
      
      // List schools to see if we should be on a subdomain
      const schools = await prisma.ecole.findMany();
      console.log("Schools in Master DB:", schools);
      
      return;
    }

    console.log("User found:", { id: user.id, email: user.email, role: user.role });
    
  } catch (error) {
    console.error("Error during debugLogin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

debugLogin();
