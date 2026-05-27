import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(`Missing Supabase env vars: ${!url ? 'VITE_SUPABASE_URL' : ''} ${!key ? 'SUPABASE_SERVICE_ROLE_KEY' : ''}`);
  }
  return createClient(url, key);
}

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

    const { data, error } = await getSupabase()
      .from('transactions')
      .insert({
        user_id: body.user_id || user.id,
        user_name: body.user_name || user.email || "",
        amount: body.amount,
        product: body.product || "",
        product_id: body.product_id,
        status: body.status || "pending",
      })
      .select()
      .single();
    if (error) throw error;

    return Response.json({ id: data.id, message: "Transaction created" });
  } catch (error: any) {
    console.error("Transactions Error:", error);
    return Response.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
