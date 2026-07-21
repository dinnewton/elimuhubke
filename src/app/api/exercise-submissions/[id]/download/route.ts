import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { isBookingParticipant } from "@/lib/booking-access";

const SUBMISSIONS_DIR = path.join(process.cwd(), "uploads", "submissions");

export async function GET(
  _req: Request,
  ctx: RouteContext<"/api/exercise-submissions/[id]/download">
) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const submission = await db.exerciseSubmission.findUnique({
    where: { id },
    include: { exercise: { include: { booking: true } } },
  });
  if (!submission) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!isBookingParticipant(user, submission.exercise.booking)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const bytes = await readFile(path.join(SUBMISSIONS_DIR, submission.fileUrl));
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="submission${path.extname(
          submission.fileUrl
        )}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "File missing" }, { status: 404 });
  }
}
