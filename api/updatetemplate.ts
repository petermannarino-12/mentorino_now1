export async function GET() {
  try {
    const { getPrisma } = await import('./prisma.js')
    const prisma = await getPrisma()

    await prisma.$executeRawUnsafe(
      `UPDATE public.email_templates
       SET body = $1
       WHERE id = 'welcome_email'`,
      `Hi {{student_name}},

Welcome to Mentorino! Your account has been created successfully.

You can now log in and access your dashboard to manage your mentorship journey.

{{login_url}}

Best,
Mentorino Team`
    )

    return Response.json({ success: true, message: 'Template updated' })
  } catch (e: any) {
    return Response.json({ success: false, error: e.message })
  }
}
