"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import {
  addAvailabilitySchema,
  teacherProfileSchema,
} from "@/lib/validation-booking";
import type { ActionState } from "@/lib/actions/types";

async function currentTeacherProfile() {
  const user = await requireRole("TEACHER");
  const profile = await db.teacherProfile.findUniqueOrThrow({
    where: { userId: user.id },
  });
  return profile;
}

export async function addAvailabilityAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const teacher = await currentTeacherProfile();

  const parsed = addAvailabilitySchema.safeParse({
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await db.availability.create({
    data: {
      teacherId: teacher.id,
      startsAt: new Date(parsed.data.startsAt),
      endsAt: new Date(parsed.data.endsAt),
    },
  });

  revalidatePath("/teacher/availability");
  return null;
}

export async function deleteAvailabilityAction(availabilityId: string) {
  const teacher = await currentTeacherProfile();
  await db.availability.deleteMany({
    where: { id: availabilityId, teacherId: teacher.id, isBooked: false },
  });
  revalidatePath("/teacher/availability");
}

export async function updateTeacherProfileAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const teacher = await currentTeacherProfile();

  const parsed = teacherProfileSchema.safeParse({
    bio: formData.get("bio") || undefined,
    mpesaPayoutPhone: formData.get("mpesaPayoutPhone") || "",
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await db.teacherProfile.update({
    where: { id: teacher.id },
    data: {
      bio: parsed.data.bio,
      mpesaPayoutPhone: parsed.data.mpesaPayoutPhone || null,
    },
  });

  revalidatePath("/teacher/profile");
  return null;
}

export async function addTeacherSubjectAction(subjectId: string) {
  const teacher = await currentTeacherProfile();
  await db.teacherSubject.upsert({
    where: { teacherId_subjectId: { teacherId: teacher.id, subjectId } },
    update: {},
    create: { teacherId: teacher.id, subjectId },
  });
  revalidatePath("/teacher/profile");
}

export async function removeTeacherSubjectAction(subjectId: string) {
  const teacher = await currentTeacherProfile();
  await db.teacherSubject.deleteMany({
    where: { teacherId: teacher.id, subjectId },
  });
  revalidatePath("/teacher/profile");
}

export async function markBookingCompleteAction(bookingId: string) {
  const teacher = await currentTeacherProfile();
  const booking = await db.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.teacherId !== teacher.id) return;
  if (booking.status !== "CONFIRMED" && booking.status !== "IN_PROGRESS") return;

  await db.booking.update({
    where: { id: bookingId },
    data: { status: "COMPLETED", completedAt: new Date() },
  });
  revalidatePath("/teacher/bookings");
}
