import { getPrisma } from './prisma.js';
const FROM_EMAIL = process.env.SENDER_EMAIL || 'admissions@mentorino.me';
const SITE_URL = process.env.URL || 'http://localhost:3000';

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
          .replace(/\n/g, '<br>');
        await resend.emails.send({
          from: `Mentorino <${FROM_EMAIL}>`,
          to: email,
          subject: subject,
          html: body,
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
          .replace(/\n/g, '<br>');
        await resend.emails.send({
          from: `Mentorino <${FROM_EMAIL}>`,
          to: normalizedEmail,
          subject: subject,
          html: body,
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
    default: return null;
  }
}

export async function POST(request: Request) {
  const from = new URL(request.url).searchParams.get("from");
  const handler = router(from, request);
  if (handler) return handler;
  return Response.json({ error: "Not found" }, { status: 404 });
}
