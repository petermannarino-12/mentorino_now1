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

  const pool = new pg.default.Pool({
    connectionString: url,
    max: 3,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
  })
  const adapter = new PrismaPg(pool)
  _prisma = new PrismaClient({ adapter, errorFormat: 'minimal', log: [] })

  try {
    await _prisma.$connect()
  } catch (err) {
    _prisma = null
    pool.end().catch(() => {})
    throw err
  }

  return _prisma
}
