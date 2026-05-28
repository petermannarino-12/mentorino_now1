export const config = { runtime: 'nodejs20.x' }

const SITE_URL = process.env.SITE_URL || `https://${process.env.VERCEL_URL}` || process.env.URL || 'http://localhost:3000'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    if (!email) {
      return Response.json({ error: 'Missing email' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    const { getPrisma } = await import('./prisma.js')
    const prisma = await getPrisma()

    const crypto = await import('node:crypto')
    const token = crypto.default.randomBytes(32).toString('hex')

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    await prisma.$executeRawUnsafe(
      'INSERT INTO public.password_reset_tokens (email, token, expires_at) VALUES ($1, $2, $3)',
      normalizedEmail, token, expiresAt
    )

    const resetLink = `${SITE_URL}/reset-password?token=${token}`

    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)

      const subject = 'Reset your Mentorino password'
      const body = `
        <p>Hi,</p>
        <p>You requested a password reset. Click the link below to set a new password:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, you can ignore this email.</p>
        <p>Best,<br>Mentorino Team</p>
      `

      await resend.emails.send({
        from: `Mentorino <${process.env.SENDER_EMAIL || 'admissions@mentorino.me'}>`,
        to: normalizedEmail,
        subject,
        html: body,
      })
    } else {
      console.warn('RESEND_API_KEY not set — cannot send email')
    }

    return Response.json({ message: 'Password reset email sent' })
  } catch (error: any) {
    console.error('send-password-reset error:', error)
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
