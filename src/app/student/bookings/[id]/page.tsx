import Link from "next/link";
import { notFound } from "next/navigation";
import { Video, Wallet } from "lucide-react";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { ExercisesPanel } from "@/components/exercises/exercises-panel";
import { avatarColorFor } from "@/lib/colors";
import { formatDateTime, formatKES } from "@/lib/format";
import { cn } from "@/lib/utils";

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

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
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-primary to-teal-500 p-5 text-primary-foreground">
          <div className="flex items-center justify-between">
            <p className="text-sm text-primary-foreground/80">Session</p>
            <BookingStatusBadge status={booking.status} />
          </div>
          <h1 className="mt-1 text-xl font-semibold">{booking.subject.name}</h1>
          <div className="mt-3 flex items-center gap-2">
            <Avatar className="h-8 w-8 ring-2 ring-white/40">
              <AvatarFallback className={cn("text-xs font-semibold", avatarColorFor(booking.teacher.user.name))}>
                {initials(booking.teacher.user.name)}
              </AvatarFallback>
            </Avatar>
            <p className="text-sm">{booking.teacher.user.name}</p>
          </div>
        </div>
        <CardContent className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-secondary/60 p-3">
              <p className="text-xs text-muted-foreground">When</p>
              <p className="font-medium">{formatDateTime(booking.availability.startsAt)}</p>
            </div>
            <div className="rounded-lg bg-secondary/60 p-3">
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="font-medium">{booking.durationHours}h</p>
            </div>
            <div className="rounded-lg bg-secondary/60 p-3">
              <p className="text-xs text-muted-foreground">Rate</p>
              <p className="font-medium">{formatKES(booking.hourlyRateKES)}/hr</p>
            </div>
            <div className="rounded-lg bg-amber-100 p-3 dark:bg-amber-500/15">
              <p className="text-xs text-amber-700/80 dark:text-amber-300/80">Total</p>
              <p className="font-semibold text-amber-700 dark:text-amber-300">
                {formatKES(booking.totalKES)}
              </p>
            </div>
          </div>

          {booking.status === "AWAITING_PAYMENT" && booking.payment && (
            <Button className="w-full gap-2" render={<Link href={`/student/pay/${booking.payment.id}`} />}>
              <Wallet className="h-4 w-4" />
              Complete payment
            </Button>
          )}

          {(booking.status === "CONFIRMED" || booking.status === "IN_PROGRESS") && (
            <Button className="w-full gap-2" render={<Link href={`/session/${booking.videoRoomSlug}`} />}>
              <Video className="h-4 w-4" />
              Join session
            </Button>
          )}
        </CardContent>
      </Card>

      {booking.status !== "AWAITING_PAYMENT" && <ExercisesPanel bookingId={booking.id} />}
    </div>
  );
}
