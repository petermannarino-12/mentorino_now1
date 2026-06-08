import { getAuth, getUserFromToken } from './auth.js';
import { captureException } from './sentry.js';

const FROM_EMAIL = process.env.SENDER_EMAIL || 'peter@mentorino.me';
const SITE_URL = process.env.SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) || process.env.URL || 'http://localhost:3000';

function mapEvent(e: any) {
  return {
    id: e.id,
    title: e.title,
    description: e.description,
    date: e.date,
    time: e.time,
    location: e.location,
    link: e.link,
    attendees: e.attendees || [],
    created_at: e.created_at,
  };
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const from = parseInt(url.searchParams.get("from") || "0");
    const to = parseInt(url.searchParams.get("to") || "49");
    const supabase = await getAuth();

    if (id) {
      const { data: event, error } = await supabase.from('events').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      if (!event) return Response.json({ error: "Event not found" }, { status: 404 });
      return Response.json(mapEvent(event));
    }

    const { data, error } = await supabase.from('events').select('*').order('created_at', { ascending: false }).range(from, to);
    if (error) throw error;

    return Response.json((data || []).map(mapEvent));
  } catch (err: any) {
    captureException(err, { handler: 'events GET' });
    console.error("events GET error:", err);
    return Response.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromToken(request);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const supabase = await getAuth();

    if (body.action === "attend") {
      const { data: ev, error: findError } = await supabase.from('events').select('*').eq('id', body.eventId).maybeSingle();
      if (findError) throw findError;
      if (!ev) return Response.json({ error: "Event not found" }, { status: 404 });
      const attendees: string[] = (ev.attendees as string[]) || [];
      if (attendees.includes(body.userId)) {
        return Response.json(mapEvent(ev));
      }
      const { data: updated, error: updateError } = await supabase.from('events').update({ attendees: [...attendees, body.userId] }).eq('id', body.eventId).select().single();
      if (updateError) throw updateError;
      return Response.json(mapEvent(updated));
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
    if (!profile || !['admin', 'mentor'].includes(profile.role!)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await supabase.from('events').insert({
      title: body.title,
      date: body.date,
      time: body.time,
      location: body.location,
      description: body.description,
      link: body.link,
      attendees: body.attendees || [],
      created_by: user.id,
    }).select().single();

    if (error) throw error;

    if (process.env.RESEND_API_KEY) {
      try {
        const { data: mentees } = await supabase
          .from('applications')
          .select('user_email')
          .eq('status', 'approved')
          .not('user_email', 'is', null);

        if (mentees && mentees.length > 0) {
          const { Resend } = await import("resend");
          const resend = new Resend(process.env.RESEND_API_KEY);

          const { data: template } = await supabase.from('email_templates').select('subject, body').eq('id', 'event_broadcast').maybeSingle();

          for (const mentee of mentees) {
            const userName = mentee.user_name || 'Mentee';
            const subject = template?.subject || `New ${body.title} — Mentorino`;
            let bodyHtml = template?.body || `Hi {{student_name}},<br><br>A new event has been published just for you:<br><br><strong>{{event_title}}</strong><br>{{event_description}}<br><br><strong>Date:</strong> {{event_date}}<br><strong>Time:</strong> {{event_time}}<br><strong>Location:</strong> {{event_location}}<br><br>Log in to your dashboard for more details.<br><br>Best,<br>Mentorino Team`;
            bodyHtml = bodyHtml
              .replace(/{{student_name}}/g, userName)
              .replace(/{{event_title}}/g, body.title)
              .replace(/{{event_description}}/g, body.description || '')
              .replace(/{{event_date}}/g, body.date)
              .replace(/{{event_time}}/g, body.time)
              .replace(/{{event_location}}/g, body.location)
              .replace(/{{login_url}}/g, `${SITE_URL}/dashboard`);

            await resend.emails.send({
              from: `Mentorino <${FROM_EMAIL}>`,
              to: mentee.user_email,
              subject: subject,
              html: `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;background:#fff;color:#1a1a1a"><div style="width:40px;height:40px;background:#000;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:20px;margin-bottom:32px">M</div>${bodyHtml}<hr style="border:none;border-top:1px solid #eee;margin:32px 0"><p style="font-size:11px;color:#999">Mentorino — mentorship, redefined.</p></div>`,
            });
          }

          await resend.emails.send({
            from: `Mentorino <${FROM_EMAIL}>`,
            to: process.env.ADMIN_EMAIL || 'peter@mentorino.me',
            subject: `Event Broadcast: ${body.title}`,
            html: `
              <h2>Event Broadcast Published</h2>
              <p><strong>Title:</strong> ${body.title}</p>
              <p><strong>Date:</strong> ${body.date}</p>
              <p><strong>Time:</strong> ${body.time}</p>
              <p><strong>Location:</strong> ${body.location}</p>
              <p><strong>Description:</strong> ${(body.description || '').slice(0, 500)}</p>
              <p><strong>Notified:</strong> ${mentees.length} mentees</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} EST</p>
            `,
          });
        }
      } catch (emailError) {
        console.error("Broadcast email error:", emailError);
      }
    }

    return Response.json(mapEvent(data));
  } catch (err: any) {
    captureException(err, { handler: 'events POST' });
    console.error("events POST error:", err);
    return Response.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getUserFromToken(request);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = await getAuth();
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
    if (!profile || !['admin', 'mentor'].includes(profile.role!)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) return Response.json({ error: "Missing id" }, { status: 400 });

    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) throw error;

    return Response.json({ message: "Event deleted" });
  } catch (err: any) {
    captureException(err, { handler: 'events DELETE' });
    console.error("events DELETE error:", err);
    return Response.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
