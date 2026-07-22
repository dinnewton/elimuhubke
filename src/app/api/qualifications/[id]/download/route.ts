import { NextResponse } from "next/server";
import path from "node:path";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { readStoredFile } from "@/lib/storage";

export async function GET(
  _req: Request,
  ctx: RouteContext<"/api/qualifications/[id]/download">
) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const doc = await db.qualificationDocument.findUnique({ where: { id } });
  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isOwner =
    user.role === "TEACHER" &&
    (await db.teacherProfile.findUnique({ where: { userId: user.id } }))?.id ===
      doc.teacherId;

  if (!isOwner && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const bytes = await readStoredFile(doc.fileUrl);
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${doc.title.replace(
          /[^a-zA-Z0-9 ._-]/g,
          ""
        )}${path.extname(doc.fileUrl)}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "File missing" }, { status: 404 });
  }
}
