import { supabase } from "./_lib/supabase-client";
import { prisma } from "./_lib/prisma";

export async function DELETE(request: Request) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return Response.json({ error: "Invalid token" }, { status: 401 });

    const profile = await prisma.profiles.findUnique({
      where: { id: user.id },
      select: { role: true },
    });

    if (!profile || !["admin", "mentor"].includes(profile.role)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) return Response.json({ error: "Missing ID" }, { status: 400 });

    const application = await prisma.applications.findUnique({
      where: { id },
      select: { userEmail: true },
    });

    if (!application) {
      return Response.json({ error: "Application not found" }, { status: 404 });
    }

    const email = application.userEmail.toLowerCase().trim();

    const targetProfile = await prisma.profiles.findUnique({
      where: { email },
      select: { id: true },
    });

    if (targetProfile) {
      const { error: authDeleteError } = await supabase.auth.admin.deleteUser(targetProfile.id);
      if (authDeleteError) {
        console.error("Auth Delete Error:", authDeleteError);
      }
    }

    await prisma.applications.delete({ where: { id } });

    return Response.json({ message: "Mentee and application deleted successfully" });
  } catch (error: any) {
    console.error("Delete Error:", error);
    return Response.json({ error: error.message || "Failed to delete application" }, { status: 500 });
  }
}
