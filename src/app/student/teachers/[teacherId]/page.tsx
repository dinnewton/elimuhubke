import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CalendarClock, Star } from "lucide-react";
import { BookingForm } from "@/components/student/booking-form";
import { CurriculumBadge } from "@/components/curriculum-badge";
import { avatarColorFor, CURRICULUM_COLORS } from "@/lib/colors";
import { cn } from "@/lib/utils";

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

export default async function TeacherDetailPage({
  params,
}: {
  params: Promise<{ teacherId: string }>;
}) {
  const { teacherId } = await params;
  const user = await requireRole("STUDENT");

  const teacher = await db.teacherProfile.findUnique({
    where: { id: teacherId },
    include: {
      user: true,
      subjects: { include: { subject: { include: { rateCard: true } } } },
    },
  });

  if (!teacher || teacher.verificationStatus !== "VERIFIED") {
    notFound();
  }

  const slots = await db.availability.findMany({
    where: { teacherId, isBooked: false, startsAt: { gt: new Date() } },
    orderBy: { startsAt: "asc" },
    take: 20,
  });

  const subjectsWithRates = teacher.subjects
    .filter((s) => s.subject.rateCard)
    .map((s) => ({
      id: s.subject.id,
      name: s.subject.name,
      gradeLevel: s.subject.gradeLevel,
      curriculum: s.subject.curriculum,
      hourlyRateKES: s.subject.rateCard!.hourlyRateKES,
    }));

  const slotsWithDuration = slots.map((slot) => ({
    id: slot.id,
    startsAt: slot.startsAt,
    endsAt: slot.endsAt,
    durationHours:
      Math.round(
        ((slot.endsAt.getTime() - slot.startsAt.getTime()) / (1000 * 60 * 60)) * 10
      ) / 10,
  }));

  const heroColor = CURRICULUM_COLORS[teacher.curricula[0]] ?? CURRICULUM_COLORS.CBC;

  return (
    <div className="space-y-6">
      {/* Colorful profile header */}
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border p-6 sm:p-8",
          heroColor.badge
        )}
      >
        <div className="flex flex-wrap items-center gap-5">
          <Avatar className={cn("h-20 w-20 ring-4 ring-white/60 dark:ring-black/20")}>
            <AvatarFallback className={cn("text-xl font-semibold", avatarColorFor(teacher.user.name))}>
              {initials(teacher.user.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {teacher.user.name}
            </h1>
            <div className="mt-1 flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {teacher.ratingCount > 0 ? teacher.ratingAverage.toFixed(1) : "New teacher"}
              {teacher.ratingCount > 0 && (
                <span className="opacity-70">({teacher.ratingCount} reviews)</span>
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {teacher.curricula.map((c) => (
                <CurriculumBadge key={c} curriculum={c} className="bg-white/70 dark:bg-black/20" />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          {teacher.bio && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{teacher.bio}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Subjects &amp; rates</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {subjectsWithRates.map((s) => (
                <Badge key={s.id} className={CURRICULUM_COLORS[s.curriculum].badge}>
                  {s.name} · {s.gradeLevel} · KES {s.hourlyRateKES}/hr
                </Badge>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit overflow-hidden">
          <div className={cn("h-1.5 w-full", heroColor.solid)} />
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarClock className="h-4 w-4 text-primary" />
              Book a session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BookingForm
              subjects={subjectsWithRates}
              slots={slotsWithDuration}
              defaultPhone={user.phone}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
