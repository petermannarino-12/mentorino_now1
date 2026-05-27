import { getSupabase } from "./_lib/supabase-client";
import { getPrisma } from "./_lib/prisma";

export async function POST(request: Request) {
  const token = request.headers.get("authorization")?.split(" ")[1];
  if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { data: { user }, error: authError } = await getSupabase().auth.getUser(token);
  if (authError || !user) return Response.json({ error: "Invalid token" }, { status: 401 });

  try {
    const body = await request.json();
    if (!body.product_id || !body.amount) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const data = await getPrisma().transactions.create({
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
