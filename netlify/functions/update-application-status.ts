import { Handler } from "@netlify/functions";
import { supabase } from "../_shared/supabase-client";
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
    // 1. Verify Auth
    const token = event.headers.authorization?.split(' ')[1];
    if (!token) {
      return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized: Missing token" }) };
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized: Invalid token" }) };
    }

    // 2. Check if user has admin/mentor role
    const profile = await prisma.profiles.findUnique({
      where: { id: user.id },
      select: { role: true, fullName: true },
    });

    if (!profile || !['admin', 'mentor'].includes(profile.role)) {
      return { statusCode: 403, body: JSON.stringify({ error: "Forbidden: Insufficient privileges" }) };
    }

    const { id, status } = JSON.parse(event.body || "{}");
    
    if (!id || !status || !['approved', 'rejected', 'pending'].includes(status)) {
      return { statusCode: 400, body: JSON.stringify({ error: "Invalid parameters" }) };
    }

    // 3. Get the current application details
    const application = await prisma.applications.findUnique({
      where: { id },
      select: { userEmail: true, mentorType: true, responses: true },
    });

    if (!application) {
      return { statusCode: 404, body: JSON.stringify({ error: "Application not found" }) };
    }

    // 4. Update the status
    await prisma.applications.update({
      where: { id },
      data: { status },
    });

    // 5. Send Email Notification
    if (process.env.RESEND_API_KEY && (status === 'approved' || status === 'rejected')) {
      try {
        const templateId = status === 'approved' ? 'application_accepted' : 'application_rejected';
        const studentName = application.responses?.user_name || 'Applicant';
        const mentorName = profile.fullName || 'Mentorino';
        const programName = application.mentorType || application.responses?.mentor_type || 'the Mentorino program';
        
        const template = await prisma.email_templates.findUnique({
          where: { id: templateId },
          select: { subject: true, body: true },
        });
        if (!template) console.error('Template not found:', templateId);
        
        let subject = template?.subject || (status === 'approved' 
          ? 'Welcome to Mentorino — Your Application Has Been Accepted!'
          : 'Update – Mentorino Application');
        
        let body = template?.body || (status === 'approved' 
          ? `Hi {{student_name}},<br><br>Congratulations! Your application to the {{program_name}} program has been approved by {{mentor_name}}.<br><br>You can now create your account and access your member portal.<br><br><a href="{{login_url}}" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Create Your Account</a><br><br>Best,<br>Mentorino Team`
          : `Hi {{student_name}},<br><br>Thank you for applying to the {{program_name}}.<br>After careful review by {{mentor_name}},<br>we are unable to accept your application at this time.<br><br>We wish you the best in your journey.<br><br>Best,<br>Mentorino Team`
        );
        
        body = body
          .replace(/{{student_name}}/g, studentName)
          .replace(/{{mentor_name}}/g, mentorName)
          .replace(/{{program_name}}/g, programName)
          .replace(/{{login_url}}/g, `${SITE_URL}/auth`)
          .replace(/\n/g, '<br>');

        await resend.emails.send({
          from: `Mentorino <${FROM_EMAIL}>`,
          to: application.userEmail,
          subject: subject,
          html: body
        });
      } catch (emailError) {
        console.error("Email send error:", emailError);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Status updated successfully" }),
    };
  } catch (error: any) {
    console.error("Update Status Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to update status." }),
    };
  }
};
