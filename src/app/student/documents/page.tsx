import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { curriculumLabel, formatKES } from "@/lib/format";
import { CURRICULA } from "@/lib/validation";
import type { Curriculum } from "@/generated/prisma/client";

export default async function DocumentsMarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ curriculum?: string; subjectId?: string }>;
}) {
  await requireRole("STUDENT");
  const params = await searchParams;
  const curriculum = params.curriculum as Curriculum | undefined;

  const subjects = await db.subject.findMany({
    where: curriculum ? { curriculum } : undefined,
    orderBy: [{ curriculum: "asc" }, { name: "asc" }],
  });

  const documents = await db.document.findMany({
    where: {
      isPublished: true,
      ...(params.subjectId
        ? { subjectId: params.subjectId }
        : curriculum
        ? { subject: { curriculum } }
        : {}),
    },
    include: { subject: true, teacher: { include: { user: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Marketplace</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Notes and past papers from verified teachers.
        </p>
      </div>

      <form method="get" className="flex flex-wrap gap-3 rounded-lg border p-4">
        <select
          name="curriculum"
          defaultValue={curriculum ?? ""}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
        >
          <option value="">All curricula</option>
          {CURRICULA.map((c) => (
            <option key={c} value={c}>
              {curriculumLabel(c)}
            </option>
          ))}
        </select>
        <select
          name="subjectId"
          defaultValue={params.subjectId ?? ""}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
        >
          <option value="">All subjects</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} · {s.gradeLevel}
            </option>
          ))}
        </select>
        <Button type="submit" size="sm">
          Filter
        </Button>
      </form>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {documents.length === 0 && (
          <p className="text-sm text-muted-foreground">No documents match yet.</p>
        )}
        {documents.map((doc) => (
          <Link key={doc.id} href={`/student/documents/${doc.id}`}>
            <Card className="h-full transition hover:border-primary hover:shadow-md">
              <CardContent className="space-y-2 p-5">
                <Badge variant="secondary">
                  {curriculumLabel(doc.subject.curriculum)} · {doc.subject.name}
                </Badge>
                <p className="font-medium">{doc.title}</p>
                <p className="text-xs text-muted-foreground">by {doc.teacher.user.name}</p>
                <p className="font-semibold text-primary">{formatKES(doc.priceKES)}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
