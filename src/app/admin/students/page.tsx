import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { curriculumLabel, formatDate } from "@/lib/format";

export default async function AdminStudentsPage() {
  const students = await db.studentProfile.findMany({
    include: {
      user: true,
      _count: { select: { bookingsAsStudent: true, purchases: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Students</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {students.length} student{students.length === 1 ? "" : "s"} registered.
        </p>
      </div>

      <div className="space-y-3">
        {students.length === 0 && (
          <p className="text-sm text-muted-foreground">No students yet.</p>
        )}
        {students.map((student) => (
          <Card key={student.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
              <div>
                <p className="font-medium">{student.user.name}</p>
                <p className="text-sm text-muted-foreground">
                  {student.user.email} · {student.user.phone}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <Badge variant="secondary">
                    {curriculumLabel(student.curriculum)} · {student.gradeLevel}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Joined {formatDate(student.createdAt)}
                  </span>
                </div>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p>{student._count.bookingsAsStudent} booking(s)</p>
                <p>{student._count.purchases} purchase(s)</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
