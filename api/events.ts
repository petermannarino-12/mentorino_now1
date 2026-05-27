import { createClient } from '@supabase/supabase-js';

function getSupabase() {
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
    created_at: e.created_at,
  };
}

async function getUser(request: Request) {
  const token = request.headers.get("authorization")?.split(" ")[1];
  if (!token) return null;
  const { data: { user }, error } = await getSupabase().auth.getUser(token);
  if (error || !user) return null;
  return user;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const from = parseInt(url.searchParams.get("from") || "0");
    const to = parseInt(url.searchParams.get("to") || "49");

    const { data, error } = await getSupabase()
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to);
    if (error) throw error;

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
      const { data: ev, error: findError } = await getSupabase()
        .from('events')
        .select('*')
        .eq('id', body.eventId)
        .single();
      if (findError || !ev) return Response.json({ error: "Event not found" }, { status: 404 });
      const attendees: string[] = (ev.attendees as string[]) || [];
      if (attendees.includes(body.userId)) {
        return Response.json(mapEvent(ev));
      }
      const { data: updated, error: updateError } = await getSupabase()
        .from('events')
        .update({ attendees: [...attendees, body.userId] })
        .eq('id', body.eventId)
        .select()
        .single();
      if (updateError) throw updateError;
      return Response.json(mapEvent(updated));
    }

    const { data, error } = await getSupabase()
      .from('events')
      .insert({
        title: body.title,
        date: body.date,
        time: body.time,
        location: body.location,
        description: body.description,
        link: body.link,
        attendees: body.attendees || [],
      })
      .select()
      .single();
    if (error) throw error;

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

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) return Response.json({ error: "Missing id" }, { status: 400 });

    const { error } = await getSupabase()
      .from('events')
      .delete()
      .eq('id', id);
    if (error) throw error;

    return Response.json({ message: "Event deleted" });
  } catch (err: any) {
    console.error("events DELETE error:", err);
    return Response.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
