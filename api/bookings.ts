import { getPrisma } from './prisma.js';
import { getUserFromToken } from './auth.js';

function mapBooking(b: any) {
  return {
    id: b.id,
    user_id: b.userId,
    user_name: b.userName,
    date: b.date,
    time: b.time,
    meeting_link: b.meetingLink,
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
    const user = await getUserFromToken(request);
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
        meetingLink: body.meeting_link || "",
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
    const user = await getUserFromToken(request);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    if (!body.id) return Response.json({ error: "Missing id" }, { status: 400 });

    const data = await (await getPrisma()).bookings.update({
      where: { id: body.id },
      data: {
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.status !== undefined && { status: body.status }),
      },
    });

    return Response.json(mapBooking(data));
  } catch (err: any) {
    console.error("bookings PATCH error:", err);
    return Response.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
