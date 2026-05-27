import { Handler } from "@netlify/functions";
import { prisma } from "../_shared/prisma";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  try {
    const body = JSON.parse(event.body || "{}");
    if (!body.reviewer_name || !body.reviewer_email || !body.rating) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing required fields" }) };
    }

    const data = await prisma.reviews.create({
      data: {
        reviewerName: body.reviewer_name,
        reviewerEmail: body.reviewer_email,
        rating: body.rating,
        comment: body.comment || null,
      },
    });

    return { statusCode: 200, body: JSON.stringify({ id: data.id, message: "Review submitted" }) };
  } catch (error: any) {
    console.error("Reviews Error:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message || "Internal server error" }) };
  }
};
