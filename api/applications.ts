import { getPrisma } from './prisma.js';
import { getUserFromToken, getAuth } from './auth.js';

const FROM_EMAIL = process.env.SENDER_EMAIL || 'peter@mentorino.me';
const SITE_URL = process.env.SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) || process.env.URL || 'http://localhost:3000';

const sanitize = (str: string) => str.replace(/[<>]/g, "").slice(0, 255).trim();

async function handleSubmit(request: Request) {
  try {
    const user = await getUserFromToken(request);

    const { application } = await request.json();
    if (!application || !application.user_email) {
      return Response.json({ error: "Invalid application data" }, { status: 400 });
    }
    const email = application.user_email.toLowerCase().trim();
    const userName = sanitize(application.user_name || 'Applicant');

    const { user_email, mentor_type, status, id, created_at, ...responses } = application;

    const upsertData = {
      userEmail: email,
      mentorType: application.mentor_type,
      status: 'pending',
      userId: user?.id || null,
      userName,
      userPhone: sanitize(application.user_phone || ''),
      meetingPreference: application.meeting_preference || 'Virtual',
      frequency: application.frequency || '',
      goals: application.goals ? application.goals.slice(0, 2000) : '',
      seriousness: application.seriousness || 5,
      responses: { ...responses },
    };

    await (await getPrisma()).applications.upsert({
      where: { userEmail: email },
      create: upsertData,
      update: upsertData,
    });

    if (process.env.RESEND_API_KEY) {
      try {
        const template = await (await getPrisma()).email_templates.findUnique({
          where: { id: 'application_submitted' },
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
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: `Mentorino <${FROM_EMAIL}>`,
          to: email,
          subject: subject,
          html: body,
        });

        await resend.emails.send({
          from: `Mentorino <${FROM_EMAIL}>`,
          to: process.env.ADMIN_EMAIL || 'peter@mentorino.me',
          subject: `New Application Submitted — ${userName}`,
          html: `
            <h2>New Application Submitted</h2>
            <p><strong>Name:</strong> ${userName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${sanitize(application.user_phone || '')}</p>
            <p><strong>Mentor Type:</strong> ${application.mentor_type || 'Not specified'}</p>
            <p><strong>Goals:</strong> ${(application.goals || '').slice(0, 500)}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} EST</p>
          `,
        });
      } catch (emailError) {
        console.error("Email send error:", emailError);
      }
    }

    return Response.json({ message: "Application submitted successfully" });
  } catch (error: any) {
    console.error("Submission Error:", error);
    return Response.json({ error: "Failed to submit application. Please try again later." }, { status: 500 });
  }
}

async function handleCheck(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) return Response.json({ error: "Missing email" }, { status: 400 });

    const application = await (await getPrisma()).applications.findFirst({
      where: { userEmail: email.toLowerCase().trim() },
      select: { status: true },
    });

    return Response.json({ is_approved: application?.status === "approved" });
  } catch (error: any) {
    console.error("check-application Error:", error);
    return Response.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

async function handleDelete(request: Request) {
  try {
    const user = await getUserFromToken(request);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = await getAuth();

    const profile = await (await getPrisma()).profiles.findUnique({
      where: { id: user.id },
      select: { role: true },
    });
    if (!profile || !["admin", "mentor"].includes(profile.role!)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) return Response.json({ error: "Missing ID" }, { status: 400 });

    const application = await (await getPrisma()).applications.findUnique({
      where: { id },
      select: { userEmail: true },
    });
    if (!application) return Response.json({ error: "Application not found" }, { status: 404 });

    const targetEmail = application.userEmail.toLowerCase().trim();
    const targetProfile = await (await getPrisma()).profiles.findFirst({
      where: { email: targetEmail },
      select: { id: true },
    });
    if (targetProfile) {
      const { error: authDeleteError } = await supabase.auth.admin.deleteUser(targetProfile.id);
      if (authDeleteError) console.error("Auth Delete Error:", authDeleteError);
    }

    await (await getPrisma()).applications.delete({ where: { id } });

    return Response.json({ message: "Mentee and application deleted successfully" });
  } catch (error: any) {
    console.error("Delete Error:", error);
    return Response.json({ error: error.message || "Failed to delete application" }, { status: 500 });
  }
}

async function handleUpdateStatus(request: Request) {
  try {
    const user = await getUserFromToken(request);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const profile = await (await getPrisma()).profiles.findUnique({
      where: { id: user.id },
      select: { role: true, fullName: true },
    });
    if (!profile || !['admin', 'mentor'].includes(profile.role!)) {
      return Response.json({ error: "Forbidden: Insufficient privileges" }, { status: 403 });
    }

    const { id, status } = await request.json();
    if (!id || !status || !['approved', 'rejected', 'pending'].includes(status)) {
      return Response.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const application = await (await getPrisma()).applications.findUnique({
      where: { id },
      select: { userEmail: true, mentorType: true, responses: true },
    });
    if (!application) return Response.json({ error: "Application not found" }, { status: 404 });

    const updated = await (await getPrisma()).applications.update({
      where: { id },
      data: {
        status,
        approvedBy: status === 'approved' ? user.id : null,
      },
    });

    if (process.env.RESEND_API_KEY && (status === 'approved' || status === 'rejected')) {
      try {
        const templateId = status === 'approved' ? 'application_accepted' : 'application_rejected';
        const responses = application.responses as Record<string, any> | null;
        const studentName = responses?.user_name || 'Applicant';
        const mentorName = profile.fullName || 'Mentorino';
        const programName = application.mentorType || responses?.mentor_type || 'the Mentorino program';

        const template = await (await getPrisma()).email_templates.findUnique({
          where: { id: templateId },
        });
        if (!template) console.error('Template not found:', templateId);

        let subject = template?.subject || (status === 'approved'
          ? 'Welcome to Mentorino — Your Application Has Been Accepted!'
          : 'Update – Mentorino\nApplication');
        let body = template?.body || (status === 'approved'
          ? `Hi {{student_name}},<br><br>Congratulations! Your application to the {{program_name}} program has been approved by {{mentor_name}}.<br><br>You can now create your account and access your member portal.<br><br><a href="{{login_url}}" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Create Your Account</a><br><br>Best,<br>the Mentorino Team`
          : `Hi {{student_name}},<br><br>Thank you for applying to {{program_name}}.<br><br>After careful review by Peter,<br>we are unable to accept your application at this time.<br><br>We wish you the best in your journey.<br><br>Best,<br>the Mentorino Team`);
        body = body
          .replace(/{{student_name}}/g, studentName)
          .replace(/{{mentor_name}}/g, mentorName)
          .replace(/{{program_name}}/g, programName)
          .replace(/{{login_url}}/g, `${SITE_URL}/auth`)
          .replace(/\n/g, '<br>');
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: `Mentorino <${FROM_EMAIL}>`,
          to: application.userEmail,
          bcc: process.env.ADMIN_EMAIL || 'peter@mentorino.me',
          subject: subject,
          html: body,
        });
      } catch (emailError) {
        console.error("Email send error:", emailError);
      }
    }

    return Response.json({
      id: updated.id,
      user_email: updated.userEmail,
      mentor_type: updated.mentorType,
      status: updated.status,
      created_at: updated.createdAt,
      responses: updated.responses,
      approved_by: updated.approvedBy,
    });
  } catch (error: any) {
    console.error("Update Status Error:", error);
    return Response.json({ error: "Failed to update status." }, { status: 500 });
  }
}

async function handleGetMyApplication(request: Request) {
  try {
    const user = await getUserFromToken(request);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const profile = await (await getPrisma()).profiles.findUnique({
      where: { id: user.id },
      select: { email: true },
    });
    if (!profile || !profile.email) {
      return Response.json({ application: null });
    }

    const app = await (await getPrisma()).applications.findFirst({
      where: { userEmail: profile.email.toLowerCase().trim() },
      select: {
        id: true,
        userEmail: true,
        mentorType: true,
        status: true,
        userName: true,
        goals: true,
        userId: true,
        approvedBy: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!app || app.status !== 'approved' || !app.approvedBy) {
      return Response.json({ application: null });
    }

    const mentorProfile = await (await getPrisma()).profiles.findUnique({
      where: { id: app.approvedBy },
      select: { id: true, fullName: true, email: true },
    });

    return Response.json({
      application: {
        ...app,
        mentor: mentorProfile ? {
          id: mentorProfile.id,
          name: mentorProfile.fullName || 'Mentor',
          email: mentorProfile.email,
        } : null,
      },
    });
  } catch (error: any) {
    console.error("get-my-application error:", error);
    return Response.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

async function handleProgramStats() {
  try {
    const rows: { mentor_type: string; count: bigint }[] = await (await getPrisma()).$queryRawUnsafe(
      `SELECT mentor_type, COUNT(*)::int as count FROM public.applications GROUP BY mentor_type ORDER BY mentor_type`
    );
    const stats: { mentor_type: string; count: number }[] = (rows || []).map(r => ({
      mentor_type: r.mentor_type || 'unspecified',
      count: Number(r.count),
    }));
    return Response.json({ programs: stats });
  } catch (error: any) {
    console.error("program-stats Error:", error);
    return Response.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

function router(from: string | null, request: Request): Promise<Response> | null {
  switch (from) {
    case "submit-application": return handleSubmit(request);
    case "check-application": return handleCheck(request);
    case "delete-application": return handleDelete(request);
    case "update-application-status": return handleUpdateStatus(request);
    case "get-my-application": return handleGetMyApplication(request);
    case "program-stats": return handleProgramStats();
    default: return null;
  }
}

export async function POST(request: Request) {
  const from = new URL(request.url).searchParams.get("from");
  const handler = router(from, request);
  if (handler) return handler;
  return Response.json({ error: "Not found" }, { status: 404 });
}

export async function DELETE(request: Request) {
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
