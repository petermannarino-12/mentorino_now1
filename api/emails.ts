import { getPrisma } from './prisma.js';
const FROM_EMAIL = process.env.SENDER_EMAIL || 'admissions@mentorino.me';
const SITE_URL = process.env.SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : process.env.URL) || 'http://localhost:3000';

async function handleBookingConfirmation(request: Request) {
  try {
    const { booking } = await request.json();
    if (!booking || !booking.user_email) {
      return Response.json({ error: "Invalid booking data" }, { status: 400 });
    }
    const email = booking.user_email.toLowerCase().trim();
    const userName = booking.user_name || 'Mentee';

    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        const template = await (await getPrisma()).email_templates.findUnique({
          where: { id: 'booking_confirmed' },
        });
        if (!template) console.error('Template not found: booking_confirmed');

        const subject = template?.subject || 'Session Confirmed - Mentorino';
        let body = template?.body || `Hi {{student_name}},<br><br>Your mentorship session has been confirmed.<br><br><strong>Date:</strong> {{session_date}}<br><strong>Time:</strong> {{session_time}}<br><br>Please log in to your portal to join the session at the scheduled time.<br><br>Best,<br>Mentorino Team`;
        body = body
          .replace(/{{student_name}}/g, userName)
          .replace(/{{session_date}}/g, booking.date || '')
          .replace(/{{session_time}}/g, booking.time || '')
          .replace(/{{login_url}}/g, `${SITE_URL}/dashboard`)

        body = body.replace(/\\n/g, '\n').replace(/\n/g, '<br>');

        await resend.emails.send({
          from: `Mentorino <${FROM_EMAIL}>`,
          to: email,
          subject: `Mentorino — ${subject}`,
          html: `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;background:#fff;color:#1a1a1a"><div style="width:40px;height:40px;background:#000;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:20px;margin-bottom:32px">M</div>${body}<hr style="border:none;border-top:1px solid #eee;margin:32px 0"><p style="font-size:11px;color:#999">Mentorino — mentorship, redefined.</p></div>`,
        });
      } catch (emailError) {
        console.error("Email send error:", emailError);
      }
    }

    return Response.json({ message: "Booking confirmation sent" });
  } catch (error: any) {
    console.error("Booking Email Error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function handleSendPasswordReset(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) return Response.json({ error: 'Missing email' }, { status: 400 });
    const normalizedEmail = email.toLowerCase().trim();

    const crypto = await import('node:crypto');
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await (await getPrisma()).$executeRawUnsafe(
      'INSERT INTO public.password_reset_tokens (email, token, expires_at) VALUES ($1, $2, $3)',
      normalizedEmail, token, expiresAt
    );

    const resetLink = `${SITE_URL}/reset-password?token=${token}`;

    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      const html = `<p>Hi,</p><p>You requested a password reset. Click the button below to set a new password:</p><p><a href="${resetLink}" style="display:inline-block;background:#000;color:#fff;text-decoration:none;padding:14px 32px;border-radius:999px;font-weight:600;font-size:14px;margin:16px 0">Reset Password</a></p><p>Or copy this link into your browser:</p><p style="font-size:12px;color:#666;word-break:break-all">${resetLink}</p><p>This link expires in 1 hour.</p><p>If you didn't request this, you can ignore this email.</p><p>Best,<br>Mentorino Team</p>`;

      await resend.emails.send({
        from: `Mentorino <${FROM_EMAIL}>`,
        to: normalizedEmail,
        subject: 'Mentorino — Reset your password',
        html: `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;background:#fff;color:#1a1a1a"><div style="width:40px;height:40px;background:#000;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:20px;margin-bottom:32px">M</div>${html}<hr style="border:none;border-top:1px solid #eee;margin:32px 0"><p style="font-size:11px;color:#999">Mentorino — mentorship, redefined.</p></div>`,
      });
    }

    return Response.json({ message: 'Password reset email sent' });
  } catch (error: any) {
    console.error('send-password-reset error:', error);
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

async function handleWelcome(request: Request) {
  try {
    const { email, name } = await request.json();
    if (!email) return Response.json({ error: "Missing email" }, { status: 400 });
    const normalizedEmail = email.toLowerCase().trim();
    const userName = name || 'Member';

    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        const template = await (await getPrisma()).email_templates.findUnique({
          where: { id: 'welcome_email' },
        });
        if (!template) console.error('Template not found: welcome_email');

        const subject = template?.subject || 'Welcome to Mentorino!';
        let body = template?.body || `Hi {{student_name}},<br><br>Welcome to Mentorino! Your account has been created successfully.<br><br>You can now log in and access your dashboard to manage your mentorship journey.<br><br>Click here to log in: {{login_url}}<br><br>Best,<br>Mentorino Team`;
        body = body
          .replace(/{{student_name}}/g, userName)
          .replace(/{{login_url}}/g, `${SITE_URL}/auth`)

        // Convert both literal \n and actual newlines to <br>
        body = body.replace(/\\n/g, '\n').replace(/\n/g, '<br>');

        await resend.emails.send({
          from: `Mentorino <${FROM_EMAIL}>`,
          to: normalizedEmail,
          subject: `Mentorino — ${subject}`,
          html: `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;background:#fff;color:#1a1a1a"><div style="width:40px;height:40px;background:#000;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:20px;margin-bottom:32px">M</div>${body}<hr style="border:none;border-top:1px solid #eee;margin:32px 0"><p style="font-size:11px;color:#999">Mentorino — mentorship, redefined.</p></div>`,
        });
      } catch (emailError) {
        console.error("Email send error:", emailError);
      }
    }

    return Response.json({ message: "Welcome email sent" });
  } catch (error: any) {
    console.error("Welcome Email Error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

function router(from: string | null, request: Request): Promise<Response> | null {
  switch (from) {
    case "send-booking-confirmation": return handleBookingConfirmation(request);
    case "send-welcome-email": return handleWelcome(request);
    case "send-password-reset": return handleSendPasswordReset(request);
    default: return null;
  }
}

export async function POST(request: Request) {
  const from = new URL(request.url).searchParams.get("from");
  const handler = router(from, request);
  if (handler) return handler;
  return Response.json({ error: "Not found" }, { status: 404 });
}
