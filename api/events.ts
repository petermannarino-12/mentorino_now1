import { getPrisma } from './prisma.js';
import { getUserFromToken } from './auth.js';

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
    created_at: e.createdAt,
  };
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const from = parseInt(url.searchParams.get("from") || "0");
    const to = parseInt(url.searchParams.get("to") || "49");

    if (id) {
      const event = await (await getPrisma()).events.findUnique({
        where: { id },
      });
      if (!event) return Response.json({ error: "Event not found" }, { status: 404 });
      return Response.json(mapEvent(event));
    }

    const data = await (await getPrisma()).events.findMany({
      orderBy: { createdAt: 'desc' },
      skip: from,
      take: to - from + 1,
    });

    return Response.json((data || []).map(mapEvent));
  } catch (err: any) {
    console.error("events GET error:", err);
    return Response.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromToken(request);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();

    if (body.action === "attend") {
      const ev = await (await getPrisma()).events.findUnique({
        where: { id: body.eventId },
      });
      if (!ev) return Response.json({ error: "Event not found" }, { status: 404 });
      const attendees: string[] = (ev.attendees as string[]) || [];
      if (attendees.includes(body.userId)) {
        return Response.json(mapEvent(ev));
      }
      const updated = await (await getPrisma()).events.update({
        where: { id: body.eventId },
        data: { attendees: [...attendees, body.userId] },
      });
      return Response.json(mapEvent(updated));
    }

    const profile = await (await getPrisma()).profiles.findUnique({
      where: { id: user.id },
      select: { role: true },
    });
    if (!profile || !['admin', 'mentor'].includes(profile.role!)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = await (await getPrisma()).events.create({
      data: {
        title: body.title,
        date: body.date,
        time: body.time,
        location: body.location,
        description: body.description,
        link: body.link,
        attendees: body.attendees || [],
        createdBy: user.id,
      },
    });

    if (process.env.RESEND_API_KEY) {
      try {
        const mentees = await (await getPrisma()).$queryRawUnsafe(
          `SELECT DISTINCT a.user_email, COALESCE(p.full_name, a.user_name) as full_name
           FROM public.applications a
           INNER JOIN public.profiles p ON LOWER(p.email) = LOWER(a.user_email)
           WHERE a.status = 'approved' AND a.user_email IS NOT NULL`
        ) as any[];

        if (mentees.length > 0) {
          const { Resend } = await import("resend");
          const resend = new Resend(process.env.RESEND_API_KEY);

          const template = await (await getPrisma()).email_templates.findUnique({
            where: { id: 'event_broadcast' },
          });

          for (const mentee of mentees) {
            const userName = mentee.full_name || 'Mentee';
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
        }
      } catch (emailError) {
        console.error("Broadcast email error:", emailError);
      }
    }

    return Response.json(mapEvent(data));
  } catch (err: any) {
    console.error("events POST error:", err);
    return Response.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getUserFromToken(request);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const profile = await (await getPrisma()).profiles.findUnique({
      where: { id: user.id },
      select: { role: true },
    });
    if (!profile || !['admin', 'mentor'].includes(profile.role!)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) return Response.json({ error: "Missing id" }, { status: 400 });

    await (await getPrisma()).events.delete({ where: { id } });

    return Response.json({ message: "Event deleted" });
  } catch (err: any) {
    console.error("events DELETE error:", err);
    return Response.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
