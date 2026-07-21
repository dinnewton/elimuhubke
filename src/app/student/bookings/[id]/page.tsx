import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { ExercisesPanel } from "@/components/exercises/exercises-panel";
import { formatDateTime, formatKES } from "@/lib/format";

export default async function StudentBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireRole("STUDENT");

  const booking = await db.booking.findUnique({
    where: { id },
    include: {
      teacher: { include: { user: true } },
      subject: true,
      availability: true,
      payment: true,
    },
  });

  if (!booking || booking.studentId !== user.studentProfile!.id) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{booking.subject.name}</CardTitle>
          <BookingStatusBadge status={booking.status} />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-muted-foreground">Teacher: </span>
              {booking.teacher.user.name}
            </p>
            <p>
              <span className="text-muted-foreground">When: </span>
              {formatDateTime(booking.availability.startsAt)} –{" "}
              {formatDateTime(booking.availability.endsAt)}
            </p>
            <p>
              <span className="text-muted-foreground">Duration: </span>
              {booking.durationHours}h at {formatKES(booking.hourlyRateKES)}/hr
            </p>
            <p>
              <span className="text-muted-foreground">Total: </span>
              {formatKES(booking.totalKES)}
            </p>
          </div>

          {booking.status === "AWAITING_PAYMENT" && booking.payment && (
            <Button className="w-full" render={<Link href={`/student/pay/${booking.payment.id}`} />}>
              Complete payment
            </Button>
          )}

          {(booking.status === "CONFIRMED" || booking.status === "IN_PROGRESS") && (
            <Button className="w-full" render={<Link href={`/session/${booking.videoRoomSlug}`} />}>
              Join session
            </Button>
          )}
        </CardContent>
      </Card>

      {booking.status !== "AWAITING_PAYMENT" && <ExercisesPanel bookingId={booking.id} />}
    </div>
  );
}
