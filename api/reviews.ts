import { getPrisma } from './prisma.js';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.reviewer_name || !body.reviewer_email || body.rating === undefined) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const email = body.reviewer_email.toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "Invalid email format" }, { status: 400 });
    }

    const rating = parseInt(body.rating);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      return Response.json({ error: "Rating must be a number between 1 and 5" }, { status: 400 });
    }

    if (body.reviewer_name.length > 100) {
      return Response.json({ error: "Name too long" }, { status: 400 });
    }

    // Rate limit: max 3 reviews per email per 5 minutes
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recent = await (await getPrisma()).reviews.findMany({
      where: {
        reviewerEmail: email,
        createdAt: { gte: fiveMinAgo },
      },
    });
    if (recent.length >= 3) {
      return Response.json({ error: "Too many reviews. Please wait a few minutes." }, { status: 429 });
    }

    const data = await (await getPrisma()).reviews.create({
      data: {
        reviewerName: body.reviewer_name.trim().slice(0, 100),
        reviewerEmail: email,
        rating,
        comment: body.comment ? body.comment.trim().slice(0, 2000) : null,
      },
    });

    return Response.json({ id: data.id, message: "Review submitted" });
  } catch (error: any) {
    console.error("Reviews Error:", error);
    return Response.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
