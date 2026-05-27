import { supabase } from "./_lib/supabase-client";
import { prisma } from "./_lib/prisma";

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

function toPrismaTask(b: any) {
  return {
    adminResponse: b.admin_response,
    pbCardDetails: b.pb_card_details,
    pbLinkedinUrl: b.pb_linkedin_url,
    pbResumeLink: b.pb_resume_link,
    pbCoverLetterLink: b.pb_cover_letter_link,
    pbDressCodeNotes: b.pb_dress_code_notes,
    pbGreetingIntroNotes: b.pb_greeting_intro_notes,
    netAttendedEvent: b.net_attended_event,
    netPeopleMet: b.net_people_met,
    netContactInfo: b.net_contact_info,
    netPanelSummary: b.net_panel_summary,
    pwIntroduction: b.pw_introduction,
    pwVolunteerHours: b.pw_volunteer_hours,
    certTopic: b.cert_topic,
    roadmapTopic: b.roadmap_topic,
    interviewRecommendation: b.interview_recommendation,
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
  const user = await getUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");
  const from = parseInt(url.searchParams.get("from") || "0");
  const to = parseInt(url.searchParams.get("to") || "49");

  const where = userId ? { userId } : {};
  const data = await prisma.task_activities.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: from,
    take: to - from + 1,
  });

  return Response.json(data.map(mapTaskActivity));
}

export async function POST(request: Request) {
  const user = await getUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  if (body.id) {
    const data = await prisma.task_activities.update({
      where: { id: body.id },
      data: toPrismaTask(body),
    });
    return Response.json(mapTaskActivity(data));
  }

  const data = await prisma.task_activities.create({
    data: {
      userId: body.user_id || user.id,
      userName: body.user_name || "",
      status: body.status || "pending",
      ...toPrismaTask(body),
    },
  });

  return Response.json(mapTaskActivity(data));
}
