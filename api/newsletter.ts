import { getPrisma } from './prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.email) {
      return Response.json({ error: "Missing email" }, { status: 400 });
    }

    await (await getPrisma()).newsletter_subscribers.create({
      data: { email: body.email.toLowerCase().trim() },
    });

    return Response.json({ message: "Subscribed successfully" });
  } catch (error: any) {
    console.error("Newsletter Error:", error);
    return Response.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
