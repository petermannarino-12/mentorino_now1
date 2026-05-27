import { Handler } from "@netlify/functions";
import { supabase } from "../_shared/supabase-client";
import { prisma } from "../_shared/prisma";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  try {
    const token = event.headers.authorization?.split(" ")[1];
    if (!token) return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized" }) };
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return { statusCode: 401, body: JSON.stringify({ error: "Invalid token" }) };

    const body = JSON.parse(event.body || "{}");
    if (!body.product_id || !body.amount) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing required fields" }) };
    }

    const data = await prisma.transactions.create({
      data: {
        userId: body.user_id || user.id,
        userName: body.user_name || user.email || "",
        amount: body.amount,
        product: body.product || "",
        productId: body.product_id,
        status: body.status || "pending",
      },
    });

    return { statusCode: 200, body: JSON.stringify({ id: data.id, message: "Transaction created" }) };
  } catch (error: any) {
    console.error("Transactions Error:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message || "Internal server error" }) };
  }
};
