let _prisma: any = null

export async function getPrisma() {
  if (_prisma) return _prisma
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('Missing DATABASE_URL env var')
  }

  const { PrismaClient } = await import('@prisma/client')
  const { PrismaPg } = await import('@prisma/adapter-pg')
  const pg = await import('pg')

  const pool = new pg.default.Pool({ connectionString: url })
  const adapter = new PrismaPg(pool)
  _prisma = new PrismaClient({ adapter })
  await _prisma.$connect()
  return _prisma
}
