import "server-only";
import { db } from "@/lib/db";
import { getPlatformSettings } from "@/lib/platform-settings";
import { initiateB2CPayment, mpesaMockMode } from "@/lib/mpesa";
import { sendEmail, payoutPaidEmail } from "@/lib/email";
import { formatDate, formatKES } from "@/lib/format";

// Weekly payouts run for the most recently completed Mon 00:00 -> Mon 00:00 window.
export function previousWeekWindow(asOf = new Date()) {
  const day = asOf.getDay(); // 0 = Sunday
  const daysSinceMonday = (day + 6) % 7;
  const thisWeekMonday = new Date(asOf);
  thisWeekMonday.setHours(0, 0, 0, 0);
  thisWeekMonday.setDate(thisWeekMonday.getDate() - daysSinceMonday);

  const weekEnd = thisWeekMonday;
  const weekStart = new Date(weekEnd);
  weekStart.setDate(weekStart.getDate() - 7);

  return { weekStart, weekEnd };
}

export async function getUnpaidEarnings(teacherId: string) {
  const [bookings, purchases] = await Promise.all([
    db.booking.findMany({
      where: { teacherId, status: "COMPLETED", payoutLineItem: null },
      include: { subject: true },
      orderBy: { completedAt: "asc" },
    }),
    db.documentPurchase.findMany({
      where: {
        document: { teacherId },
        payment: { status: "SUCCESS" },
        payoutLineItem: null,
      },
      include: { document: true, payment: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const grossKES =
    bookings.reduce((sum, b) => sum + b.totalKES, 0) +
    purchases.reduce((sum, p) => sum + p.priceKES, 0);

  return { bookings, purchases, grossKES };
}

export type PayoutRunSummary = {
  teachersPaid: number;
  totalNetKES: number;
};

export async function runWeeklyPayouts(): Promise<PayoutRunSummary> {
  const { weekStart, weekEnd } = previousWeekWindow();
  const settings = await getPlatformSettings();

  const teachers = await db.teacherProfile.findMany({
    include: { user: true },
  });

  let teachersPaid = 0;
  let totalNetKES = 0;

  for (const teacher of teachers) {
    const { bookings, purchases, grossKES } = await getUnpaidEarnings(teacher.id);
    if (grossKES === 0) continue;

    const commissionKES = Math.round((grossKES * settings.commissionPercent) / 100);
    const netKES = grossKES - commissionKES;
    const phone = teacher.mpesaPayoutPhone ?? teacher.user.phone;

    const payout = await db.payout.create({
      data: {
        teacherId: teacher.id,
        weekStart,
        weekEnd,
        grossKES,
        commissionPercent: settings.commissionPercent,
        commissionKES,
        netKES,
        phone,
        status: "PROCESSING",
        lineItems: {
          create: [
            ...bookings.map((b) => ({
              type: "BOOKING" as const,
              amountKES: b.totalKES,
              bookingId: b.id,
            })),
            ...purchases.map((p) => ({
              type: "DOCUMENT_SALE" as const,
              amountKES: p.priceKES,
              documentPurchaseId: p.id,
            })),
          ],
        },
      },
    });

    try {
      const b2c = await initiateB2CPayment({
        phone,
        amountKES: netKES,
        remarks: `Tusome weekly payout`,
        occasion: `Payout-${payout.id.slice(-8)}`,
      });

      await db.payout.update({
        where: { id: payout.id },
        data: {
          mpesaConversationId: b2c.conversationId,
          mpesaOriginatorConversationId: b2c.originatorConversationId,
          // In mock mode there's no real Safaricom callback, so settle immediately.
          status: mpesaMockMode ? "PAID" : "PROCESSING",
          paidAt: mpesaMockMode ? new Date() : null,
        },
      });

      if (mpesaMockMode) {
        await sendEmail({
          to: teacher.user.email,
          subject: "You've been paid on Tusome",
          html: payoutPaidEmail({
            weekRangeText: `${formatDate(weekStart)} – ${formatDate(weekEnd)}`,
            amountText: formatKES(netKES),
          }),
        }).catch((err) => console.error("Failed to send payout email:", err));
      }
    } catch (err) {
      await db.payout.update({
        where: { id: payout.id },
        data: {
          status: "FAILED",
          resultDescription:
            err instanceof Error ? err.message : "B2C payment failed.",
        },
      });
      continue;
    }

    teachersPaid += 1;
    totalNetKES += netKES;
  }

  return { teachersPaid, totalNetKES };
}
