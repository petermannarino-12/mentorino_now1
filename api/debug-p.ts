export async function GET() {
  try {
    const { getPrisma } = await import('./prisma')
    await (await getPrisma()).$connect()
    return Response.json({ ok: true })
  } catch (err: any) {
    return Response.json({ error: err?.message || String(err), stack: err?.stack?.split('\n')?.slice(0, 6)?.join('\n') }, { status: 500 })
  }
}
