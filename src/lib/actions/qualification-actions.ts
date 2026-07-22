"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { storeFile, deleteStoredFile } from "@/lib/storage";
import { uploadQualificationSchema } from "@/lib/validation-booking";
import type { ActionState } from "@/lib/actions/types";

const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20MB

export async function uploadQualificationAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireRole("TEACHER");

  const parsed = uploadQualificationSchema.safeParse({
    title: formData.get("title"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please choose a file to upload." };
  }
  if (file.size > MAX_FILE_BYTES) {
    return { error: "File is too large (max 20MB)." };
  }

  const teacherProfile = await db.teacherProfile.findUniqueOrThrow({
    where: { userId: user.id },
  });

  const key = await storeFile("qualifications", file);

  await db.qualificationDocument.create({
    data: {
      teacherId: teacherProfile.id,
      title: parsed.data.title,
      fileUrl: key,
      fileSizeBytes: file.size,
    },
  });

  revalidatePath("/teacher/profile");
  revalidatePath("/admin/teachers");
  return null;
}

export async function deleteQualificationAction(qualificationId: string) {
  const user = await requireRole("TEACHER");

  const teacherProfile = await db.teacherProfile.findUniqueOrThrow({
    where: { userId: user.id },
  });

  const doc = await db.qualificationDocument.findUnique({
    where: { id: qualificationId },
  });
  if (!doc || doc.teacherId !== teacherProfile.id) {
    return;
  }

  await db.qualificationDocument.delete({ where: { id: qualificationId } });
  await deleteStoredFile(doc.fileUrl);

  revalidatePath("/teacher/profile");
  revalidatePath("/admin/teachers");
}
