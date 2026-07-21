"use server";

import { redirect } from "next/navigation";
import { randomBytes } from "node:crypto";
import { db } from "@/lib/db";
import { hashPassword, hashToken, verifyPassword } from "@/lib/password";
import { createSession, deleteSession, dashboardPathForRole } from "@/lib/auth";
import { sendEmail, passwordResetEmail } from "@/lib/email";
import {
  loginSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  studentSignupSchema,
  teacherSignupSchema,
} from "@/lib/validation";
import type { ActionState } from "@/lib/actions/types";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function signupStudentAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = studentSignupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    curriculum: formData.get("curriculum"),
    gradeLevel: formData.get("gradeLevel"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { name, email, phone, password, curriculum, gradeLevel } = parsed.data;

  const existing = await db.user.findFirst({
    where: { OR: [{ email }, { phone }] },
  });
  if (existing) {
    return { error: "An account with that email or phone already exists." };
  }

  const passwordHash = await hashPassword(password);

  const user = await db.user.create({
    data: {
      name,
      email,
      phone,
      passwordHash,
      role: "STUDENT",
      studentProfile: {
        create: { curriculum, gradeLevel },
      },
    },
  });

  await createSession(user.id, user.role);
  redirect(dashboardPathForRole(user.role));
}

export async function signupTeacherAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = teacherSignupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    bio: formData.get("bio") || undefined,
    curricula: formData.getAll("curricula"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { name, email, phone, password, bio, curricula } = parsed.data;

  const existing = await db.user.findFirst({
    where: { OR: [{ email }, { phone }] },
  });
  if (existing) {
    return { error: "An account with that email or phone already exists." };
  }

  const passwordHash = await hashPassword(password);

  const user = await db.user.create({
    data: {
      name,
      email,
      phone,
      passwordHash,
      role: "TEACHER",
      teacherProfile: {
        create: { bio, curricula },
      },
    },
  });

  await createSession(user.id, user.role);
  redirect(dashboardPathForRole(user.role));
}

export async function loginAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { email, password } = parsed.data;

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "Invalid email or password." };
  }

  const validPassword = await verifyPassword(password, user.passwordHash);
  if (!validPassword) {
    return { error: "Invalid email or password." };
  }

  await createSession(user.id, user.role);
  redirect(dashboardPathForRole(user.role));
}

export async function logoutAction() {
  await deleteSession();
  redirect("/login");
}

export async function requestPasswordResetAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = requestPasswordResetSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });

  // Always report success, even if no account matches — prevents leaking
  // which emails are registered.
  if (user) {
    const rawToken = randomBytes(32).toString("hex");
    await db.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(rawToken),
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/${rawToken}`;
    await sendEmail({
      to: user.email,
      subject: "Reset your Tusome password",
      html: passwordResetEmail(resetUrl),
    });
  }

  return { success: true };
}

export async function resetPasswordAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const tokenHash = hashToken(parsed.data.token);
  const resetToken = await db.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (
    !resetToken ||
    resetToken.usedAt ||
    resetToken.expiresAt < new Date()
  ) {
    return { error: "This reset link is invalid or has expired. Request a new one." };
  }

  const passwordHash = await hashPassword(parsed.data.password);

  await db.$transaction([
    db.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    }),
    db.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
  ]);

  redirect("/login");
}
