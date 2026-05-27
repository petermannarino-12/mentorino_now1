import { PrismaClient } from '../../src/generated/prisma'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function getClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error('Missing DATABASE_URL env var');
  }
  return new (PrismaClient as any)({
    datasourceUrl: process.env.DATABASE_URL,
  })
}

export function getPrisma() {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = getClient();
  }
  return globalForPrisma.prisma;
}
