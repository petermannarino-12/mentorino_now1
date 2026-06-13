import { getAuth } from './auth.js';
import { captureException } from './sentry.js';

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

    const seriousness = typeof application.seriousness === 'number' ? application.seriousness : 5;

    const supabase = await getAuth();
    const { error: upsertError } = await supabase.from('applications').upsert({
      user_email: email,
      mentor_type: application.mentor_type,
      status: 'pending',
      user_id: user?.id || null,
      user_name: userName,
      user_phone: sanitize(application.user_phone || ''),
      meeting_preference: application.meeting_preference || 'Virtual',
      frequency: application.frequency || '',
      goals: application.goals ? application.goals.slice(0, 2000) : '',
      seriousness,
      responses: { ...responses },
    }, { onConflict: 'user_email' });

    if (upsertError) throw upsertError;

    if (process.env.RESEND_API_KEY) {
      try {
        const { data: template } = await supabase.from('email_templates').select('subject, body').eq('id', 'application_submitted').maybeSingle();
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
    captureException(error, { handler: 'handleSubmit' });
    console.error("Submission Error:", error);
    return Response.json({ error: "Failed to submit application. Please try again later." }, { status: 500 });
  }
}

async function handleCheck(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) return Response.json({ error: "Missing email" }, { status: 400 });

    const supabase = await getAuth();
    const { data: application } = await supabase.from('applications').select('status').eq('user_email', email.toLowerCase().trim()).maybeSingle();

    return Response.json({ is_approved: application?.status === "approved" });
  } catch (error: any) {
    captureException(error, { handler: 'handleCheck' });
    console.error("check-application Error:", error);
    return Response.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

async function handleDelete(request: Request) {
  try {
    const user = await getUserFromToken(request);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = await getAuth();

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
    if (!profile || !["admin", "mentor"].includes(profile.role!)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) return Response.json({ error: "Missing ID" }, { status: 400 });

    const { data: application } = await supabase.from('applications').select('user_email').eq('id', id).maybeSingle();
    if (!application) return Response.json({ error: "Application not found" }, { status: 404 });

    const targetEmail = application.user_email.toLowerCase().trim();
    const { data: targetProfile } = await supabase.from('profiles').select('id').eq('email', targetEmail).maybeSingle();
    if (targetProfile) {
      const { error: authDeleteError } = await supabase.auth.admin.deleteUser(targetProfile.id);
      if (authDeleteError) console.error("Auth Delete Error:", authDeleteError);
    }

    await supabase.from('applications').delete().eq('id', id);

    return Response.json({ message: "Mentee and application deleted successfully" });
  } catch (error: any) {
    captureException(error, { handler: 'handleDelete' });
    console.error("Delete Error:", error);
    return Response.json({ error: error.message || "Failed to delete application" }, { status: 500 });
  }
}

async function handleUpdateStatus(request: Request) {
  try {
    const user = await getUserFromToken(request);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = await getAuth();

    const { data: profile } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).maybeSingle();
    if (!profile || !['admin', 'mentor'].includes(profile.role!)) {
      return Response.json({ error: "Forbidden: Insufficient privileges" }, { status: 403 });
    }

    const { id, status } = await request.json();
    if (!id || !status || !['approved', 'rejected', 'pending'].includes(status)) {
      return Response.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const { data: application } = await supabase.from('applications').select('user_email, mentor_type, responses').eq('id', id).maybeSingle();
    if (!application) return Response.json({ error: "Application not found" }, { status: 404 });

    const updateData: Record<string, any> = { status };
    if (status === 'approved') {
      updateData.approved_by = user.id;
    } else {
      updateData.approved_by = null;
    }
    const { error: updateError, data: updated } = await supabase.from('applications').update(updateData).eq('id', id).select().single();

    if (updateError) throw updateError;
    if (!updated) return Response.json({ error: "Application not found during update" }, { status: 404 });

    if (process.env.RESEND_API_KEY && (status === 'approved' || status === 'rejected')) {
      try {
        const templateId = status === 'approved' ? 'application_accepted' : 'application_rejected';
        const responses = application.responses as Record<string, any> | null;
        const studentName = responses?.user_name || 'Applicant';
        const mentorName = profile.full_name || 'Mentorino';
        const programName = application.mentor_type || responses?.mentor_type || 'the Mentorino program';

        const { data: template } = await supabase.from('email_templates').select('subject, body').eq('id', templateId).maybeSingle();

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
          to: application.user_email,
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
      user_email: updated.user_email,
      mentor_type: updated.mentor_type,
      status: updated.status,
      created_at: updated.created_at,
      responses: updated.responses,
      approved_by: updated.approved_by,
    });
  } catch (error: any) {
    captureException(error, { handler: 'handleUpdateStatus' });
    console.error("Update Status Error:", error);
    const message = error?.message?.includes("PGRST116")
      ? "Application not found"
      : error?.message?.includes("Missing Supabase env vars")
        ? "Server configuration error"
        : "Failed to update status.";
    return Response.json({ error: message }, { status: 500 });
  }
}

async function handleGetMyApplication(request: Request) {
  try {
    const user = await getUserFromToken(request);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = await getAuth();

    const { data: profile } = await supabase.from('profiles').select('email').eq('id', user.id).maybeSingle();
    if (!profile || !profile.email) {
      return Response.json({ application: null });
    }

    const { data: app } = await supabase.from('applications')
      .select('id, user_email, mentor_type, status, user_name, goals, user_id, created_at')
      .eq('user_email', profile.email.toLowerCase().trim())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!app || app.status !== 'approved') {
      return Response.json({ application: null });
    }

    let mentorProfile = null;
    if (app.approved_by) {
      const { data: mp } = await supabase.from('profiles').select('id, full_name, email').eq('id', app.approved_by).maybeSingle();
      mentorProfile = mp;
    }

    return Response.json({
      application: {
        ...app,
        mentor: mentorProfile ? {
          id: mentorProfile.id,
          name: mentorProfile.full_name || 'Mentor',
          email: mentorProfile.email,
        } : null,
      },
    });
  } catch (error: any) {
    captureException(error, { handler: 'handleGetMyApplication' });
    console.error("get-my-application error:", error);
    return Response.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

async function handleProgramStats() {
  try {
    const supabase = await getAuth();
    const { data: rows } = await supabase.from('applications').select('mentor_type');

    const counts: Record<string, number> = {};
    for (const row of rows || []) {
      const mt = row.mentor_type || 'unspecified';
      counts[mt] = (counts[mt] || 0) + 1;
    }
    const stats = Object.entries(counts).map(([mentor_type, count]) => ({ mentor_type, count }));

    return Response.json({ programs: stats });
  } catch (error: any) {
    captureException(error, { handler: 'handleProgramStats' });
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

async function getUserFromToken(request: Request) {
  const token = request.headers.get('authorization')?.split(' ')[1];
  if (!token) return null;
  const supabase = await getAuth();
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}
