"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { createExerciseSchema, submitExerciseSchema } from "@/lib/validation-booking";
import type { ActionState } from "@/lib/actions/types";

const EXERCISES_DIR = path.join(process.cwd(), "uploads", "exercises");
const SUBMISSIONS_DIR = path.join(process.cwd(), "uploads", "submissions");
const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20MB

async function storeUpload(dir: string, file: File) {
  await mkdir(dir, { recursive: true });
  const ext = path.extname(file.name) || "";
  const storedName = `${randomUUID()}${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, storedName), bytes);
  return storedName;
}

export async function createExerciseAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireRole("TEACHER");

  const parsed = createExerciseSchema.safeParse({
    bookingId: formData.get("bookingId"),
    title: formData.get("title"),
    instructions: formData.get("instructions") || undefined,
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const teacherProfile = await db.teacherProfile.findUniqueOrThrow({
    where: { userId: user.id },
  });

  const booking = await db.booking.findUnique({
    where: { id: parsed.data.bookingId },
  });
  if (!booking || booking.teacherId !== teacherProfile.id) {
    return { error: "You can only send exercises for your own bookings." };
  }

  const file = formData.get("file");
  let fileUrl: string | null = null;
  let fileSizeBytes: number | null = null;
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_FILE_BYTES) {
      return { error: "File is too large (max 20MB)." };
    }
    fileUrl = await storeUpload(EXERCISES_DIR, file);
    fileSizeBytes = file.size;
  }

  await db.exercise.create({
    data: {
      bookingId: booking.id,
      title: parsed.data.title,
      instructions: parsed.data.instructions,
      fileUrl,
      fileSizeBytes,
    },
  });

  revalidatePath(`/teacher/bookings/${booking.id}`);
  revalidatePath(`/student/bookings/${booking.id}`);
  revalidatePath(`/session/${booking.videoRoomSlug}`);
  return null;
}

export async function submitExerciseResponseAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireRole("STUDENT");

  const parsed = submitExerciseSchema.safeParse({
    exerciseId: formData.get("exerciseId"),
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const studentProfile = await db.studentProfile.findUniqueOrThrow({
    where: { userId: user.id },
  });

  const exercise = await db.exercise.findUnique({
    where: { id: parsed.data.exerciseId },
    include: { booking: true },
  });
  if (!exercise || exercise.booking.studentId !== studentProfile.id) {
    return { error: "You can only respond to exercises from your own bookings." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please attach your completed work as a file." };
  }
  if (file.size > MAX_FILE_BYTES) {
    return { error: "File is too large (max 20MB)." };
  }

  const fileUrl = await storeUpload(SUBMISSIONS_DIR, file);

  await db.exerciseSubmission.create({
    data: {
      exerciseId: exercise.id,
      note: parsed.data.note,
      fileUrl,
      fileSizeBytes: file.size,
    },
  });

  revalidatePath(`/teacher/bookings/${exercise.bookingId}`);
  revalidatePath(`/student/bookings/${exercise.bookingId}`);
  revalidatePath(`/session/${exercise.booking.videoRoomSlug}`);
  return null;
}
