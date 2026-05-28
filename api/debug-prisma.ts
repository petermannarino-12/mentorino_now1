export async function GET() {
  const steps: string[] = []
  try {
    steps.push('start')

    const { PrismaClient } = await import('@prisma/client')
    steps.push('PrismaClient imported')

    const { PrismaPg } = await import('@prisma/adapter-pg')
    steps.push('PrismaPg imported')

    const pg = await import('pg')
    steps.push('pg imported')

    const url = process.env.DATABASE_URL
    if (!url) {
      steps.push('no DATABASE_URL')
      return Response.json({ steps, error: 'DATABASE_URL not set' }, { status: 500 })
    }
    steps.push('DATABASE_URL found')

    const pool = new pg.default.Pool({ connectionString: url })
    steps.push('Pool created')

    const adapter = new PrismaPg(pool)
    steps.push('adapter created')

    const client = new PrismaClient({ adapter })
    steps.push('PrismaClient created')

    await client.$connect()
    steps.push('connected')

    return Response.json({ steps, ok: true })
  } catch (err: any) {
    return Response.json({ steps, error: err?.message || String(err), stack: err?.stack?.split('\n')?.slice(0, 6)?.join('\n') }, { status: 500 })
  }
}
