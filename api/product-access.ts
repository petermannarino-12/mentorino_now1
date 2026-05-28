import { getPrisma } from './prisma.js'

async function getSupabase() {
  const { createClient } = await import('@supabase/supabase-js')
  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase env vars')
  return createClient(url, key)
}

async function handleRequest(request: Request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1]
    if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    const supabase = await getSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) return Response.json({ error: 'Invalid token' }, { status: 401 })

    const { product_id, product_name, message } = await request.json()
    if (!product_id || !product_name) {
      return Response.json({ error: 'Missing product_id or product_name' }, { status: 400 })
    }

    const prisma = await getPrisma()

    const existing = await prisma.$queryRawUnsafe(
      `SELECT id FROM public.product_access_requests
       WHERE student_id = $1 AND product_id = $2 AND status = 'pending'
       LIMIT 1`,
      user.id, product_id
    )
    if ((existing as any[]).length > 0) {
      return Response.json({ error: 'You already have a pending request for this product' }, { status: 409 })
    }

    await prisma.$executeRawUnsafe(
      `INSERT INTO public.product_access_requests (student_id, student_name, student_email, product_id, product_name, message)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      user.id, user.user_metadata?.full_name || 'Student', user.email!, product_id, product_name, message || null
    )

    return Response.json({ message: 'Access request sent' })
  } catch (error: any) {
    console.error('request-access error:', error)
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

async function handleGrant(request: Request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1]
    if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    const supabase = await getSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) return Response.json({ error: 'Invalid token' }, { status: 401 })

    const profile = await (await getPrisma()).profiles.findUnique({
      where: { id: user.id },
      select: { role: true },
    })
    if (!profile || !['admin', 'mentor'].includes(profile.role!)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { request_id, action, mentor_notes } = await request.json()
    if (!request_id || !['grant', 'deny'].includes(action)) {
      return Response.json({ error: 'Invalid parameters' }, { status: 400 })
    }

    const prisma = await getPrisma()

    if (action === 'grant') {
      await prisma.$executeRawUnsafe(
        `UPDATE public.product_access_requests
         SET status = 'granted', mentor_notes = $2, granted_at = NOW()
         WHERE id = $1`,
        request_id, mentor_notes || null
      )
    } else {
      await prisma.$executeRawUnsafe(
        `UPDATE public.product_access_requests
         SET status = 'denied', mentor_notes = $2
         WHERE id = $1`,
        request_id, mentor_notes || null
      )
    }

    return Response.json({ message: `Access ${action === 'grant' ? 'granted' : 'denied'}` })
  } catch (error: any) {
    console.error('grant-access error:', error)
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

async function handleList(request: Request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1]
    if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    const supabase = await getSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) return Response.json({ error: 'Invalid token' }, { status: 401 })

    const profile = await (await getPrisma()).profiles.findUnique({
      where: { id: user.id },
      select: { role: true },
    })
    if (!profile || !['admin', 'mentor'].includes(profile.role!)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const url = new URL(request.url)
    const statusFilter = url.searchParams.get('status')

    const prisma = await getPrisma()
    let sql = 'SELECT * FROM public.product_access_requests'
    const params: any[] = []

    if (statusFilter && ['pending', 'granted', 'denied'].includes(statusFilter)) {
      sql += ' WHERE status = $1'
      params.push(statusFilter)
    }
    sql += ' ORDER BY created_at DESC'

    const rows = await prisma.$queryRawUnsafe(sql, ...params)
    return Response.json({ requests: rows })
  } catch (error: any) {
    console.error('list-requests error:', error)
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

async function handleMyAccess(request: Request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1]
    if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    const supabase = await getSupabase()
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) return Response.json({ error: 'Invalid token' }, { status: 401 })

    const rows = await (await getPrisma()).$queryRawUnsafe(
      `SELECT product_id FROM public.product_access_requests
       WHERE student_id = $1 AND status = 'granted'`,
      user.id
    )

    const productIds = (rows as any[]).map(r => r.product_id)
    return Response.json({ products: productIds })
  } catch (error: any) {
    console.error('my-access error:', error)
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

function router(from: string | null, request: Request): Promise<Response> | null {
  switch (from) {
    case 'request-access': return handleRequest(request)
    case 'grant-access': return handleGrant(request)
    case 'list-requests': return handleList(request)
    case 'my-access': return handleMyAccess(request)
    default: return null
  }
}

export async function POST(request: Request) {
  const from = new URL(request.url).searchParams.get('from')
  const handler = router(from, request)
  if (handler) return handler
  return Response.json({ error: 'Not found' }, { status: 404 })
}

export async function GET(request: Request) {
  const from = new URL(request.url).searchParams.get('from')
  const handler = router(from, request)
  if (handler) return handler
  return Response.json({ error: 'Not found' }, { status: 404 })
}
