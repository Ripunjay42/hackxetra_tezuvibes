const { PrismaClient } = require('@prisma/client');

const prismaClientSingleton = () => {
  return new PrismaClient();
};

// Declare a global variable to hold the Prisma client instance
global.prismaGlobal = global.prismaGlobal || undefined;

const prisma = global.prismaGlobal || prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  global.prismaGlobal = prisma;
}

module.exports = prisma;
