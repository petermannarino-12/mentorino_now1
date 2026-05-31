import { getPrisma } from './prisma.js';
import { checkRateLimit } from './rate-limit.js';

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (!checkRateLimit(ip, 10, 60_000)) return Response.json({ error: 'Too many requests' }, { status: 429 });

    const body = await request.json();
    if (!body.email) {
      return Response.json({ error: "Missing email" }, { status: 400 });
    }

    await (await getPrisma()).newsletter_subscribers.upsert({
      where: { email: body.email.toLowerCase().trim() },
      update: {},
      create: { email: body.email.toLowerCase().trim() },
    });

    return Response.json({ message: "Subscribed successfully" });
  } catch (error: any) {
    console.error("Newsletter Error:", error);
    return Response.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
