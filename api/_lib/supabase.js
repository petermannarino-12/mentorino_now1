import { createClient } from '@supabase/supabase-js';

let _supabase = null;

export function getSupabase() {
  if (_supabase) return _supabase;
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing Supabase env vars: ' + (!url ? 'VITE_SUPABASE_URL' : '') + ' ' + (!key ? 'SUPABASE_SERVICE_ROLE_KEY' : ''));
  }
  _supabase = createClient(url, key);
  return _supabase;
}
