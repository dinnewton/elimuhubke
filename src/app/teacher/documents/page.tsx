import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UploadDocumentForm } from "@/components/teacher/upload-document-form";
import { formatKES, curriculumLabel } from "@/lib/format";

export default async function TeacherDocumentsPage() {
  const user = await requireRole("TEACHER");
  const teacher = await db.teacherProfile.findUniqueOrThrow({
    where: { userId: user.id },
    include: { subjects: { include: { subject: true } } },
  });

  const documents = await db.document.findMany({
    where: { teacherId: teacher.id },
    include: { subject: true, _count: { select: { purchases: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My documents</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload revision notes and past papers students can buy.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload new</CardTitle>
        </CardHeader>
        <CardContent>
          <UploadDocumentForm subjects={teacher.subjects.map((s) => s.subject)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Published ({documents.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {documents.length === 0 && (
            <p className="text-sm text-muted-foreground">Nothing uploaded yet.</p>
          )}
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <p className="font-medium">{doc.title}</p>
                <p className="text-xs text-muted-foreground">
                  {curriculumLabel(doc.subject.curriculum)} · {doc.subject.name} ·{" "}
                  {doc.subject.gradeLevel} · {doc._count.purchases} sold
                </p>
              </div>
              <Badge variant="secondary">{formatKES(doc.priceKES)}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
