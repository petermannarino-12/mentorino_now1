let _supabaseAdmin: any = null;

export async function getAuth() {
  if (_supabaseAdmin) return _supabaseAdmin;
  const { createClient } = await import('@supabase/supabase-js');
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error(`Missing Supabase env vars: ${!url ? 'VITE_SUPABASE_URL' : ''} ${!key ? 'SUPABASE_SERVICE_ROLE_KEY' : ''}`);
  _supabaseAdmin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return _supabaseAdmin;
}

export async function getUserFromToken(request: Request) {
  const token = request.headers.get('authorization')?.split(' ')[1];
  if (!token) return null;
  const supabase = await getAuth();
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

export async function requireUser(request: Request): Promise<{ user: any }> {
  const user = await getUserFromToken(request);
  if (!user) {
    const err = new Error('Unauthorized');
    (err as any).status = 401;
    throw err;
  }
  return { user };
}

export async function requireRole(request: Request, roles: string[]): Promise<{ user: any }> {
  const { user } = await requireUser(request);
  const { getPrisma } = await import('./prisma.js');
  const profile = await (await getPrisma()).profiles.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  if (!profile || !roles.includes(profile.role!)) {
    const err = new Error('Forbidden');
    (err as any).status = 403;
    throw err;
  }
  return { user };
}

export function mapProfileRow(row: any) {
  return {
    id: row.id,
    email: row.email,
    full_name: row.fullName,
    name: row.name || row.fullName,
    role: row.role,
    phone: row.phone,
    avatar: row.avatar,
    mentorship_status: row.mentorshipStatus,
    tasks: row.tasks || [],
    milestones: row.milestones || [],
    created_at: row.createdAt,
  };
}
