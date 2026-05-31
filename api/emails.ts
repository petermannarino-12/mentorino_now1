import { getPrisma } from './prisma.js';
import { getUserFromToken } from './auth.js';
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
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await (await getPrisma()).$executeRawUnsafe(
      'INSERT INTO public.password_reset_tokens (email, token, expires_at) VALUES ($1, $2, $3)',
      normalizedEmail, hashedToken, expiresAt
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

async function handleRequestAccess(request: Request) {
  try {
    const user = await getUserFromToken(request);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { product_id, product_name, message } = await request.json();
    if (!product_id || !product_name) {
      return Response.json({ error: 'Missing product_id or product_name' }, { status: 400 });
    }

    const existing = await (await getPrisma()).$queryRawUnsafe(
      `SELECT id FROM public.product_access_requests
       WHERE student_id = $1 AND product_id = $2 AND status = 'pending'
       LIMIT 1`,
      user.id, product_id
    );
    if ((existing as any[]).length > 0) {
      return Response.json({ error: 'You already have a pending request for this product' }, { status: 409 });
    }

    await (await getPrisma()).$executeRawUnsafe(
      `INSERT INTO public.product_access_requests (student_id, student_name, student_email, product_id, product_name, message)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      user.id, user.user_metadata?.full_name || 'Student', user.email!, product_id, product_name, message || null
    );

    return Response.json({ message: 'Access request sent' });
  } catch (error: any) {
    console.error('request-access error:', error);
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

async function handleGrantAccess(request: Request) {
  try {
    const user = await getUserFromToken(request);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const profile = await (await getPrisma()).profiles.findUnique({
      where: { id: user.id },
      select: { role: true },
    });
    if (!profile || !['admin', 'mentor'].includes(profile.role!)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { request_id, action, mentor_notes } = await request.json();
    if (!request_id || !['grant', 'deny'].includes(action)) {
      return Response.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    if (action === 'grant') {
      await (await getPrisma()).$executeRawUnsafe(
        `UPDATE public.product_access_requests
         SET status = 'granted', mentor_notes = $2, granted_at = NOW()
         WHERE id = $1`,
        request_id, mentor_notes || null
      );
    } else {
      await (await getPrisma()).$executeRawUnsafe(
        `UPDATE public.product_access_requests
         SET status = 'denied', mentor_notes = $2
         WHERE id = $1`,
        request_id, mentor_notes || null
      );
    }

    return Response.json({ message: `Access ${action === 'grant' ? 'granted' : 'denied'}` });
  } catch (error: any) {
    console.error('grant-access error:', error);
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

async function handleListRequests(request: Request) {
  try {
    const user = await getUserFromToken(request);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const profile = await (await getPrisma()).profiles.findUnique({
      where: { id: user.id },
      select: { role: true },
    });
    if (!profile || !['admin', 'mentor'].includes(profile.role!)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const url = new URL(request.url);
    const statusFilter = url.searchParams.get('status');
    let sql = 'SELECT * FROM public.product_access_requests';
    const params: any[] = [];

    if (statusFilter && ['pending', 'granted', 'denied'].includes(statusFilter)) {
      sql += ' WHERE status = $1';
      params.push(statusFilter);
    }
    sql += ' ORDER BY created_at DESC';

    const rows = await (await getPrisma()).$queryRawUnsafe(sql, ...params);
    return Response.json({ requests: rows });
  } catch (error: any) {
    console.error('list-requests error:', error);
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

async function handleMyAccess(request: Request) {
  try {
    const user = await getUserFromToken(request);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const rows = await (await getPrisma()).$queryRawUnsafe(
      `SELECT product_id FROM public.product_access_requests
       WHERE student_id = $1 AND status = 'granted'`,
      user.id
    );

    const productIds = (rows as any[]).map(r => r.product_id);
    return Response.json({ products: productIds });
  } catch (error: any) {
    console.error('my-access error:', error);
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

async function handleSendMessage(request: Request) {
  try {
    const user = await getUserFromToken(request);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { receiver_id, content } = await request.json();
    if (!receiver_id || !content) {
      return Response.json({ error: 'Missing receiver_id or content' }, { status: 400 });
    }

    await (await getPrisma()).$executeRawUnsafe(
      `INSERT INTO public.messages (sender_id, receiver_id, content) VALUES ($1, $2, $3)`,
      user.id, receiver_id, content.trim().slice(0, 5000)
    );

    return Response.json({ message: 'Message sent' });
  } catch (error: any) {
    console.error('send-message error:', error);
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

async function handleGetConversation(request: Request) {
  try {
    const user = await getUserFromToken(request);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const url = new URL(request.url);
    const withUserId = url.searchParams.get('with');
    if (!withUserId) return Response.json({ error: 'Missing "with" param' }, { status: 400 });

    const rows = await (await getPrisma()).$queryRawUnsafe(
      `SELECT id, sender_id, receiver_id, content, read, created_at
       FROM public.messages
       WHERE (sender_id = $1 AND receiver_id = $2)
          OR (sender_id = $2 AND receiver_id = $1)
       ORDER BY created_at ASC`,
      user.id, withUserId
    );

    return Response.json({ messages: rows });
  } catch (error: any) {
    console.error('get-conversation error:', error);
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

async function handleGetConversations(request: Request) {
  try {
    const user = await getUserFromToken(request);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const rows = await (await getPrisma()).$queryRawUnsafe(
      `SELECT
         CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END AS other_user_id,
         MAX(created_at) AS last_message_at,
         (SELECT content FROM public.messages
          WHERE (sender_id = $1 AND receiver_id = CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END)
             OR (receiver_id = $1 AND sender_id = CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END)
          ORDER BY created_at DESC LIMIT 1) AS last_message,
         (SELECT COUNT(*) FROM public.messages
          WHERE receiver_id = $1 AND sender_id = CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END AND read = false) AS unread
       FROM public.messages
       WHERE sender_id = $1 OR receiver_id = $1
       GROUP BY other_user_id
       ORDER BY last_message_at DESC`,
      user.id
    );

    return Response.json({ conversations: rows });
  } catch (error: any) {
    console.error('get-conversations error:', error);
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

async function handleMarkRead(request: Request) {
  try {
    const user = await getUserFromToken(request);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { from_user_id } = await request.json();
    if (!from_user_id) return Response.json({ error: 'Missing from_user_id' }, { status: 400 });

    await (await getPrisma()).$executeRawUnsafe(
      `UPDATE public.messages SET read = true WHERE receiver_id = $1 AND sender_id = $2 AND read = false`,
      user.id, from_user_id
    );

    return Response.json({ message: 'Messages marked as read' });
  } catch (error: any) {
    console.error('mark-read error:', error);
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
    case "request-access": return handleRequestAccess(request);
    case "grant-access": return handleGrantAccess(request);
    case "list-requests": return handleListRequests(request);
    case "my-access": return handleMyAccess(request);
    case "send-message": return handleSendMessage(request);
    case "get-conversation": return handleGetConversation(request);
    case "get-conversations": return handleGetConversations(request);
    case "mark-read": return handleMarkRead(request);
    default: return null;
  }
}

export async function POST(request: Request) {
  const from = new URL(request.url).searchParams.get("from");
  const handler = router(from, request);
  if (handler) return handler;
  return Response.json({ error: "Not found" }, { status: 404 });
}

export async function GET(request: Request) {
  const from = new URL(request.url).searchParams.get("from");
  const handler = router(from, request);
  if (handler) return handler;
  return Response.json({ error: "Not found" }, { status: 404 });
}
