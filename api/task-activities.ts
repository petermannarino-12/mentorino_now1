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

function mapTaskActivity(t: any) {
  return {
    id: t.id,
    user_id: t.userId,
    user_name: t.userName,
    status: t.status,
    admin_response: t.adminResponse,
    created_at: t.createdAt,
    pb_card_details: t.pbCardDetails,
    pb_linkedin_url: t.pbLinkedinUrl,
    pb_resume_link: t.pbResumeLink,
    pb_cover_letter_link: t.pbCoverLetterLink,
    pb_dress_code_notes: t.pbDressCodeNotes,
    pb_greeting_intro_notes: t.pbGreetingIntroNotes,
    net_attended_event: t.netAttendedEvent,
    net_people_met: t.netPeopleMet,
    net_contact_info: t.netContactInfo,
    net_panel_summary: t.netPanelSummary,
    pw_introduction: t.pwIntroduction,
    pw_volunteer_hours: t.pwVolunteerHours,
    cert_topic: t.certTopic,
    roadmap_topic: t.roadmapTopic,
    interview_recommendation: t.interviewRecommendation,
  };
}

function toPrismaData(b: any) {
  const result: Record<string, any> = {};
  if (b.admin_response !== undefined) result.adminResponse = b.admin_response;
  if (b.pb_card_details !== undefined) result.pbCardDetails = b.pb_card_details;
  if (b.pb_linkedin_url !== undefined) result.pbLinkedinUrl = b.pb_linkedin_url;
  if (b.pb_resume_link !== undefined) result.pbResumeLink = b.pb_resume_link;
  if (b.pb_cover_letter_link !== undefined) result.pbCoverLetterLink = b.pb_cover_letter_link;
  if (b.pb_dress_code_notes !== undefined) result.pbDressCodeNotes = b.pb_dress_code_notes;
  if (b.pb_greeting_intro_notes !== undefined) result.pbGreetingIntroNotes = b.pb_greeting_intro_notes;
  if (b.net_attended_event !== undefined) result.netAttendedEvent = b.net_attended_event;
  if (b.net_people_met !== undefined) result.netPeopleMet = b.net_people_met;
  if (b.net_contact_info !== undefined) result.netContactInfo = b.net_contact_info;
  if (b.net_panel_summary !== undefined) result.netPanelSummary = b.net_panel_summary;
  if (b.pw_introduction !== undefined) result.pwIntroduction = b.pw_introduction;
  if (b.pw_volunteer_hours !== undefined) result.pwVolunteerHours = b.pw_volunteer_hours;
  if (b.cert_topic !== undefined) result.certTopic = b.cert_topic;
  if (b.roadmap_topic !== undefined) result.roadmapTopic = b.roadmap_topic;
  if (b.interview_recommendation !== undefined) result.interviewRecommendation = b.interview_recommendation;
  return result;
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
    const userId = url.searchParams.get("userId");
    const from = parseInt(url.searchParams.get("from") || "0");
    const to = parseInt(url.searchParams.get("to") || "49");

    const where = userId ? { userId } : {};
    const data = await (await getPrisma()).task_activities.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: from,
      take: to - from + 1,
    });

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
      const data = await (await getPrisma()).task_activities.update({
        where: { id: body.id },
        data: toPrismaData(body),
      });
      return Response.json(mapTaskActivity(data));
    }

    const data = await (await getPrisma()).task_activities.create({
      data: {
        userId: body.user_id || user.id,
        userName: body.user_name || "",
        status: body.status || "pending",
        ...toPrismaData(body),
      },
    });

    return Response.json(mapTaskActivity(data));
  } catch (err: any) {
    console.error("task-activities POST error:", err);
    return Response.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
