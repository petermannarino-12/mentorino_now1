import { Handler } from "@netlify/functions";
import { supabase } from "../_shared/supabase-client";
import { prisma } from "../_shared/prisma";

export const handler: Handler = async (event) => {
  try {
    switch (event.httpMethod) {
      case "GET": return handleGet(event);
      case "POST": return handlePost(event);
      case "DELETE": return handleDelete(event);
      default: return { statusCode: 405, body: "Method Not Allowed" };
    }
  } catch (error: any) {
    console.error("Events Error:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message || "Internal server error" }) };
  }
};

async function handleGet(event: any) {
  const q = event.queryStringParameters || {};
  const from = parseInt(q.from || "0");
  const to = parseInt(q.to || "49");

  const data = await prisma.events.findMany({
    orderBy: { createdAt: "desc" },
    skip: from,
    take: to - from + 1,
  });

  return { statusCode: 200, body: JSON.stringify(data.map(mapEvent)) };
}

async function handlePost(event: any) {
  const token = event.headers.authorization?.split(" ")[1];
  if (!token) return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized" }) };
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return { statusCode: 401, body: JSON.stringify({ error: "Invalid token" }) };

  const body = JSON.parse(event.body || "{}");

  if (body.action === "attend") {
    const ev = await prisma.events.findUnique({ where: { id: body.eventId } });
    if (!ev) return { statusCode: 404, body: JSON.stringify({ error: "Event not found" }) };
    const attendees: string[] = (ev.attendees as string[]) || [];
    if (attendees.includes(body.userId)) {
      return { statusCode: 200, body: JSON.stringify(mapEvent(ev)) };
    }
    const updated = await prisma.events.update({
      where: { id: body.eventId },
      data: { attendees: [...attendees, body.userId] },
    });
    return { statusCode: 200, body: JSON.stringify(mapEvent(updated)) };
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

  return { statusCode: 200, body: JSON.stringify(mapEvent(data)) };
}

async function handleDelete(event: any) {
  const token = event.headers.authorization?.split(" ")[1];
  if (!token) return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized" }) };
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return { statusCode: 401, body: JSON.stringify({ error: "Invalid token" }) };

  const id = event.queryStringParameters?.id;
  if (!id) return { statusCode: 400, body: JSON.stringify({ error: "Missing id" }) };

  await prisma.events.delete({ where: { id } });
  return { statusCode: 200, body: JSON.stringify({ message: "Event deleted" }) };
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
