import { Handler } from "@netlify/functions";
import { prisma } from "../_shared/prisma";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { email } = JSON.parse(event.body || "{}");
    if (!email) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing email" }) };
    }

    const application = await prisma.applications.findUnique({
      where: { userEmail: email.toLowerCase().trim() },
      select: { status: true },
    });

    const isApproved = application?.status === "approved";

    return {
      statusCode: 200,
      body: JSON.stringify({ is_approved: isApproved }),
    };
  } catch (error: any) {
    console.error("check-application Error:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message || "Internal server error" }) };
  }
};
