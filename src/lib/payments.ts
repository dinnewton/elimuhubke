import "server-only";
import { db } from "@/lib/db";

export async function confirmPaymentSuccess(
  paymentId: string,
  mpesaReceiptNumber: string
) {
  const payment = await db.payment.findUnique({ where: { id: paymentId } });
  if (!payment || payment.status !== "PENDING") return;

  await db.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: "SUCCESS",
        mpesaReceiptNumber,
        resultDescription: "Payment received.",
      },
    });

    if (payment.purpose === "BOOKING" && payment.bookingId) {
      await tx.booking.update({
        where: { id: payment.bookingId },
        data: { status: "CONFIRMED" },
      });
    }
    // Document purchases only require the Payment to flip to SUCCESS —
    // access is granted by the existence of the DocumentPurchase row.
  });
}

export async function failPayment(paymentId: string, reason: string) {
  const payment = await db.payment.findUnique({ where: { id: paymentId } });
  if (!payment || payment.status !== "PENDING") return;

  await db.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: paymentId },
      data: { status: "FAILED", resultDescription: reason },
    });

    if (payment.purpose === "BOOKING" && payment.bookingId) {
      const booking = await tx.booking.update({
        where: { id: payment.bookingId },
        data: { status: "CANCELLED", cancelledAt: new Date() },
      });
      await tx.availability.update({
        where: { id: booking.availabilityId },
        data: { isBooked: false },
      });
    }
    // Document purchases are left in place with a FAILED payment; a retry
    // (see purchaseDocumentAction) clears out the stale attempt before
    // creating a fresh DocumentPurchase + Payment.
  });
}
