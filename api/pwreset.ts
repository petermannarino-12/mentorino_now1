export const config = { runtime: 'nodejs' }

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()
    if (!token || !password) {
      return Response.json({ error: 'Missing token or password' }, { status: 400 })
    }

    if (password.length < 6) {
      return Response.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const crypto = await import('node:crypto')
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    const { getPrisma } = await import('./prisma.js')
    const prisma = await getPrisma()

    const rows: any[] = await prisma.$queryRawUnsafe(
      'SELECT id, email, expires_at, used FROM public.password_reset_tokens WHERE token = $1 LIMIT 1',
      hashedToken
    )

    const row = rows?.[0]
    if (!row) {
      return Response.json({ error: 'Invalid or expired reset link' }, { status: 400 })
    }

    if (row.used) {
      return Response.json({ error: 'This reset link has already been used' }, { status: 400 })
    }

    if (new Date(row.expires_at) < new Date()) {
      return Response.json({ error: 'This reset link has expired' }, { status: 400 })
    }

    const { getAuth } = await import('./auth.js')
    const supabaseAdmin = await getAuth()

    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    if (listError) throw listError

    const user = users?.users?.find((u: any) => u.email === row.email)
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, { password })
    if (updateError) throw updateError

    await prisma.$executeRawUnsafe(
      'UPDATE public.password_reset_tokens SET used = TRUE WHERE id = $1',
      row.id
    )

    return Response.json({ message: 'Password updated successfully' })
  } catch (error: any) {
    console.error('reset-password error:', error)
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
