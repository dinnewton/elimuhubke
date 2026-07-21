import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { getUnpaidEarnings } from "@/lib/payouts";
import { formatDateTime, formatKES } from "@/lib/format";

export default async function TeacherDashboardPage() {
  const user = await requireRole("TEACHER");
  const teacher = await db.teacherProfile.findUniqueOrThrow({
    where: { userId: user.id },
  });

  const [upcomingBookings, { grossKES }, documentCount] = await Promise.all([
    db.booking.findMany({
      where: {
        teacherId: teacher.id,
        status: "CONFIRMED",
        availability: { startsAt: { gt: new Date() } },
      },
      include: { student: { include: { user: true } }, subject: true, availability: true },
      orderBy: { availability: { startsAt: "asc" } },
      take: 5,
    }),
    getUnpaidEarnings(teacher.id),
    db.document.count({ where: { teacherId: teacher.id } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back, {user.name.split(" ")[0]}
        </h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Upcoming sessions</p>
            <p className="mt-1 text-2xl font-semibold">{upcomingBookings.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Unpaid earnings</p>
            <p className="mt-1 text-2xl font-semibold">{formatKES(grossKES)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Documents published</p>
            <p className="mt-1 text-2xl font-semibold">{documentCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Upcoming sessions</CardTitle>
          <Button variant="ghost" size="sm" render={<Link href="/teacher/bookings" />}>
            View all
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {upcomingBookings.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nothing booked yet. Add{" "}
              <Link href="/teacher/availability" className="text-primary underline">
                availability
              </Link>{" "}
              so students can find you.
            </p>
          )}
          {upcomingBookings.map((booking) => (
            <div
              key={booking.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{booking.subject.name}</p>
                  <BookingStatusBadge status={booking.status} />
                </div>
                <p className="text-sm text-muted-foreground">
                  {booking.student.user.name} ·{" "}
                  {formatDateTime(booking.availability.startsAt)}
                </p>
              </div>
              <Button size="sm" variant="outline" render={<Link href={`/session/${booking.videoRoomSlug}`} />}>
                Join
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
