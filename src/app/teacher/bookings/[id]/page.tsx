import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { MarkCompleteButton } from "@/components/teacher/mark-complete-button";
import { ExercisesPanel } from "@/components/exercises/exercises-panel";
import { formatDateTime, formatKES } from "@/lib/format";

export default async function TeacherBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireRole("TEACHER");

  const booking = await db.booking.findUnique({
    where: { id },
    include: {
      student: { include: { user: true } },
      subject: true,
      availability: true,
    },
  });

  if (!booking || booking.teacherId !== user.teacherProfile!.id) {
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
              <span className="text-muted-foreground">Student: </span>
              {booking.student.user.name}
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

          {(booking.status === "CONFIRMED" || booking.status === "IN_PROGRESS") && (
            <div className="flex gap-2">
              <Button className="flex-1" render={<Link href={`/session/${booking.videoRoomSlug}`} />}>
                Join session
              </Button>
              <MarkCompleteButton bookingId={booking.id} />
            </div>
          )}
        </CardContent>
      </Card>

      {booking.status !== "AWAITING_PAYMENT" && <ExercisesPanel bookingId={booking.id} />}
    </div>
  );
}
