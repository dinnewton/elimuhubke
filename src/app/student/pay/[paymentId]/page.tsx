import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { mpesaMockMode } from "@/lib/mpesa";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PaymentStatusPanel } from "@/components/student/payment-status-panel";
import { formatKES } from "@/lib/format";

export default async function PaymentStatusPage({
  params,
}: {
  params: Promise<{ paymentId: string }>;
}) {
  const { paymentId } = await params;
  const user = await requireRole("STUDENT");

  const payment = await db.payment.findUnique({
    where: { id: paymentId },
    include: {
      booking: { include: { subject: true, teacher: { include: { user: true } } } },
      documentPurchase: { include: { document: true } },
    },
  });

  if (!payment || payment.studentId !== user.studentProfile!.id) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {payment.purpose === "BOOKING"
              ? `Booking: ${payment.booking?.subject.name}`
              : `Document: ${payment.documentPurchase?.document.title}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-amber-100 p-4 dark:bg-amber-500/15">
            <span className="text-sm text-amber-700/80 dark:text-amber-300/80">Amount</span>
            <span className="font-semibold text-amber-700 dark:text-amber-300">
              {formatKES(payment.amountKES)}
            </span>
          </div>
          {payment.booking && (
            <p className="text-sm text-muted-foreground">
              with {payment.booking.teacher.user.name}
            </p>
          )}
          <PaymentStatusPanel
            paymentId={payment.id}
            status={payment.status}
            mockMode={mpesaMockMode}
          />
          {payment.status === "SUCCESS" && (
            <Button
              className="w-full"
              render={
                <Link
                  href={
                    payment.purpose === "BOOKING"
                      ? `/student/bookings/${payment.bookingId}`
                      : "/student/purchases"
                  }
                />
              }
            >
              {payment.purpose === "BOOKING" ? "View booking" : "Go to my library"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
