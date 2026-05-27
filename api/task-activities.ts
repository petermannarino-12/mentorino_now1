import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(`Missing Supabase env vars: ${!url ? 'VITE_SUPABASE_URL' : ''} ${!key ? 'SUPABASE_SERVICE_ROLE_KEY' : ''}`);
  }
  return createClient(url, key);
}

function mapTaskActivity(t: any) {
  return {
    id: t.id,
    user_id: t.user_id,
    user_name: t.user_name,
    status: t.status,
    admin_response: t.admin_response,
    created_at: t.created_at,
    pb_card_details: t.pb_card_details,
    pb_linkedin_url: t.pb_linkedin_url,
    pb_resume_link: t.pb_resume_link,
    pb_cover_letter_link: t.pb_cover_letter_link,
    pb_dress_code_notes: t.pb_dress_code_notes,
    pb_greeting_intro_notes: t.pb_greeting_intro_notes,
    net_attended_event: t.net_attended_event,
    net_people_met: t.net_people_met,
    net_contact_info: t.net_contact_info,
    net_panel_summary: t.net_panel_summary,
    pw_introduction: t.pw_introduction,
    pw_volunteer_hours: t.pw_volunteer_hours,
    cert_topic: t.cert_topic,
    roadmap_topic: t.roadmap_topic,
    interview_recommendation: t.interview_recommendation,
  };
}

function toSupabaseTask(b: any) {
  const result: Record<string, any> = {};
  if (b.admin_response !== undefined) result.admin_response = b.admin_response;
  if (b.pb_card_details !== undefined) result.pb_card_details = b.pb_card_details;
  if (b.pb_linkedin_url !== undefined) result.pb_linkedin_url = b.pb_linkedin_url;
  if (b.pb_resume_link !== undefined) result.pb_resume_link = b.pb_resume_link;
  if (b.pb_cover_letter_link !== undefined) result.pb_cover_letter_link = b.pb_cover_letter_link;
  if (b.pb_dress_code_notes !== undefined) result.pb_dress_code_notes = b.pb_dress_code_notes;
  if (b.pb_greeting_intro_notes !== undefined) result.pb_greeting_intro_notes = b.pb_greeting_intro_notes;
  if (b.net_attended_event !== undefined) result.net_attended_event = b.net_attended_event;
  if (b.net_people_met !== undefined) result.net_people_met = b.net_people_met;
  if (b.net_contact_info !== undefined) result.net_contact_info = b.net_contact_info;
  if (b.net_panel_summary !== undefined) result.net_panel_summary = b.net_panel_summary;
  if (b.pw_introduction !== undefined) result.pw_introduction = b.pw_introduction;
  if (b.pw_volunteer_hours !== undefined) result.pw_volunteer_hours = b.pw_volunteer_hours;
  if (b.cert_topic !== undefined) result.cert_topic = b.cert_topic;
  if (b.roadmap_topic !== undefined) result.roadmap_topic = b.roadmap_topic;
  if (b.interview_recommendation !== undefined) result.interview_recommendation = b.interview_recommendation;
  return result;
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
    const userId = url.searchParams.get("userId");
    const from = parseInt(url.searchParams.get("from") || "0");
    const to = parseInt(url.searchParams.get("to") || "49");

    let query = getSupabase()
      .from('task_activities')
      .select('*')
      .order('created_at', { ascending: false });
    if (userId) query = query.eq('user_id', userId);
    const { data, error } = await query.range(from, to);
    if (error) throw error;

    return Response.json((data || []).map(mapTaskActivity));
  } catch (err: any) {
    console.error("task-activities GET error:", err);
    return Response.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUser(request);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();

    if (body.id) {
      const { data, error } = await getSupabase()
        .from('task_activities')
        .update(toSupabaseTask(body))
        .eq('id', body.id)
        .select()
        .single();
      if (error) throw error;
      return Response.json(mapTaskActivity(data));
    }

    const { data, error } = await getSupabase()
      .from('task_activities')
      .insert({
        user_id: body.user_id || user.id,
        user_name: body.user_name || "",
        status: body.status || "pending",
        ...toSupabaseTask(body),
      })
      .select()
      .single();
    if (error) throw error;

    return Response.json(mapTaskActivity(data));
  } catch (err: any) {
    console.error("task-activities POST error:", err);
    return Response.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
