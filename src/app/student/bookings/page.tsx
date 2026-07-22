import Link from "next/link";
import { CalendarCheck } from "lucide-react";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { EmptyState } from "@/components/empty-state";
import { avatarColorFor } from "@/lib/colors";
import { formatDateTime, formatKES } from "@/lib/format";
import { cn } from "@/lib/utils";

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

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
          <EmptyState
            icon={CalendarCheck}
            title="No bookings yet"
            description="Find a verified teacher and book your first live session."
            action={
              <Button size="sm" render={<Link href="/student/teachers" />}>
                Find a teacher
              </Button>
            }
          />
        )}
        {bookings.map((booking) => (
          <Link key={booking.id} href={`/student/bookings/${booking.id}`}>
            <Card className="transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md">
              <CardContent className="flex flex-wrap items-center gap-3 p-4">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className={cn("font-semibold", avatarColorFor(booking.teacher.user.name))}>
                    {initials(booking.teacher.user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium">{booking.subject.name}</p>
                    <BookingStatusBadge status={booking.status} />
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    with {booking.teacher.user.name} ·{" "}
                    {formatDateTime(booking.availability.startsAt)}
                  </p>
                </div>
                <p className="font-semibold whitespace-nowrap">{formatKES(booking.totalKES)}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
