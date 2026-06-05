import { getPrisma } from './prisma.js';
import { getUserFromToken } from './auth.js';

function mapEnquiry(row: any) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    service_type: row.service_type,
    message: row.message,
    status: row.status,
    created_at: row.created_at,
  };
}

export async function GET(request: Request) {
  try {
    const user = await getUserFromToken(request);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const profile = await (await getPrisma()).profiles.findUnique({
      where: { id: user.id },
      select: { role: true },
    });
    if (!profile || !['admin', 'mentor'].includes(profile.role!)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    await ensureTable();

    const rows = await (await getPrisma()).$queryRawUnsafe(
      'SELECT * FROM public.enquiries ORDER BY created_at DESC'
    );

    return Response.json((rows as any[]).map(mapEnquiry));
  } catch (err: any) {
    console.error('enquiries GET error:', err);
    return Response.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

let _tableEnsured = false;

async function ensureTable() {
  if (_tableEnsured) return;
  try {
    await (await getPrisma()).$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS public.enquiries (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        service_type TEXT NOT NULL CHECK (service_type IN ('free_intro_call', 'rapid_response_call')),
        message TEXT,
        status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      );
    `);
    _tableEnsured = true;
  } catch {}
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.email || !body.service_type) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (!['free_intro_call', 'rapid_response_call'].includes(body.service_type)) {
      return Response.json({ error: 'Invalid service_type' }, { status: 400 });
    }

    await ensureTable();

    const rows = await (await getPrisma()).$queryRawUnsafe(
      `INSERT INTO public.enquiries (name, email, phone, service_type, message)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      body.name.trim(),
      body.email.toLowerCase().trim(),
      body.phone || null,
      body.service_type,
      body.message || null
    );

    return Response.json(mapEnquiry((rows as any[])[0]));
  } catch (err: any) {
    console.error('enquiries POST error:', err);
    return Response.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await ensureTable();

    const user = await getUserFromToken(request);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const profile = await (await getPrisma()).profiles.findUnique({
      where: { id: user.id },
      select: { role: true },
    });
    if (!profile || !['admin', 'mentor'].includes(profile.role!)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    if (!body.id) return Response.json({ error: 'Missing id' }, { status: 400 });
    if (!body.status || !['new', 'contacted', 'closed'].includes(body.status)) {
      return Response.json({ error: 'Invalid status' }, { status: 400 });
    }

    await (await getPrisma()).$executeRawUnsafe(
      'UPDATE public.enquiries SET status = $1 WHERE id = $2',
      body.status,
      body.id
    );

    return Response.json({ message: 'Status updated' });
  } catch (err: any) {
    console.error('enquiries PATCH error:', err);
    return Response.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
