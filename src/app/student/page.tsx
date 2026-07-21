import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { curriculumLabel, formatDateTime } from "@/lib/format";

export default async function StudentDashboardPage() {
  const user = await requireRole("STUDENT");

  const upcomingBookings = await db.booking.findMany({
    where: {
      studentId: user.studentProfile!.id,
      status: "CONFIRMED",
      availability: { startsAt: { gt: new Date() } },
    },
    include: { teacher: { include: { user: true } }, subject: true, availability: true },
    orderBy: { availability: { startsAt: "asc" } },
    take: 5,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back, {user.name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {user.studentProfile?.gradeLevel} ·{" "}
          {user.studentProfile && curriculumLabel(user.studentProfile.curriculum)}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button render={<Link href="/student/teachers" />}>Find a teacher</Button>
        <Button variant="outline" render={<Link href="/student/documents" />}>
          Browse revision materials
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Upcoming sessions</CardTitle>
          <Button variant="ghost" size="sm" render={<Link href="/student/bookings" />}>
            View all
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {upcomingBookings.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No sessions booked yet.
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
                  with {booking.teacher.user.name} ·{" "}
                  {formatDateTime(booking.availability.startsAt)}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                render={<Link href={`/student/bookings/${booking.id}`} />}
              >
                Details
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
