import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { formatDateTime, formatKES } from "@/lib/format";

export default async function StudentBookingsPage() {
  const user = await requireRole("STUDENT");

  const bookings = await db.booking.findMany({
    where: { studentId: user.studentProfile!.id },
    include: { teacher: { include: { user: true } }, subject: true, availability: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">My bookings</h1>

      <div className="space-y-3">
        {bookings.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No bookings yet — go{" "}
            <Link href="/student/teachers" className="text-primary underline">
              find a teacher
            </Link>
            .
          </p>
        )}
        {bookings.map((booking) => (
          <Link key={booking.id} href={`/student/bookings/${booking.id}`}>
            <Card className="transition hover:border-primary hover:shadow-sm">
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{booking.subject.name}</p>
                    <BookingStatusBadge status={booking.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    with {booking.teacher.user.name} ·{" "}
                    {formatDateTime(booking.availability.startsAt)}
                  </p>
                </div>
                <p className="font-semibold">{formatKES(booking.totalKES)}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
