import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { MarkCompleteButton } from "@/components/teacher/mark-complete-button";
import { formatDateTime, formatKES } from "@/lib/format";

export default async function TeacherBookingsPage() {
  const user = await requireRole("TEACHER");
  const teacher = await db.teacherProfile.findUniqueOrThrow({
    where: { userId: user.id },
  });

  const bookings = await db.booking.findMany({
    where: { teacherId: teacher.id, status: { not: "AWAITING_PAYMENT" } },
    include: { student: { include: { user: true } }, subject: true, availability: true },
    orderBy: { availability: { startsAt: "desc" } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Bookings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your confirmed and past tutoring sessions.
        </p>
      </div>

      <div className="space-y-3">
        {bookings.length === 0 && (
          <p className="text-sm text-muted-foreground">No bookings yet.</p>
        )}
        {bookings.map((booking) => (
          <Card key={booking.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{booking.subject.name}</p>
                  <BookingStatusBadge status={booking.status} />
                </div>
                <p className="text-sm text-muted-foreground">
                  with {booking.student.user.name} ·{" "}
                  {formatDateTime(booking.availability.startsAt)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {booking.durationHours}h · {formatKES(booking.totalKES)}
                </p>
              </div>
              <div className="flex gap-2">
                {booking.status === "CONFIRMED" && (
                  <>
                    <Button size="sm" render={<Link href={`/session/${booking.videoRoomSlug}`} />}>
                      Join session
                    </Button>
                    <MarkCompleteButton bookingId={booking.id} />
                  </>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  render={<Link href={`/teacher/bookings/${booking.id}`} />}
                >
                  Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
