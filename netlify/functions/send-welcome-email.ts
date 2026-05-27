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
    const { email, name } = JSON.parse(event.body || "{}");
    if (!email) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing email" }) };
    }

    const normalizedEmail = email.toLowerCase().trim();
    const userName = name || 'Member';

    if (process.env.RESEND_API_KEY) {
      try {
        const template = await prisma.email_templates.findUnique({
          where: { id: 'welcome_email' },
          select: { subject: true, body: true },
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
          html: body
        });
      } catch (emailError) {
        console.error("Email send error:", emailError);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Welcome email sent" }),
    };
  } catch (error: any) {
    console.error("Welcome Email Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
