import { supabaseServer } from '../lib/supabase-server.js';

export async function checkAuth(event: any) {
  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Missing or invalid Authorization header', status: 401 };
  }
  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabaseServer.auth.getUser(token);
  if (error || !user) {
    return { error: 'Invalid token', status: 401 };
  }
  return { user };
}
