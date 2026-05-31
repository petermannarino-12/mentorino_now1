import { getPrisma } from './prisma.js';

const FROM_EMAIL = process.env.SENDER_EMAIL || 'admissions@mentorino.me';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admissions@mentorino.me';
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const MAX_SUBMISSIONS = 3;
const sanitize = (str: string) => str.replace(/[<>]/g, "").trim();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !message) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const fiveMinAgo = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);

    const count = await (await getPrisma()).contact_messages.count({
      where: {
        email: normalizedEmail,
        createdAt: { gte: fiveMinAgo },
      },
    });

    if ((count || 0) >= MAX_SUBMISSIONS) {
      return Response.json({ error: "Too many submissions. Please wait a few minutes before trying again." }, { status: 429 });
    }

    await (await getPrisma()).contact_messages.create({
      data: {
        name: sanitize(name).slice(0, 255),
        email: normalizedEmail,
        phone: sanitize(phone || '').slice(0, 50),
        subject: subject?.slice(0, 255),
        message: sanitize(message).slice(0, 5000),
      },
    });

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
      } catch (emailError) {
        console.error("Admin notification email error:", emailError);
      }
    }

    return Response.json({ message: "Message sent successfully" });
  } catch (error: any) {
    console.error("Contact Error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
