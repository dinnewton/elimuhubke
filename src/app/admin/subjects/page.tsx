import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddSubjectForm } from "@/components/admin/add-subject-form";
import { RateEditor } from "@/components/admin/rate-editor";
import { curriculumLabel } from "@/lib/format";

export default async function AdminSubjectsPage() {
  const subjects = await db.subject.findMany({
    include: { rateCard: true, _count: { select: { teacherLinks: true } } },
    orderBy: [{ curriculum: "asc" }, { gradeLevel: "asc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Subjects &amp; rates</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          ElimuHubKE sets the hourly tutoring rate for every subject and grade —
          teachers cannot change it.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add a subject</CardTitle>
        </CardHeader>
        <CardContent>
          <AddSubjectForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            All subjects ({subjects.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {subjects.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No subjects yet — add one above.
            </p>
          )}
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                <Badge variant="secondary">{curriculumLabel(subject.curriculum)}</Badge>
                <div>
                  <p className="font-medium">{subject.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {subject.gradeLevel} · {subject._count.teacherLinks} teacher
                    {subject._count.teacherLinks === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
              <RateEditor
                subjectId={subject.id}
                currentRate={subject.rateCard?.hourlyRateKES ?? 0}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
