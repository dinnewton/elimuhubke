import "server-only";
import { db } from "@/lib/db";
import { sendEmail, bookingConfirmedEmail, documentPurchaseEmail } from "@/lib/email";
import { formatDateTime, formatKES } from "@/lib/format";

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

  await sendPaymentConfirmationEmail(payment).catch((err) =>
    console.error("Failed to send payment confirmation email:", err)
  );
}

async function sendPaymentConfirmationEmail(payment: { purpose: string; bookingId: string | null; documentPurchaseId: string | null; amountKES: number }) {
  if (payment.purpose === "BOOKING" && payment.bookingId) {
    const booking = await db.booking.findUnique({
      where: { id: payment.bookingId },
      include: {
        student: { include: { user: true } },
        teacher: { include: { user: true } },
        subject: true,
        availability: true,
      },
    });
    if (!booking) return;
    await sendEmail({
      to: booking.student.user.email,
      subject: "Your ElimuHubKE session is confirmed",
      html: bookingConfirmedEmail({
        subjectName: booking.subject.name,
        otherPartyName: booking.teacher.user.name,
        whenText: formatDateTime(booking.availability.startsAt),
        amountText: formatKES(payment.amountKES),
      }),
    });
  }

  if (payment.purpose === "DOCUMENT" && payment.documentPurchaseId) {
    const purchase = await db.documentPurchase.findUnique({
      where: { id: payment.documentPurchaseId },
      include: { document: true, student: { include: { user: true } } },
    });
    if (!purchase) return;
    await sendEmail({
      to: purchase.student.user.email,
      subject: "Your ElimuHubKE purchase is confirmed",
      html: documentPurchaseEmail({
        title: purchase.document.title,
        amountText: formatKES(payment.amountKES),
      }),
    });
  }
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
