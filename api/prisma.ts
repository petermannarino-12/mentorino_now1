import { PrismaClient } from '../src/generated/prisma/index.js'

let _prisma: PrismaClient | null = null

export async function getPrisma() {
  if (_prisma) return _prisma
  if (!process.env.DATABASE_URL) {
    throw new Error('Missing DATABASE_URL env var')
  }
  _prisma = new PrismaClient()
  await _prisma.$connect()
  return _prisma
}
