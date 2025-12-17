const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.masterClassRegistration.deleteMany({});
    console.log('Deleted successfully');
  } catch (error) {
    console.error('Error clearing table:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
