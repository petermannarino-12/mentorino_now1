import { Handler } from "@netlify/functions";
import { supabase } from "../_shared/supabase-client";
import { prisma } from "../_shared/prisma";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "DELETE") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const token = event.headers.authorization?.split(" ")[1];
    if (!token) return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized" }) };

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return { statusCode: 401, body: JSON.stringify({ error: "Invalid token" }) };

    const profile = await prisma.profiles.findUnique({
      where: { id: user.id },
      select: { role: true },
    });

    if (!profile || !["admin", "mentor"].includes(profile.role)) {
      return { statusCode: 403, body: JSON.stringify({ error: "Forbidden" }) };
    }

    const id = event.queryStringParameters?.id;
    if (!id) return { statusCode: 400, body: JSON.stringify({ error: "Missing ID" }) };

    const application = await prisma.applications.findUnique({
      where: { id },
      select: { userEmail: true },
    });

    if (!application) {
      return { statusCode: 404, body: JSON.stringify({ error: "Application not found" }) };
    }

    const email = application.userEmail.toLowerCase().trim();

    const targetProfile = await prisma.profiles.findUnique({
      where: { email },
      select: { id: true },
    });

    if (targetProfile) {
      const { error: authDeleteError } = await supabase.auth.admin.deleteUser(targetProfile.id);
      if (authDeleteError) {
        console.error("Auth Delete Error:", authDeleteError);
      }
    }

    await prisma.applications.delete({ where: { id } });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Mentee and application deleted successfully" }),
    };
  } catch (error: any) {
    console.error("Delete Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Failed to delete application" }),
    };
  }
};
