import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { BookingForm } from "@/components/student/booking-form";
import { curriculumLabel } from "@/lib/format";

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

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
              {initials(teacher.user.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {teacher.user.name}
            </h1>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="h-4 w-4 fill-accent text-accent" />
              {teacher.ratingCount > 0 ? teacher.ratingAverage.toFixed(1) : "New teacher"}
            </div>
          </div>
        </div>

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
              <Badge key={s.id} variant="secondary">
                {s.name} · {s.gradeLevel} · KES {s.hourlyRateKES}/hr
              </Badge>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="text-base">Book a session</CardTitle>
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
  );
}
