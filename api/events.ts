import { getPrisma } from './prisma.js';

async function getSupabase() {
  const { createClient } = await import('@supabase/supabase-js');
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(`Missing Supabase env vars: ${!url ? 'VITE_SUPABASE_URL' : ''} ${!key ? 'SUPABASE_SERVICE_ROLE_KEY' : ''}`);
  }
  return createClient(url, key);
}

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

async function getUser(request: Request) {
  const token = request.headers.get("authorization")?.split(" ")[1];
  if (!token) return null;
  const supabase = await getSupabase();
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
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
    const user = await getUser(request);
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
      },
    });

    return Response.json(mapEvent(data));
  } catch (err: any) {
    console.error("events POST error:", err);
    return Response.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getUser(request);
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
