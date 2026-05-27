import { createClient } from '@supabase/supabase-js';

function getClient() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(`Missing Supabase env vars: ${!url ? 'VITE_SUPABASE_URL' : ''} ${!key ? 'SUPABASE_SERVICE_ROLE_KEY' : ''}`);
  }
  return createClient(url, key);
}

let _supabase: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (!_supabase) _supabase = getClient();
  return _supabase;
}
