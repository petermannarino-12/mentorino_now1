import { getAuth, getUserFromToken } from './auth.js';
import { captureException } from './sentry.js';
const FROM_EMAIL = process.env.SENDER_EMAIL || 'peter@mentorino.me';
const SITE_URL = process.env.SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : process.env.URL) || 'http://localhost:3000';

async function handleBookingConfirmation(request: Request) {
  try {
    const supabase = await getAuth();
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
        const { data: template } = await supabase.from('email_templates').select('subject, body').eq('id', 'booking_confirmed').maybeSingle();
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
          bcc: process.env.ADMIN_EMAIL || 'peter@mentorino.me',
          subject: `Mentorino — ${subject}`,
          html: `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;background:#fff;color:#1a1a1a"><div style="width:40px;height:40px;background:#000;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:20px;margin-bottom:32px">M</div>${body}<hr style="border:none;border-top:1px solid #eee;margin:32px 0"><p style="font-size:11px;color:#999">Mentorino — mentorship, redefined.</p></div>`,
        });
      } catch (emailError) {
        console.error("Email send error:", emailError);
      }
    }

    return Response.json({ message: "Booking confirmation sent" });
  } catch (error: any) {
    captureException(error, { handler: 'handleBookingConfirmation' });
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
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    const supabase = await getAuth();
    const { error: insertError } = await supabase.from('password_reset_tokens').insert({
      email: normalizedEmail,
      token: hashedToken,
      expires_at: expiresAt,
    });
    if (insertError) throw insertError;

    const resetLink = `${SITE_URL}/reset-password?token=${token}`;

    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      const html = `<p>Hi,</p><p>You requested a password reset. Click the button below to set a new password:</p><p><a href="${resetLink}" style="display:inline-block;background:#000;color:#fff;text-decoration:none;padding:14px 32px;border-radius:999px;font-weight:600;font-size:14px;margin:16px 0">Reset Password</a></p><p>Or copy this link into your browser:</p><p style="font-size:12px;color:#666;word-break:break-all">${resetLink}</p><p>This link expires in 1 hour.</p><p>If you didn't request this, you can ignore this email.</p><p>Best,<br>Mentorino Team</p>`;

      await resend.emails.send({
        from: `Mentorino <${FROM_EMAIL}>`,
        to: normalizedEmail,
        bcc: process.env.ADMIN_EMAIL || 'peter@mentorino.me',
        subject: 'Mentorino — Reset your password',
        html: `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;background:#fff;color:#1a1a1a"><div style="width:40px;height:40px;background:#000;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:20px;margin-bottom:32px">M</div>${html}<hr style="border:none;border-top:1px solid #eee;margin:32px 0"><p style="font-size:11px;color:#999">Mentorino — mentorship, redefined.</p></div>`,
      });
    }

    return Response.json({ message: 'Password reset email sent' });
  } catch (error: any) {
    captureException(error, { handler: 'handleSendPasswordReset' });
    console.error('send-password-reset error:', error);
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

async function handleRequestAccess(request: Request) {
  try {
    const supabase = await getAuth();
    const user = await getUserFromToken(request);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { product_id, product_name, message } = await request.json();
    if (!product_id || !product_name) {
      return Response.json({ error: 'Missing product_id or product_name' }, { status: 400 });
    }

    const { data: existing } = await supabase.from('product_access_requests')
      .select('id').eq('student_id', user.id).eq('product_id', product_id).eq('status', 'pending').maybeSingle();
    if (existing) {
      return Response.json({ error: 'You already have a pending request for this product' }, { status: 409 });
    }

    const { error: insertError } = await supabase.from('product_access_requests').insert({
      student_id: user.id,
      student_name: user.user_metadata?.full_name || 'Student',
      student_email: user.email,
      product_id,
      product_name,
      message: message || null,
    });
    if (insertError) throw insertError;

    return Response.json({ message: 'Access request sent' });
  } catch (error: any) {
    captureException(error, { handler: 'handleRequestAccess' });
    console.error('request-access error:', error);
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

async function handleGrantAccess(request: Request) {
  try {
    const supabase = await getAuth();
    const user = await getUserFromToken(request);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
    if (!profile || !['admin', 'mentor'].includes(profile.role!)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { request_id, action, mentor_notes } = await request.json();
    if (!request_id || !['grant', 'deny'].includes(action)) {
      return Response.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const updateData: Record<string, any> = { status: action === 'grant' ? 'granted' : 'denied', mentor_notes: mentor_notes || null };
    if (action === 'grant') updateData.granted_at = new Date().toISOString();

    const { error } = await supabase.from('product_access_requests').update(updateData).eq('id', request_id);
    if (error) throw error;

    return Response.json({ message: `Access ${action === 'grant' ? 'granted' : 'denied'}` });
  } catch (error: any) {
    captureException(error, { handler: 'handleGrantAccess' });
    console.error('grant-access error:', error);
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

async function handleListRequests(request: Request) {
  try {
    const supabase = await getAuth();
    const user = await getUserFromToken(request);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
    if (!profile || !['admin', 'mentor'].includes(profile.role!)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const url = new URL(request.url);
    const statusFilter = url.searchParams.get('status');

    let query = supabase.from('product_access_requests').select('*');
    if (statusFilter && ['pending', 'granted', 'denied'].includes(statusFilter)) {
      query = query.eq('status', statusFilter);
    }
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    return Response.json({ requests: data || [] });
  } catch (error: any) {
    captureException(error, { handler: 'handleListRequests' });
    console.error('list-requests error:', error);
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

async function handleMyAccess(request: Request) {
  try {
    const supabase = await getAuth();
    const user = await getUserFromToken(request);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabase.from('product_access_requests')
      .select('product_id').eq('student_id', user.id).eq('status', 'granted');
    if (error) throw error;

    const productIds = (data || []).map(r => r.product_id);
    return Response.json({ products: productIds });
  } catch (error: any) {
    captureException(error, { handler: 'handleMyAccess' });
    console.error('my-access error:', error);
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

async function handleSendMessage(request: Request) {
  try {
    const supabase = await getAuth();
    const user = await getUserFromToken(request);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { receiver_id, content } = await request.json();
    if (!receiver_id || !content) {
      return Response.json({ error: 'Missing receiver_id or content' }, { status: 400 });
    }

    const { error } = await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id,
      content: content.trim().slice(0, 5000),
    });
    if (error) throw error;

    return Response.json({ message: 'Message sent' });
  } catch (error: any) {
    captureException(error, { handler: 'handleSendMessage' });
    console.error('send-message error:', error);
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

async function handleGetConversation(request: Request) {
  try {
    const supabase = await getAuth();
    const user = await getUserFromToken(request);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const url = new URL(request.url);
    const withUserId = url.searchParams.get('with');
    if (!withUserId) return Response.json({ error: 'Missing "with" param' }, { status: 400 });

    const { data, error } = await supabase
      .from('messages')
      .select('id, sender_id, receiver_id, content, read, created_at')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${withUserId}),and(sender_id.eq.${withUserId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true });
    if (error) throw error;

    return Response.json({ messages: data || [] });
  } catch (error: any) {
    captureException(error, { handler: 'handleGetConversation' });
    console.error('get-conversation error:', error);
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

async function handleGetConversations(request: Request) {
  try {
    const supabase = await getAuth();
    const user = await getUserFromToken(request);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabase
      .from('messages')
      .select('id, sender_id, receiver_id, content, read, created_at')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false });
    if (error) throw error;

    const conversationsMap = new Map<string, { other_user_id: string; last_message_at: string; last_message: string; unread: number }>();
    for (const msg of data || []) {
      const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          other_user_id: otherUserId,
          last_message_at: msg.created_at,
          last_message: msg.content,
          unread: (msg.receiver_id === user.id && !msg.read) ? 1 : 0,
        });
      } else {
        const conv = conversationsMap.get(otherUserId)!;
        if (msg.receiver_id === user.id && !msg.read) conv.unread++;
      }
    }

    const conversations = Array.from(conversationsMap.values()).sort(
      (a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
    );

    return Response.json({ conversations });
  } catch (error: any) {
    captureException(error, { handler: 'handleGetConversations' });
    console.error('get-conversations error:', error);
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

async function handleMarkRead(request: Request) {
  try {
    const supabase = await getAuth();
    const user = await getUserFromToken(request);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { from_user_id } = await request.json();
    if (!from_user_id) return Response.json({ error: 'Missing from_user_id' }, { status: 400 });

    const { error } = await supabase.from('messages')
      .update({ read: true })
      .eq('receiver_id', user.id)
      .eq('sender_id', from_user_id)
      .eq('read', false);
    if (error) throw error;

    return Response.json({ message: 'Messages marked as read' });
  } catch (error: any) {
    captureException(error, { handler: 'handleMarkRead' });
    console.error('mark-read error:', error);
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

async function handleWelcome(request: Request) {
  try {
    const supabase = await getAuth();
    const { email, name } = await request.json();
    if (!email) return Response.json({ error: "Missing email" }, { status: 400 });
    const normalizedEmail = email.toLowerCase().trim();
    const userName = name || 'Member';

    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        const { data: template } = await supabase.from('email_templates').select('subject, body').eq('id', 'welcome_email').maybeSingle();
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
          bcc: process.env.ADMIN_EMAIL || 'peter@mentorino.me',
          subject: `Mentorino — ${subject}`,
          html: `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;background:#fff;color:#1a1a1a"><div style="width:40px;height:40px;background:#000;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:20px;margin-bottom:32px">M</div>${body}<hr style="border:none;border-top:1px solid #eee;margin:32px 0"><p style="font-size:11px;color:#999">Mentorino — mentorship, redefined.</p></div>`,
        });
      } catch (emailError) {
        console.error("Email send error:", emailError);
      }
    }

    return Response.json({ message: "Welcome email sent" });
  } catch (error: any) {
    captureException(error, { handler: 'handleWelcome' });
    console.error("Welcome Email Error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function handleResetPassword(request: Request) {
  try {
    const { token, password } = await request.json();
    if (!token || !password) {
      return Response.json({ error: 'Missing token or password' }, { status: 400 });
    }
    if (password.length < 6) {
      return Response.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const crypto = await import('node:crypto');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const supabase = await getAuth();
    const { data: row, error: findError } = await supabase.from('password_reset_tokens')
      .select('id, email, expires_at, used').eq('token', hashedToken).maybeSingle();
    if (findError) throw findError;

    if (!row) {
      return Response.json({ error: 'Invalid or expired reset link' }, { status: 400 });
    }
    if (row.used) {
      return Response.json({ error: 'This reset link has already been used' }, { status: 400 });
    }
    if (new Date(row.expires_at) < new Date()) {
      return Response.json({ error: 'This reset link has expired' }, { status: 400 });
    }

    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;

    const user = users?.users?.find((u: any) => u.email === row.email);
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, { password });
    if (updateError) throw updateError;

    const { error: tokenUpdateError } = await supabase.from('password_reset_tokens')
      .update({ used: true }).eq('id', row.id);
    if (tokenUpdateError) throw tokenUpdateError;

    return Response.json({ message: 'Password updated successfully' });
  } catch (error: any) {
    captureException(error, { handler: 'handleResetPassword' });
    console.error('reset-password error:', error);
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

async function handleContact(request: Request) {
  try {
    const supabase = await getAuth();
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !message) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const sanitize = (str: string) => str.replace(/[<>]/g, "").trim();
    const normalizedEmail = email.toLowerCase().trim();
    const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
    const MAX_SUBMISSIONS = 3;
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'peter@mentorino.me';

    const fiveMinAgo = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
    const { count, error: countError } = await supabase.from('contact_messages')
      .select('*', { count: 'exact', head: true })
      .eq('email', normalizedEmail)
      .gte('created_at', fiveMinAgo);
    if (countError) throw countError;

    if ((count || 0) >= MAX_SUBMISSIONS) {
      return Response.json({ error: "Too many submissions. Please wait a few minutes before trying again." }, { status: 429 });
    }

    const { error: insertError } = await supabase.from('contact_messages').insert({
      name: sanitize(name).slice(0, 255),
      email: normalizedEmail,
      phone: sanitize(phone || '').slice(0, 50),
      subject: subject?.slice(0, 255),
      message: sanitize(message).slice(0, 5000),
    });
    if (insertError) throw insertError;

    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: `Mentorino <${FROM_EMAIL}>`,
          to: ADMIN_EMAIL,
          subject: `New Contact Message from ${sanitize(name)}`,
          html: `<strong>Name:</strong> ${sanitize(name)}<br>
                 <strong>Email:</strong> ${normalizedEmail}<br>
                 <strong>Phone:</strong> ${sanitize(phone || 'N/A')}<br>
                 <strong>Subject:</strong> ${subject || 'N/A'}<br><br>
                 <strong>Message:</strong><br>${sanitize(message)}`
        });
        await resend.emails.send({
          from: `Mentorino <${FROM_EMAIL}>`,
          to: normalizedEmail,
          bcc: ADMIN_EMAIL,
          subject: "Your message has been received — Mentorino",
          html: `Hi ${sanitize(name)},<br><br>
                 We've received your message and will get back to you within 48 hours.<br><br>
                 <strong>Your message:</strong><br>
                 ${sanitize(message)}<br><br>
                 — Mentorino Team`
        });
      } catch (emailError) {
        console.error("Admin notification email error:", emailError);
      }
    }

    return Response.json({ message: "Message sent successfully" });
  } catch (error: any) {
    captureException(error, { handler: 'handleContact' });
    console.error("Contact Error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function handleReview(request: Request) {
  try {
    const supabase = await getAuth();
    const body = await request.json();
    if (!body.reviewer_name || !body.reviewer_email || body.rating === undefined) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const email = body.reviewer_email.toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "Invalid email format" }, { status: 400 });
    }

    const rating = parseInt(body.rating);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      return Response.json({ error: "Rating must be a number between 1 and 5" }, { status: 400 });
    }

    if (body.reviewer_name.length > 100) {
      return Response.json({ error: "Name too long" }, { status: 400 });
    }

    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { count, error: countError } = await supabase.from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('reviewer_email', email)
      .gte('created_at', fiveMinAgo);
    if (countError) throw countError;

    if ((count || 0) >= 3) {
      return Response.json({ error: "Too many reviews. Please wait a few minutes." }, { status: 429 });
    }

    const { data, error } = await supabase.from('reviews').insert({
      reviewer_name: body.reviewer_name.trim().slice(0, 100),
      reviewer_email: email,
      rating,
      comment: body.comment ? body.comment.trim().slice(0, 2000) : null,
    }).select('id').single();
    if (error) throw error;

    return Response.json({ id: data.id, message: "Review submitted" });
  } catch (error: any) {
    captureException(error, { handler: 'handleReview' });
    console.error("Reviews Error:", error);
    return Response.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

async function handleTransaction(request: Request) {
  try {
    const supabase = await getAuth();
    const user = await getUserFromToken(request);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
    if (!profile || profile.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    if (!body.product_id || !body.amount) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data, error } = await supabase.from('transactions').insert({
      user_id: body.user_id || user.id,
      user_name: body.user_name || user.email || "",
      amount: body.amount,
      product: body.product || "",
      product_id: body.product_id,
      status: body.status || "pending",
    }).select('id').single();
    if (error) throw error;

    return Response.json({ id: data.id, message: "Transaction created" });
  } catch (error: any) {
    captureException(error, { handler: 'handleTransaction' });
    console.error("Transactions Error:", error);
    return Response.json({ error: error.message || "Internal server error" }, { status: 500 });
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
    case "reset-password": return handleResetPassword(request);
    case "contact": return handleContact(request);
    case "review": return handleReview(request);
    case "transaction": return handleTransaction(request);
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
