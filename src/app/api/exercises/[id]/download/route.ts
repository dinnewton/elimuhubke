import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { isBookingParticipant } from "@/lib/booking-access";

const EXERCISES_DIR = path.join(process.cwd(), "uploads", "exercises");

export async function GET(
  _req: Request,
  ctx: RouteContext<"/api/exercises/[id]/download">
) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const exercise = await db.exercise.findUnique({
    where: { id },
    include: { booking: true },
  });
  if (!exercise || !exercise.fileUrl) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!isBookingParticipant(user, exercise.booking)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const bytes = await readFile(path.join(EXERCISES_DIR, exercise.fileUrl));
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${exercise.title.replace(
          /[^a-zA-Z0-9 ._-]/g,
          ""
        )}${path.extname(exercise.fileUrl)}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "File missing" }, { status: 404 });
  }
}
