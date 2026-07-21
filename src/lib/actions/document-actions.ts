"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { initiateStkPush } from "@/lib/mpesa";
import { failPayment } from "@/lib/payments";
import { storeFile } from "@/lib/storage";
import {
  purchaseDocumentSchema,
  uploadDocumentSchema,
} from "@/lib/validation-booking";
import type { ActionState } from "@/lib/actions/types";

const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20MB

export async function purchaseDocumentAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireRole("STUDENT");

  const parsed = purchaseDocumentSchema.safeParse({
    documentId: formData.get("documentId"),
    phone: formData.get("phone"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const { documentId, phone } = parsed.data;

  const document = await db.document.findUnique({ where: { id: documentId } });
  if (!document || !document.isPublished) {
    return { error: "This document is not available." };
  }

  const existing = await db.documentPurchase.findUnique({
    where: {
      documentId_studentId: {
        documentId,
        studentId: user.studentProfile!.id,
      },
    },
    include: { payment: true },
  });

  if (existing?.payment?.status === "SUCCESS") {
    redirect("/student/purchases");
  }
  if (existing) {
    // Clear out a stale pending/failed attempt (cascades its Payment too).
    await db.documentPurchase.delete({ where: { id: existing.id } });
  }

  const purchase = await db.documentPurchase.create({
    data: {
      documentId,
      studentId: user.studentProfile!.id,
      priceKES: document.priceKES,
    },
  });

  const payment = await db.payment.create({
    data: {
      purpose: "DOCUMENT",
      studentId: user.studentProfile!.id,
      documentPurchaseId: purchase.id,
      amountKES: document.priceKES,
      phone,
    },
  });

  try {
    const stk = await initiateStkPush({
      phone,
      amountKES: document.priceKES,
      accountReference: `Tusome-${purchase.id.slice(-8)}`,
      transactionDesc: `Tusome document: ${document.title}`,
    });
    await db.payment.update({
      where: { id: payment.id },
      data: {
        mpesaCheckoutRequestId: stk.checkoutRequestId,
        mpesaMerchantRequestId: stk.merchantRequestId,
      },
    });
  } catch {
    await failPayment(payment.id, "Could not reach M-Pesa. Please try again.");
    return { error: "Could not start the M-Pesa payment. Please try again." };
  }

  redirect(`/student/pay/${payment.id}`);
}

export async function uploadDocumentAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireRole("TEACHER");

  const parsed = uploadDocumentSchema.safeParse({
    subjectId: formData.get("subjectId"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    priceKES: formData.get("priceKES"),
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

  const teacherProfile = await db.teacherProfile.findUnique({
    where: { userId: user.id },
    include: { subjects: true },
  });
  const ownsSubject = teacherProfile?.subjects.some(
    (s) => s.subjectId === parsed.data.subjectId
  );
  if (!ownsSubject) {
    return { error: "Add this subject to your profile before uploading for it." };
  }

  const key = await storeFile("documents", file);

  await db.document.create({
    data: {
      teacherId: teacherProfile!.id,
      subjectId: parsed.data.subjectId,
      title: parsed.data.title,
      description: parsed.data.description,
      fileUrl: key,
      fileSizeBytes: file.size,
      priceKES: parsed.data.priceKES,
    },
  });

  revalidatePath("/teacher/documents");
  return null;
}
