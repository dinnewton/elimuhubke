import Link from "next/link";
import { Search, BookOpen, CalendarCheck, Sparkles } from "lucide-react";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { EmptyState } from "@/components/empty-state";
import { avatarColorFor } from "@/lib/colors";
import { formatDateTime } from "@/lib/format";

export default async function StudentDashboardPage() {
  const user = await requireRole("STUDENT");

  const [upcomingBookings, bookingCount, libraryCount] = await Promise.all([
    db.booking.findMany({
      where: {
        studentId: user.studentProfile!.id,
        status: "CONFIRMED",
        availability: { startsAt: { gt: new Date() } },
      },
      include: { teacher: { include: { user: true } }, subject: true, availability: true },
      orderBy: { availability: { startsAt: "asc" } },
      take: 5,
    }),
    db.booking.count({ where: { studentId: user.studentProfile!.id } }),
    db.documentPurchase.count({
      where: { studentId: user.studentProfile!.id, payment: { status: "SUCCESS" } },
    }),
  ]);

  const firstName = user.name.split(" ")[0];

  return (
    <div className="space-y-6">
      {/* Colorful welcome hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-emerald-500 to-teal-400 p-6 text-primary-foreground shadow-lg sm:p-8">
        <Sparkles
          className="pointer-events-none absolute -top-4 -right-4 h-32 w-32 text-white/10"
          aria-hidden
        />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Hey {firstName}! 👋
            </h1>
            <p className="mt-1 text-primary-foreground/90">
              Ready to learn something new today?
            </p>
            {user.studentProfile && (
              <div className="mt-3 flex items-center gap-2">
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                  {user.studentProfile.gradeLevel}
                </span>
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                  {user.studentProfile.curriculum === "SWAHILI_FOREIGN"
                    ? "Swahili learner"
                    : "Curriculum set"}
                </span>
              </div>
            )}
          </div>
          <div className="flex gap-4 text-center">
            <div className="rounded-xl bg-white/15 px-4 py-3 backdrop-blur-sm">
              <p className="text-2xl font-semibold">{bookingCount}</p>
              <p className="text-xs text-primary-foreground/80">Sessions booked</p>
            </div>
            <div className="rounded-xl bg-white/15 px-4 py-3 backdrop-blur-sm">
              <p className="text-2xl font-semibold">{libraryCount}</p>
              <p className="text-xs text-primary-foreground/80">In library</p>
            </div>
          </div>
        </div>
      </div>

      {/* Colorful quick actions */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/student/teachers"
          className="group flex items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 transition hover:-translate-y-0.5 hover:shadow-md dark:border-emerald-500/20 dark:bg-emerald-500/10"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm">
            <Search className="h-6 w-6" />
          </span>
          <div>
            <p className="font-semibold text-emerald-900 dark:text-emerald-200">
              Find a teacher
            </p>
            <p className="text-sm text-emerald-700/80 dark:text-emerald-300/70">
              Book a live hourly session
            </p>
          </div>
        </Link>
        <Link
          href="/student/documents"
          className="group flex items-center gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 transition hover:-translate-y-0.5 hover:shadow-md dark:border-amber-500/20 dark:bg-amber-500/10"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
            <BookOpen className="h-6 w-6" />
          </span>
          <div>
            <p className="font-semibold text-amber-900 dark:text-amber-200">
              Browse marketplace
            </p>
            <p className="text-sm text-amber-700/80 dark:text-amber-300/70">
              Notes &amp; past papers
            </p>
          </div>
        </Link>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarCheck className="h-4 w-4 text-primary" />
            Upcoming sessions
          </CardTitle>
          <Button variant="ghost" size="sm" render={<Link href="/student/bookings" />}>
            View all
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {upcomingBookings.length === 0 && (
            <EmptyState
              icon={CalendarCheck}
              title="No sessions booked yet"
              description="Find a verified teacher and book your first live session."
              action={
                <Button size="sm" render={<Link href="/student/teachers" />}>
                  Find a teacher
                </Button>
              }
            />
          )}
          {upcomingBookings.map((booking) => (
            <Link
              key={booking.id}
              href={`/student/bookings/${booking.id}`}
              className="flex items-center gap-3 rounded-xl border p-3 transition hover:border-primary hover:shadow-sm"
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${avatarColorFor(
                  booking.teacher.user.name
                )}`}
              >
                {booking.teacher.user.name
                  .split(" ")
                  .map((p) => p[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
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
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
