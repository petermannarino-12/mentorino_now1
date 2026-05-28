import { getPrisma } from './prisma';

async function getSupabase() {
  const { createClient } = await import('@supabase/supabase-js');
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(`Missing Supabase env vars: ${!url ? 'VITE_SUPABASE_URL' : ''} ${!key ? 'SUPABASE_SERVICE_ROLE_KEY' : ''}`);
  }
  return createClient(url, key);
}

function mapBooking(b: any) {
  return {
    id: b.id,
    user_id: b.userId,
    user_name: b.userName,
    date: b.date,
    time: b.time,
    status: b.status,
    notes: b.notes,
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
    const user = await getUser(request);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const from = parseInt(url.searchParams.get("from") || "0");
    const to = parseInt(url.searchParams.get("to") || "49");

    const where = userId ? { userId } : {};
    const data = await (await getPrisma()).bookings.findMany({
      where,
      orderBy: { date: 'desc' },
      skip: from,
      take: to - from + 1,
    });

    return Response.json((data || []).map(mapBooking));
  } catch (err: any) {
    console.error("bookings GET error:", err);
    return Response.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUser(request);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    if (!body.date || !body.time) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const data = await (await getPrisma()).bookings.create({
      data: {
        userId: body.user_id || user.id,
        userName: body.user_name || "",
        date: body.date,
        time: body.time,
        status: body.status || "upcoming",
        notes: body.notes,
      },
    });

    return Response.json(mapBooking(data));
  } catch (err: any) {
    console.error("bookings POST error:", err);
    return Response.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getUser(request);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    if (!body.id) return Response.json({ error: "Missing id" }, { status: 400 });

    const data = await (await getPrisma()).bookings.update({
      where: { id: body.id },
      data: { notes: body.notes },
    });

    return Response.json(mapBooking(data));
  } catch (err: any) {
    console.error("bookings PATCH error:", err);
    return Response.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
