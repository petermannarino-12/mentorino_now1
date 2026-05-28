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

function mapProfileRow(row: any) {
  return {
    id: row.id,
    email: row.email,
    full_name: row.fullName,
    name: row.name,
    role: row.role,
    phone: row.phone,
    avatar: row.avatar,
    mentorship_status: row.mentorshipStatus,
    tasks: row.tasks,
    milestones: row.milestones,
    created_at: row.createdAt,
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
    const limit = url.searchParams.get("limit");
    const id = url.searchParams.get("id") || user.id;

    if (limit) {
      const rows = await (await getPrisma()).profiles.findMany({
        take: parseInt(limit) || 50,
      });
      return Response.json((rows || []).map(mapProfileRow));
    }

    const row = await (await getPrisma()).profiles.findUnique({ where: { id } });
    if (!row) {
      // Return a minimal profile from the authenticated user's data
      const token = request.headers.get("authorization")?.split(" ")[1];
      const { data: { user: authUser } } = token
        ? await (await getSupabase()).auth.getUser(token)
        : { data: { user: null } };
      if (!authUser) return Response.json({ error: "Profile not found" }, { status: 404 });
      return Response.json({
        id: authUser.id,
        email: authUser.email || '',
        full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || '',
        name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || '',
        role: authUser.user_metadata?.role || 'user',
        phone: '',
        avatar: null,
        mentorship_status: null,
        tasks: [],
        milestones: [],
        created_at: authUser.created_at,
      });
    }

    return Response.json(mapProfileRow(row));
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

    const row = await (await getPrisma()).profiles.update({
      where: { id: user.id },
      data: { milestones },
    });

    return Response.json(mapProfileRow(row));
  } catch (err: any) {
    console.error("profiles PATCH error:", err);
    return Response.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
