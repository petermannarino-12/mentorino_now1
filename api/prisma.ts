import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

let _prisma: PrismaClient | null = null

export async function getPrisma() {
  if (_prisma) return _prisma
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('Missing DATABASE_URL env var')
  }
  const pool = new pg.Pool({ connectionString: url })
  const adapter = new PrismaPg(pool)
  _prisma = new PrismaClient({ adapter })
  await _prisma.$connect()
  return _prisma
}
