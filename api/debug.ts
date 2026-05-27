export async function GET() {
  const results: Record<string, any> = {};

  // Check env vars
  results.env = {
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL ? 'SET' : 'MISSING',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING',
    DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'MISSING',
    NODE_ENV: process.env.NODE_ENV,
  };

  // Try importing supabase
  try {
    const mod = await import('./_lib/supabase-client');
    results.supabaseImport = 'OK';
    try {
      const sb = mod.getSupabase();
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
  } catch (e: any) {
    results.supabaseImport = `Error: ${e?.message || e}`;
  }

  // Try importing prisma
  try {
    const mod = await import('./_lib/prisma');
    results.prismaImport = 'OK';
    try {
      const p = await mod.getPrisma();
      results.prismaInit = 'OK';
    } catch (e: any) {
      results.prismaInit = `Error: ${e?.message || e}`;
    }
  } catch (e: any) {
    results.prismaImport = `Error: ${e?.message || e}`;
  }

  return Response.json(results);
}
