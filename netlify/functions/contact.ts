import { Handler } from "@netlify/functions";
import { prisma } from "../_shared/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');
const FROM_EMAIL = process.env.SENDER_EMAIL || 'admissions@mentorino.me';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admissions@mentorino.me';
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const MAX_SUBMISSIONS = 3;
const sanitize = (str: string) => str.replace(/[<>]/g, "").trim();

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !message) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing required fields" }) };
    }

    const normalizedEmail = email.toLowerCase().trim();

    const fiveMinAgo = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
    const count = await prisma.contact_messages.count({
      where: {
        email: normalizedEmail,
        createdAt: { gte: fiveMinAgo },
      },
    });

    if (count >= MAX_SUBMISSIONS) {
      return {
        statusCode: 429,
        body: JSON.stringify({ error: "Too many submissions. Please wait a few minutes before trying again." }),
      };
    }

    await prisma.contact_messages.create({
      data: {
        name: sanitize(name).slice(0, 255),
        email: normalizedEmail,
        phone: sanitize(phone || '').slice(0, 50),
        subject: subject?.slice(0, 255),
        message: sanitize(message).slice(0, 5000),
      },
    });

    // Send admin notification (non-blocking)
    if (process.env.RESEND_API_KEY) {
      try {
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

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Message sent successfully" }),
    };
  } catch (error: any) {
    console.error("Contact Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
