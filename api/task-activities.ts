import { getAuth, getUserFromToken } from './auth.js';
import { captureException } from './sentry.js';

const SNAKE_FIELDS = [
  'admin_response', 'pb_card_details', 'pb_linkedin_url', 'pb_resume_link',
  'pb_cover_letter_link', 'pb_dress_code_notes', 'pb_greeting_intro_notes',
  'net_attended_event', 'net_people_met', 'net_contact_info', 'net_panel_summary',
  'pw_introduction', 'pw_volunteer_hours', 'cert_topic', 'roadmap_topic',
  'interview_recommendation',
] as const;

function mapTaskActivity(t: any) {
  const result: Record<string, any> = { id: t.id, user_id: t.user_id, user_name: t.user_name, status: t.status, created_at: t.created_at };
  for (const f of SNAKE_FIELDS) {
    if (t[f] !== undefined) result[f] = t[f];
  }
  return result;
}

function pickFields(b: any) {
  const result: Record<string, any> = {};
  for (const f of SNAKE_FIELDS) {
    if (b[f] !== undefined) result[f] = b[f];
  }
  if (b.admin_response !== undefined) result.admin_response = b.admin_response;
  return result;
}

export async function GET(request: Request) {
  try {
    const user = await getUserFromToken(request);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const from = parseInt(url.searchParams.get("from") || "0");
    const to = parseInt(url.searchParams.get("to") || "49");

    const supabase = await getAuth();
    let query = supabase.from('task_activities').select('*').order('created_at', { ascending: false }).range(from, to);
    if (userId) query = query.eq('user_id', userId);

    const { data, error } = await query;
    if (error) throw error;

    return Response.json((data || []).map(mapTaskActivity));
  } catch (err: any) {
    captureException(err, { handler: 'task-activities GET' });
    console.error("task-activities GET error:", err);
    return Response.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromToken(request);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const supabase = await getAuth();

    if (body.id) {
      const { data, error } = await supabase.from('task_activities').update(pickFields(body)).eq('id', body.id).select().single();
      if (error) throw error;
      return Response.json(mapTaskActivity(data));
    }

    const { data, error } = await supabase.from('task_activities').insert({
      user_id: body.user_id || user.id,
      user_name: body.user_name || "",
      status: body.status || "pending",
      ...pickFields(body),
    }).select().single();

    if (error) throw error;

    return Response.json(mapTaskActivity(data));
  } catch (err: any) {
    captureException(err, { handler: 'task-activities POST' });
    console.error("task-activities POST error:", err);
    return Response.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
