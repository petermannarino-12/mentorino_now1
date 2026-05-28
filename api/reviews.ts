import { getPrisma } from './prisma.js';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.reviewer_name || !body.reviewer_email || !body.rating) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const data = await (await getPrisma()).reviews.create({
      data: {
        reviewerName: body.reviewer_name,
        reviewerEmail: body.reviewer_email,
        rating: body.rating,
        comment: body.comment || null,
      },
    });

    return Response.json({ id: data.id, message: "Review submitted" });
  } catch (error: any) {
    console.error("Reviews Error:", error);
    return Response.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
