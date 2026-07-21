"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { initiateStkPush } from "@/lib/mpesa";
import { failPayment } from "@/lib/payments";
import { createBookingSchema } from "@/lib/validation-booking";
import type { ActionState } from "@/lib/actions/types";

export async function createBookingAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireRole("STUDENT");

  const parsed = createBookingSchema.safeParse({
    availabilityId: formData.get("availabilityId"),
    subjectId: formData.get("subjectId"),
    phone: formData.get("phone"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { availabilityId, subjectId, phone } = parsed.data;

  const availability = await db.availability.findUnique({
    where: { id: availabilityId },
    include: { teacher: true },
  });
  if (!availability || availability.isBooked) {
    return { error: "That slot is no longer available. Please pick another." };
  }
  if (availability.startsAt <= new Date()) {
    return { error: "That slot has already passed." };
  }

  const subject = await db.subject.findUnique({
    where: { id: subjectId },
    include: { rateCard: true },
  });
  if (!subject?.rateCard) {
    return { error: "This subject doesn't have a rate set yet." };
  }

  const durationHours =
    (availability.endsAt.getTime() - availability.startsAt.getTime()) /
    (1000 * 60 * 60);
  const totalKES = Math.round(durationHours * subject.rateCard.hourlyRateKES);

  const result = await db.$transaction(async (tx) => {
    const fresh = await tx.availability.findUnique({
      where: { id: availabilityId },
    });
    if (!fresh || fresh.isBooked) {
      throw new Error("SLOT_TAKEN");
    }

    await tx.availability.update({
      where: { id: availabilityId },
      data: { isBooked: true },
    });

    const booking = await tx.booking.create({
      data: {
        studentId: user.studentProfile!.id,
        teacherId: availability.teacherId,
        subjectId,
        availabilityId,
        durationHours,
        hourlyRateKES: subject.rateCard!.hourlyRateKES,
        totalKES,
      },
    });

    const payment = await tx.payment.create({
      data: {
        purpose: "BOOKING",
        studentId: user.studentProfile!.id,
        bookingId: booking.id,
        amountKES: totalKES,
        phone,
      },
    });

    return { booking, payment };
  }).catch((err) => {
    if (err instanceof Error && err.message === "SLOT_TAKEN") return null;
    throw err;
  });

  if (!result) {
    return { error: "That slot was just booked by someone else. Please pick another." };
  }
  const { booking, payment } = result;

  try {
    const stk = await initiateStkPush({
      phone,
      amountKES: totalKES,
      accountReference: `Tusome-${booking.id.slice(-8)}`,
      transactionDesc: `Tusome tutoring: ${subject.name}`,
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
