
const { PrismaClient } = require('@prisma/client');

async function checkUsers() {
  const prisma = new PrismaClient();
  try {
    const users = await prisma.user.findMany();
    console.log("Users in Master DB:", users.map(u => ({ email: u.email, role: u.role })));
    
    const schools = await prisma.ecoles.findMany();
    console.log("Schools in Master DB:", schools);
  } catch (error) {
    console.error("Error checking users:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
