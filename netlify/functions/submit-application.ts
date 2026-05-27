import { Handler } from "@netlify/functions";
import { prisma } from "../_shared/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');
const FROM_EMAIL = process.env.SENDER_EMAIL || 'admissions@mentorino.me';
const SITE_URL = process.env.URL || 'http://localhost:3000';

const sanitize = (str: string) => str.replace(/[<>]/g, "").slice(0, 255).trim();

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { application } = JSON.parse(event.body || "{}");
    if (!application || !application.user_email) {
      return { statusCode: 400, body: JSON.stringify({ error: "Invalid application data" }) };
    }

    const email = application.user_email.toLowerCase().trim();
    const userName = sanitize(application.user_name || 'Applicant');

    // 1. Check for recent submissions (Basic Rate Limiting)
    const recent = await prisma.applications.findMany({
      where: { userEmail: email },
      orderBy: { createdAt: 'desc' },
      take: 1,
      select: { createdAt: true },
    });

    if (recent.length > 0) {
      const lastSubmit = new Date(recent[0].createdAt).getTime();
      const now = new Date().getTime();
      if (now - lastSubmit < 1000 * 60 * 60 * 24) {
        return { 
          statusCode: 429, 
          body: JSON.stringify({ error: "You have already submitted an application recently. Please wait 24 hours." }) 
        };
      }
    }

    // 2. Insert sanitized data
    const { user_email, mentor_type, status, id, created_at, ...responses } = application;
    
    await prisma.applications.create({
      data: {
        userEmail: email,
        mentorType: application.mentor_type,
        status: 'pending',
        responses: {
          ...responses,
          user_name: userName,
          user_phone: sanitize(application.user_phone || ''),
          goals: application.goals ? application.goals.slice(0, 2000) : ''
        }
      },
    });

    // 3. Send Confirmation Email
    if (process.env.RESEND_API_KEY) {
      try {
        const template = await prisma.email_templates.findUnique({
          where: { id: 'application_submitted' },
          select: { subject: true, body: true },
        });
        if (!template) console.error('Template not found: application_submitted');
        
        const subject = template?.subject || 'Application Received - Mentorino';
        let body = template?.body || `Hi {{student_name}},<br><br>We have successfully received your application. Our team is currently reviewing it, and we will get back to you within 48 hours.<br><br>Best,<br>Mentorino Team`;
        
        body = body
          .replace(/{{student_name}}/g, userName)
          .replace(/{{mentor_name}}/g, 'Mentorino')
          .replace(/{{program_name}}/g, application.mentor_type || 'Mentorino Program')
          .replace(/{{login_url}}/g, `${SITE_URL}/auth`)
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
      body: JSON.stringify({ message: "Application submitted successfully" }),
    };
  } catch (error: any) {
    console.error("Submission Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to submit application. Please try again later." }),
    };
  }
};
