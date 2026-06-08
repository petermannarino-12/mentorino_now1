import { getAuth, getUserFromToken } from './auth.js';
import { captureException } from './sentry.js';

function mapProfileRow(row: any) {
  return {
    id: row.id,
    email: row.email,
    full_name: row.full_name,
    name: row.name || row.full_name,
    role: row.role,
    phone: row.phone,
    avatar: row.avatar,
    mentorship_status: row.mentorship_status,
    tasks: row.tasks || [],
    milestones: row.milestones || [],
    created_at: row.created_at,
  };
}

export async function GET(request: Request) {
  try {
    const user = await getUserFromToken(request);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(request.url);
    const limit = url.searchParams.get("limit");
    const id = url.searchParams.get("id") || user.id;
    const supabase = await getAuth();

    if (limit) {
      const { data, error } = await supabase.from('profiles').select('*').limit(parseInt(limit) || 50);
      if (error) throw error;
      return Response.json((data || []).map(mapProfileRow));
    }

    const { data: row, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
    if (error) throw error;

    if (!row) {
      return Response.json({
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
        role: user.user_metadata?.role || 'user',
        phone: '',
        avatar: null,
        mentorship_status: null,
        tasks: [],
        milestones: [],
        created_at: user.created_at,
      });
    }

    return Response.json(mapProfileRow(row));
  } catch (err: any) {
    captureException(err, { handler: 'profiles GET' });
    console.error("profiles GET error:", err);
    return Response.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getUserFromToken(request);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const updateData: Record<string, any> = {};
    if (body.milestones) updateData.milestones = body.milestones;
    if (body.tasks) updateData.tasks = body.tasks;
    if (body.name) updateData.name = body.name;
    if (body.phone) updateData.phone = body.phone;
    if (Object.keys(updateData).length === 0) {
      return Response.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const supabase = await getAuth();
    const { data, error } = await supabase.from('profiles').update(updateData).eq('id', user.id).select().single();
    if (error) throw error;

    return Response.json(mapProfileRow(data));
  } catch (err: any) {
    captureException(err, { handler: 'profiles PATCH' });
    console.error("profiles PATCH error:", err);
    return Response.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
