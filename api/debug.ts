import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(`Missing Supabase env vars: ${!url ? 'VITE_SUPABASE_URL' : ''} ${!key ? 'SUPABASE_SERVICE_ROLE_KEY' : ''}`);
  }
  return createClient(url, key);
}

export async function GET() {
  const results: Record<string, any> = {};

  results.env = {
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL ? 'SET' : 'MISSING',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING',
    NODE_ENV: process.env.NODE_ENV,
  };

  try {
    const sb = getSupabase();
    results.supabaseInit = 'OK';
    try {
      const { data } = await sb.auth.getUser('fake-token');
      results.supabaseAuth = `Responded: ${JSON.stringify(data)}`;
    } catch (e: any) {
      results.supabaseAuth = `Error: ${e?.message || e}`;
    }
  } catch (e: any) {
    results.supabaseInit = `Error: ${e?.message || e}`;
  }

  return Response.json(results);
}
