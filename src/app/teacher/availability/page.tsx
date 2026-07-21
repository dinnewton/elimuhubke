import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddAvailabilityForm } from "@/components/teacher/add-availability-form";
import { AvailabilityList } from "@/components/teacher/availability-list";

export default async function TeacherAvailabilityPage() {
  const user = await requireRole("TEACHER");
  const teacher = await db.teacherProfile.findUniqueOrThrow({
    where: { userId: user.id },
  });

  const slots = await db.availability.findMany({
    where: { teacherId: teacher.id, startsAt: { gt: new Date() } },
    orderBy: { startsAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Availability</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Open up hourly slots for students to book.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add a slot</CardTitle>
        </CardHeader>
        <CardContent>
          <AddAvailabilityForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upcoming slots ({slots.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <AvailabilityList slots={slots} />
        </CardContent>
      </Card>
    </div>
  );
}
