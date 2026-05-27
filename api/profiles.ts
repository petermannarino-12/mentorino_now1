import { supabase } from "./_lib/supabase-client";
import { prisma } from "./_lib/prisma";

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

async function getUser(request: Request) {
  const token = request.headers.get("authorization")?.split(" ")[1];
  if (!token) return null;
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

export async function GET(request: Request) {
  try {
    const user = await getUser(request);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(request.url);
    const limit = url.searchParams.get("limit");

    if (limit) {
      const profiles = await prisma.profiles.findMany({ take: parseInt(limit) || 50 });
      return Response.json(profiles.map(mapProfile));
    }

    const id = url.searchParams.get("id") || user.id;
    const profile = await prisma.profiles.findUnique({ where: { id } });
    if (!profile) return Response.json({ error: "Profile not found" }, { status: 404 });

    return Response.json(profile ? mapProfile(profile) : null);
  } catch (err: any) {
    console.error("profiles GET error:", err);
    return Response.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getUser(request);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { milestones } = body;

    if (!milestones) {
      return Response.json({ error: "Missing milestones" }, { status: 400 });
    }

    const profile = await prisma.profiles.update({
      where: { id: user.id },
      data: { milestones },
    });

    return Response.json(mapProfile(profile));
  } catch (err: any) {
    console.error("profiles PATCH error:", err);
    return Response.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
