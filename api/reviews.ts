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
  try {
    const body = await request.json();
    if (!body.reviewer_name || !body.reviewer_email || !body.rating) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data, error } = await getSupabase()
      .from('reviews')
      .insert({
        reviewer_name: body.reviewer_name,
        reviewer_email: body.reviewer_email,
        rating: body.rating,
        comment: body.comment || null,
      })
      .select()
      .single();
    if (error) throw error;

    return Response.json({ id: data.id, message: "Review submitted" });
  } catch (error: any) {
    console.error("Reviews Error:", error);
    return Response.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
