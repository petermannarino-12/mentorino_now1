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
    if (!body.email) {
      return Response.json({ error: "Missing email" }, { status: 400 });
    }

    const { error } = await getSupabase()
      .from('newsletter_subscribers')
      .insert({ email: body.email.toLowerCase().trim() });
    if (error) throw error;

    return Response.json({ message: "Subscribed successfully" });
  } catch (error: any) {
    console.error("Newsletter Error:", error);
    return Response.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
