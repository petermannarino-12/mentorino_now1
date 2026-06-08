import { getAuth } from './auth.js';

export async function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const supabase = await getAuth();
    const cutoff = new Date(Date.now() - windowMs).toISOString();

    const { count, error } = await supabase.from('rate_limit_entries')
      .select('*', { count: 'exact', head: true })
      .eq('identifier', identifier)
      .gte('created_at', cutoff);

    if (error) throw error;

    return {
      allowed: (count || 0) < maxRequests,
      remaining: Math.max(0, maxRequests - (count || 0)),
    };
  } catch {
    return { allowed: true, remaining: maxRequests };
  }
}

export async function recordRateLimit(identifier: string): Promise<void> {
  try {
    const supabase = await getAuth();
    await supabase.from('rate_limit_entries').insert({ identifier });
  } catch {
    // fail open — rate limiting should never block the app
  }
}
