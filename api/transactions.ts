import { getPrisma } from './prisma.js';
import { getUserFromToken } from './auth.js';

export async function POST(request: Request) {
  try {
    const user = await getUserFromToken(request);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const profile = await (await getPrisma()).profiles.findUnique({
      where: { id: user.id },
      select: { role: true },
    });
    if (!profile || profile.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    if (!body.product_id || !body.amount) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const data = await (await getPrisma()).transactions.create({
      data: {
        userId: body.user_id || user.id,
        userName: body.user_name || user.email || "",
        amount: body.amount,
        product: body.product || "",
        productId: body.product_id,
        status: body.status || "pending",
      },
    });

    return Response.json({ id: data.id, message: "Transaction created" });
  } catch (error: any) {
    console.error("Transactions Error:", error);
    return Response.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
