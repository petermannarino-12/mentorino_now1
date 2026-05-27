import { Handler } from "@netlify/functions";
import { prisma } from "../_shared/prisma";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  try {
    const body = JSON.parse(event.body || "{}");
    if (!body.email) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing email" }) };
    }

    await prisma.newsletter_subscribers.create({
      data: { email: body.email.toLowerCase().trim() },
    });

    return { statusCode: 200, body: JSON.stringify({ message: "Subscribed successfully" }) };
  } catch (error: any) {
    console.error("Newsletter Error:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message || "Internal server error" }) };
  }
};
