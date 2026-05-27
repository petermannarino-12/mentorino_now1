import { Handler } from "@netlify/functions";
import { supabase } from "../_shared/supabase-client";
import { prisma } from "../_shared/prisma";

export const handler: Handler = async (event) => {
  try {
    switch (event.httpMethod) {
      case "GET":
        return handleGet(event);
      case "PATCH":
        return handlePatch(event);
      default:
        return { statusCode: 405, body: "Method Not Allowed" };
    }
  } catch (error: any) {
    console.error("Profiles Error:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message || "Internal server error" }) };
  }
};

async function handleGet(event: any) {
  const token = event.headers.authorization?.split(" ")[1];
  if (!token) return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized" }) };
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return { statusCode: 401, body: JSON.stringify({ error: "Invalid token" }) };

  const q = event.queryStringParameters || {};

  // If limit param is present, return a list (admin use case)
  if (q.limit) {
    const limit = parseInt(q.limit) || 50;
    const profiles = await prisma.profiles.findMany({ take: limit });
    return {
      statusCode: 200,
      body: JSON.stringify(profiles.map(mapProfile)),
    };
  }

  const id = q.id || user.id;
  const profile = await prisma.profiles.findUnique({ where: { id } });
  if (!profile) return { statusCode: 404, body: JSON.stringify({ error: "Profile not found" }) };

  return {
    statusCode: 200,
    body: JSON.stringify(profile ? mapProfile(profile) : null),
  };
}

async function handlePatch(event: any) {
  const token = event.headers.authorization?.split(" ")[1];
  if (!token) return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized" }) };
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return { statusCode: 401, body: JSON.stringify({ error: "Invalid token" }) };

  const body = JSON.parse(event.body || "{}");
  const { milestones } = body;

  if (!milestones) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing milestones" }) };
  }

  const profile = await prisma.profiles.update({
    where: { id: user.id },
    data: { milestones },
  });

  return { statusCode: 200, body: JSON.stringify(mapProfile(profile)) };
}

function mapProfile(p: any) {
  return {
    id: p.id,
    email: p.email,
    full_name: p.fullName,
    name: p.name,
    role: p.role,
    phone: p.phone,
    avatar: p.avatar,
    mentorship_status: p.mentorshipStatus,
    tasks: p.tasks,
    milestones: p.milestones,
    created_at: p.createdAt,
  };
}
