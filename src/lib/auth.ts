import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import type { Role } from "@/generated/prisma/client";
import {
  SESSION_COOKIE_NAME,
  SESSION_DURATION_MS,
  decryptSession,
  encryptSession,
} from "@/lib/session";

export async function createSession(userId: string, role: Role) {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const token = await encryptSession({
    userId,
    role,
    expiresAt: expiresAt.toISOString(),
  });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

// Cached per-request: safe to call verifySession() multiple times across a render pass.
export const verifySession = cache(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const payload = await decryptSession(token);
  if (!payload?.userId) return null;
  return payload;
});

export const getCurrentUser = cache(async () => {
  const session = await verifySession();
  if (!session) return null;

  const user = await db.user.findUnique({
    where: { id: session.userId },
    include: { studentProfile: true, teacherProfile: true },
  });
  return user;
});

// Call from a page/layout to require any logged-in user. Redirects to /login otherwise.
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

// Call to require a specific role. Redirects non-matching users to their own dashboard.
export async function requireRole(role: Role) {
  const user = await requireUser();
  if (user.role !== role) {
    redirect(dashboardPathForRole(user.role));
  }
  return user;
}

export function dashboardPathForRole(role: Role) {
  switch (role) {
    case "STUDENT":
      return "/student";
    case "TEACHER":
      return "/teacher";
    case "ADMIN":
      return "/admin";
  }
}
