import { supabase } from "./_lib/supabase-client";
import { prisma } from "./_lib/prisma";

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
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const from = parseInt(url.searchParams.get("from") || "0");
  const to = parseInt(url.searchParams.get("to") || "49");

  const data = await prisma.events.findMany({
    orderBy: { createdAt: "desc" },
    skip: from,
    take: to - from + 1,
  });

  return Response.json(data.map(mapEvent));
}

export async function POST(request: Request) {
  const user = await getUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  if (body.action === "attend") {
    const ev = await prisma.events.findUnique({ where: { id: body.eventId } });
    if (!ev) return Response.json({ error: "Event not found" }, { status: 404 });
    const attendees: string[] = (ev.attendees as string[]) || [];
    if (attendees.includes(body.userId)) {
      return Response.json(mapEvent(ev));
    }
    const updated = await prisma.events.update({
      where: { id: body.eventId },
      data: { attendees: [...attendees, body.userId] },
    });
    return Response.json(mapEvent(updated));
  }

  const data = await prisma.events.create({
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
}

export async function DELETE(request: Request) {
  const user = await getUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });

  await prisma.events.delete({ where: { id } });
  return Response.json({ message: "Event deleted" });
}
