import { Handler } from "@netlify/functions";
import { prisma } from "../_shared/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');
const FROM_EMAIL = process.env.SENDER_EMAIL || 'admissions@mentorino.me';
const SITE_URL = process.env.URL || 'http://localhost:3000';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { booking } = JSON.parse(event.body || "{}");
    if (!booking || !booking.user_email) {
      return { statusCode: 400, body: JSON.stringify({ error: "Invalid booking data" }) };
    }

    const email = booking.user_email.toLowerCase().trim();
    const userName = booking.user_name || 'Mentee';

    if (process.env.RESEND_API_KEY) {
      try {
        const template = await prisma.email_templates.findUnique({
          where: { id: 'booking_confirmed' },
          select: { subject: true, body: true },
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
          html: body
        });
      } catch (emailError) {
        console.error("Email send error:", emailError);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Booking confirmation sent" }),
    };
  } catch (error: any) {
    console.error("Booking Email Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
