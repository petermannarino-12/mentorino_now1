import { prisma } from "./_lib/prisma";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return Response.json({ error: "Missing email" }, { status: 400 });
    }

    const application = await prisma.applications.findUnique({
      where: { userEmail: email.toLowerCase().trim() },
      select: { status: true },
    });

    const isApproved = application?.status === "approved";

    return Response.json({ is_approved: isApproved });
  } catch (error: any) {
    console.error("check-application Error:", error);
    return Response.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
