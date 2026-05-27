import { createClient } from '@supabase/supabase-js';

function getSupabase() {
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
    full_name: row.full_name,
    name: row.name,
    role: row.role,
    phone: row.phone,
    avatar: row.avatar,
    mentorship_status: row.mentorship_status,
    tasks: row.tasks,
    milestones: row.milestones,
    created_at: row.created_at,
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
    const user = await getUser(request);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(request.url);
    const limit = url.searchParams.get("limit");
    const id = url.searchParams.get("id") || user.id;

    if (limit) {
      const { data: rows, error } = await getSupabase()
        .from('profiles')
        .select('*')
        .limit(parseInt(limit) || 50);
      if (error) throw error;
      return Response.json((rows || []).map(mapProfileRow));
    }

    const { data: row, error } = await getSupabase()
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    if (!row) return Response.json({ error: "Profile not found" }, { status: 404 });

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

    const { data: row, error } = await getSupabase()
      .from('profiles')
      .update({ milestones })
      .eq('id', user.id)
      .select()
      .single();
    if (error) throw error;

    return Response.json(mapProfileRow(row));
  } catch (err: any) {
    console.error("profiles PATCH error:", err);
    return Response.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
