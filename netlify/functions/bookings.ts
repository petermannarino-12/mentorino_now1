import { Handler } from "@netlify/functions";
import { supabase } from "../_shared/supabase-client";
import { prisma } from "../_shared/prisma";

export const handler: Handler = async (event) => {
  try {
    switch (event.httpMethod) {
      case "GET": return handleGet(event);
      case "POST": return handlePost(event);
      case "PATCH": return handlePatch(event);
      default: return { statusCode: 405, body: "Method Not Allowed" };
    }
  } catch (error: any) {
    console.error("Bookings Error:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message || "Internal server error" }) };
  }
};

async function handleGet(event: any) {
  const token = event.headers.authorization?.split(" ")[1];
  if (!token) return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized" }) };
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return { statusCode: 401, body: JSON.stringify({ error: "Invalid token" }) };

  const q = event.queryStringParameters || {};
  const userId = q.userId;
  const from = parseInt(q.from || "0");
  const to = parseInt(q.to || "49");

  const where = userId ? { userId } : {};
  const data = await prisma.bookings.findMany({
    where,
    orderBy: { date: "desc" },
    skip: from,
    take: to - from + 1,
  });

  return { statusCode: 200, body: JSON.stringify(data.map(mapBooking)) };
}

async function handlePost(event: any) {
  const token = event.headers.authorization?.split(" ")[1];
  if (!token) return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized" }) };
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return { statusCode: 401, body: JSON.stringify({ error: "Invalid token" }) };

  const body = JSON.parse(event.body || "{}");
  if (!body.date || !body.time) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing required fields" }) };
  }

  const data = await prisma.bookings.create({
    data: {
      userId: body.user_id || user.id,
      userName: body.user_name || "",
      date: body.date,
      time: body.time,
      status: body.status || "upcoming",
      notes: body.notes,
    },
  });

  return { statusCode: 200, body: JSON.stringify(mapBooking(data)) };
}

async function handlePatch(event: any) {
  const token = event.headers.authorization?.split(" ")[1];
  if (!token) return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized" }) };
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return { statusCode: 401, body: JSON.stringify({ error: "Invalid token" }) };

  const body = JSON.parse(event.body || "{}");
  if (!body.id) return { statusCode: 400, body: JSON.stringify({ error: "Missing id" }) };

  const data = await prisma.bookings.update({
    where: { id: body.id },
    data: { notes: body.notes },
  });

  return { statusCode: 200, body: JSON.stringify(mapBooking(data)) };
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
