"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { setCommissionPercent } from "@/lib/platform-settings";
import { runWeeklyPayouts, type PayoutRunSummary } from "@/lib/payouts";
import {
  commissionSchema,
  createSubjectSchema,
  updateRateSchema,
} from "@/lib/validation-admin";
import type { ActionState } from "@/lib/actions/types";

export async function createSubjectAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole("ADMIN");

  const parsed = createSubjectSchema.safeParse({
    name: formData.get("name"),
    curriculum: formData.get("curriculum"),
    gradeLevel: formData.get("gradeLevel"),
    hourlyRateKES: formData.get("hourlyRateKES"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { name, curriculum, gradeLevel, hourlyRateKES } = parsed.data;

  const existing = await db.subject.findUnique({
    where: { name_curriculum_gradeLevel: { name, curriculum, gradeLevel } },
  });
  if (existing) {
    return { error: "That subject already exists for this grade/curriculum." };
  }

  await db.subject.create({
    data: {
      name,
      curriculum,
      gradeLevel,
      rateCard: { create: { hourlyRateKES } },
    },
  });

  revalidatePath("/admin/subjects");
  return null;
}

export async function updateRateAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole("ADMIN");

  const parsed = updateRateSchema.safeParse({
    subjectId: formData.get("subjectId"),
    hourlyRateKES: formData.get("hourlyRateKES"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await db.rateCard.upsert({
    where: { subjectId: parsed.data.subjectId },
    update: { hourlyRateKES: parsed.data.hourlyRateKES },
    create: {
      subjectId: parsed.data.subjectId,
      hourlyRateKES: parsed.data.hourlyRateKES,
    },
  });

  revalidatePath("/admin/subjects");
  return null;
}

export async function updateCommissionAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole("ADMIN");

  const parsed = commissionSchema.safeParse({
    commissionPercent: formData.get("commissionPercent"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await setCommissionPercent(parsed.data.commissionPercent);
  revalidatePath("/admin/settings");
  return null;
}

export async function verifyTeacherAction(teacherProfileId: string) {
  await requireRole("ADMIN");
  await db.teacherProfile.update({
    where: { id: teacherProfileId },
    data: { verificationStatus: "VERIFIED" },
  });
  revalidatePath("/admin/teachers");
}

export async function rejectTeacherAction(teacherProfileId: string) {
  await requireRole("ADMIN");
  await db.teacherProfile.update({
    where: { id: teacherProfileId },
    data: { verificationStatus: "REJECTED" },
  });
  revalidatePath("/admin/teachers");
}

export async function runPayoutsAction(): Promise<PayoutRunSummary> {
  await requireRole("ADMIN");
  const summary = await runWeeklyPayouts();
  revalidatePath("/admin/payouts");
  revalidatePath("/teacher/earnings");
  return summary;
}
