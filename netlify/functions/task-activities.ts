import { Handler } from "@netlify/functions";
import { supabase } from "../_shared/supabase-client";
import { prisma } from "../_shared/prisma";

export const handler: Handler = async (event) => {
  try {
    switch (event.httpMethod) {
      case "GET": return handleGet(event);
      case "POST": return handlePost(event);
      default: return { statusCode: 405, body: "Method Not Allowed" };
    }
  } catch (error: any) {
    console.error("TaskActivities Error:", error);
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
  const data = await prisma.task_activities.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: from,
    take: to - from + 1,
  });

  return { statusCode: 200, body: JSON.stringify(data.map(mapTaskActivity)) };
}

async function handlePost(event: any) {
  const token = event.headers.authorization?.split(" ")[1];
  if (!token) return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized" }) };
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return { statusCode: 401, body: JSON.stringify({ error: "Invalid token" }) };

  const body = JSON.parse(event.body || "{}");

  if (body.id) {
    const data = await prisma.task_activities.update({
      where: { id: body.id },
      data: toPrismaTask(body),
    });
    return { statusCode: 200, body: JSON.stringify(mapTaskActivity(data)) };
  }

  const data = await prisma.task_activities.create({
    data: {
      userId: body.user_id || user.id,
      userName: body.user_name || "",
      status: body.status || "pending",
      ...toPrismaTask(body),
    },
  });

  return { statusCode: 200, body: JSON.stringify(mapTaskActivity(data)) };
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
