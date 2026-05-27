let _prisma: any = null;

export async function getPrisma() {
  if (_prisma) return _prisma;
  if (!process.env.DATABASE_URL) {
    throw new Error('Missing DATABASE_URL env var');
  }
  const { PrismaClient } = await import('../../src/generated/prisma');
  _prisma = new (PrismaClient as any)({
    datasourceUrl: process.env.DATABASE_URL,
  });
  return _prisma;
}
