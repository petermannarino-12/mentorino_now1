import { getAuth, getUserFromToken } from './auth.js';
import { captureException } from './sentry.js';

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

    const supabase = await getAuth();
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
    if (!profile || !['admin', 'mentor'].includes(profile.role!)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await supabase.from('enquiries').select('*').order('created_at', { ascending: false });
    if (error) throw error;

    return Response.json((data || []).map(mapEnquiry));
  } catch (err: any) {
    captureException(err, { handler: 'enquiries GET' });
    console.error('enquiries GET error:', err);
    return Response.json({ error: err?.message || String(err) }, { status: 500 });
  }
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

    const supabase = await getAuth();
    const { data, error } = await supabase.from('enquiries').insert({
      name: body.name.trim(),
      email: body.email.toLowerCase().trim(),
      phone: body.phone || null,
      service_type: body.service_type,
      message: body.message || null,
    }).select().single();

    if (error) throw error;

    return Response.json(mapEnquiry(data));
  } catch (err: any) {
    captureException(err, { handler: 'enquiries POST' });
    console.error('enquiries POST error:', err);
    return Response.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getUserFromToken(request);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = await getAuth();
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
    if (!profile || !['admin', 'mentor'].includes(profile.role!)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    if (!body.id) return Response.json({ error: 'Missing id' }, { status: 400 });
    if (!body.status || !['new', 'contacted', 'closed'].includes(body.status)) {
      return Response.json({ error: 'Invalid status' }, { status: 400 });
    }

    const { error } = await supabase.from('enquiries').update({ status: body.status }).eq('id', body.id);
    if (error) throw error;

    return Response.json({ message: 'Status updated' });
  } catch (err: any) {
    captureException(err, { handler: 'enquiries PATCH' });
    console.error('enquiries PATCH error:', err);
    return Response.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
