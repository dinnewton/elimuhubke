"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { confirmPaymentSuccess, failPayment } from "@/lib/payments";
import { initiateStkPush, mpesaMockMode } from "@/lib/mpesa";

async function assertOwnsPayment(paymentId: string) {
  const user = await getCurrentUser();
  if (!user?.studentProfile) throw new Error("Unauthorized");
  const payment = await db.payment.findUnique({ where: { id: paymentId } });
  if (!payment || payment.studentId !== user.studentProfile.id) {
    throw new Error("Unauthorized");
  }
  return payment;
}

// Dev/sandbox only: simulates the customer entering their M-Pesa PIN, since
// we don't have live Daraja callback delivery without a registered shortcode.
export async function simulatePaymentSuccessAction(paymentId: string) {
  if (!mpesaMockMode) throw new Error("Simulation only available in mock mode");
  await assertOwnsPayment(paymentId);
  await confirmPaymentSuccess(paymentId, `MOCK${Date.now()}`);
  revalidatePath(`/student/pay/${paymentId}`);
}

export async function simulatePaymentFailureAction(paymentId: string) {
  if (!mpesaMockMode) throw new Error("Simulation only available in mock mode");
  await assertOwnsPayment(paymentId);
  await failPayment(paymentId, "Request cancelled by user.");
  revalidatePath(`/student/pay/${paymentId}`);
}

export async function retryPaymentAction(paymentId: string) {
  const payment = await assertOwnsPayment(paymentId);
  if (payment.status !== "FAILED") return;

  await db.payment.update({
    where: { id: paymentId },
    data: { status: "PENDING", resultDescription: null },
  });

  if (payment.purpose === "BOOKING" && payment.bookingId) {
    const booking = await db.booking.findUnique({ where: { id: payment.bookingId } });
    if (booking) {
      await db.$transaction([
        db.booking.update({
          where: { id: booking.id },
          data: { status: "AWAITING_PAYMENT", cancelledAt: null },
        }),
        db.availability.update({
          where: { id: booking.availabilityId },
          data: { isBooked: true },
        }),
      ]);
    }
  }

  try {
    const stk = await initiateStkPush({
      phone: payment.phone,
      amountKES: payment.amountKES,
      accountReference: `ElimuHubKE-${paymentId.slice(-8)}`,
      transactionDesc: "ElimuHubKE payment",
    });
    await db.payment.update({
      where: { id: paymentId },
      data: {
        mpesaCheckoutRequestId: stk.checkoutRequestId,
        mpesaMerchantRequestId: stk.merchantRequestId,
      },
    });
  } catch {
    await failPayment(paymentId, "Could not reach M-Pesa. Please try again.");
  }

  revalidatePath(`/student/pay/${paymentId}`);
}
