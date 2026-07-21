"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createSession, deleteSession, dashboardPathForRole } from "@/lib/auth";
import {
  loginSchema,
  studentSignupSchema,
  teacherSignupSchema,
} from "@/lib/validation";
import type { ActionState } from "@/lib/actions/types";

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
