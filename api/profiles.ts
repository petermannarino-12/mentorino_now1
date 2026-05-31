import { getPrisma } from './prisma.js';
import { getUserFromToken, mapProfileRow } from './auth.js';

export async function GET(request: Request) {
  try {
    const user = await getUserFromToken(request);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(request.url);
    const limit = url.searchParams.get("limit");
    const id = url.searchParams.get("id") || user.id;

    if (limit) {
      const rows = await (await getPrisma()).profiles.findMany({
        take: parseInt(limit) || 50,
      });
      return Response.json((rows || []).map(r => ({
        id: r.id,
        email: r.email,
        full_name: r.fullName,
        name: r.name,
        role: r.role,
        phone: r.phone,
        avatar: r.avatar,
        mentorship_status: r.mentorshipStatus,
        tasks: r.tasks,
        milestones: r.milestones,
        created_at: r.createdAt,
      })));
    }

    const row = await (await getPrisma()).profiles.findUnique({ where: { id } });
    if (!row) {
      return Response.json({
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
        role: user.user_metadata?.role || 'user',
        phone: '',
        avatar: null,
        mentorship_status: null,
        tasks: [],
        milestones: [],
        created_at: user.created_at,
      });
    }

    return Response.json({
      id: row.id,
      email: row.email,
      full_name: row.fullName,
      name: row.name,
      role: row.role,
      phone: row.phone,
      avatar: row.avatar,
      mentorship_status: row.mentorshipStatus,
      tasks: row.tasks,
      milestones: row.milestones,
      created_at: row.createdAt,
    });
  } catch (err: any) {
    console.error("profiles GET error:", err);
    return Response.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getUserFromToken(request);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const updateData: Record<string, any> = {};
    if (body.milestones) updateData.milestones = body.milestones;
    if (body.tasks) updateData.tasks = body.tasks;
    if (body.name) updateData.name = body.name;
    if (body.phone) updateData.phone = body.phone;
    if (Object.keys(updateData).length === 0) {
      return Response.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const row = await (await getPrisma()).profiles.update({
      where: { id: user.id },
      data: updateData,
    });

    return Response.json(mapProfileRow(row));
  } catch (err: any) {
    console.error("profiles PATCH error:", err);
    return Response.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
