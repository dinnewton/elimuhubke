import { db } from "@/lib/db";
import { getTeacherRevenueSummaries } from "@/lib/analytics";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TeacherVerifyButtons } from "@/components/admin/teacher-verify-buttons";
import { curriculumLabel, formatDate, formatKES } from "@/lib/format";

const statusVariant = {
  PENDING: "secondary",
  VERIFIED: "default",
  REJECTED: "destructive",
} as const;

export default async function AdminTeachersPage() {
  const [teachers, revenueSummaries] = await Promise.all([
    db.teacherProfile.findMany({
      include: {
        user: true,
        subjects: { include: { subject: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    getTeacherRevenueSummaries(),
  ]);

  const revenueByTeacherId = new Map(revenueSummaries.map((r) => [r.teacherId, r]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Teachers</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Verify teachers before they appear in student search results.
        </p>
      </div>

      <div className="space-y-3">
        {teachers.length === 0 && (
          <p className="text-sm text-muted-foreground">No teachers yet.</p>
        )}
        {teachers.map((teacher) => {
          const revenue = revenueByTeacherId.get(teacher.id);
          return (
            <Card key={teacher.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{teacher.user.name}</p>
                    <Badge variant={statusVariant[teacher.verificationStatus]}>
                      {teacher.verificationStatus}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {teacher.user.email} · {teacher.user.phone}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Joined {formatDate(teacher.createdAt)}
                    {revenue &&
                      ` · ${revenue.sessionsCompleted} sessions · ${revenue.documentsSold} document sales`}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {teacher.curricula.map((c) => (
                      <Badge key={c} variant="secondary">
                        {curriculumLabel(c)}
                      </Badge>
                    ))}
                    {teacher.subjects.map(({ subject }) => (
                      <Badge key={subject.id} variant="outline">
                        {subject.name} · {subject.gradeLevel}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {revenue && (
                    <div className="text-right text-sm">
                      <p className="font-semibold">{formatKES(revenue.grossKES)}</p>
                      <p className="text-xs text-muted-foreground">generated</p>
                    </div>
                  )}
                  {teacher.verificationStatus !== "VERIFIED" && (
                    <TeacherVerifyButtons teacherProfileId={teacher.id} />
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
