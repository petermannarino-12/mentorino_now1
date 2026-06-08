import { getAuth, getUserFromToken } from './auth.js';
import { captureException } from './sentry.js';

function mapBooking(b: any) {
  return {
    id: b.id,
    user_id: b.user_id,
    user_name: b.user_name,
    date: b.date,
    time: b.time,
    meeting_link: b.meeting_link,
    status: b.status,
    notes: b.notes,
  };
}

export async function GET(request: Request) {
  try {
    const user = await getUserFromToken(request);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const from = parseInt(url.searchParams.get("from") || "0");
    const to = parseInt(url.searchParams.get("to") || "49");

    const supabase = await getAuth();
    let query = supabase.from('bookings').select('*').order('date', { ascending: false }).range(from, to);
    if (userId) query = query.eq('user_id', userId);

    const { data, error } = await query;
    if (error) throw error;

    return Response.json((data || []).map(mapBooking));
  } catch (err: any) {
    captureException(err, { handler: 'bookings GET' });
    console.error("bookings GET error:", err);
    return Response.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromToken(request);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    if (!body.date || !body.time) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = await getAuth();
    const { data, error } = await supabase.from('bookings').insert({
      user_id: body.user_id || user.id,
      user_name: body.user_name || "",
      date: body.date,
      time: body.time,
      meeting_link: body.meeting_link || "",
      status: body.status || "upcoming",
      notes: body.notes,
    }).select().single();

    if (error) throw error;

    return Response.json(mapBooking(data));
  } catch (err: any) {
    captureException(err, { handler: 'bookings POST' });
    console.error("bookings POST error:", err);
    return Response.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getUserFromToken(request);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    if (!body.id) return Response.json({ error: "Missing id" }, { status: 400 });

    const supabase = await getAuth();
    const updateData: Record<string, any> = {};
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.status !== undefined) updateData.status = body.status;

    const { data, error } = await supabase.from('bookings').update(updateData).eq('id', body.id).select().single();
    if (error) throw error;

    return Response.json(mapBooking(data));
  } catch (err: any) {
    captureException(err, { handler: 'bookings PATCH' });
    console.error("bookings PATCH error:", err);
    return Response.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
