import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Search } from "lucide-react";
import { CurriculumBadge } from "@/components/curriculum-badge";
import { EmptyState } from "@/components/empty-state";
import { CURRICULUM_COLORS } from "@/lib/colors";
import { curriculumLabel, formatKES } from "@/lib/format";
import { CURRICULA } from "@/lib/validation";
import { cn } from "@/lib/utils";
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

      <div className="flex flex-wrap gap-2">
        <Link
          href="/student/documents"
          className={cn(
            "rounded-full border px-3 py-1.5 text-sm font-medium transition",
            !curriculum
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border hover:bg-muted"
          )}
        >
          All
        </Link>
        {CURRICULA.map((c) => (
          <Link
            key={c}
            href={`/student/documents?curriculum=${c}`}
            className={cn(
              "rounded-full border border-transparent px-3 py-1.5 text-sm font-medium transition",
              curriculum === c
                ? `${CURRICULUM_COLORS[c].solid} text-white`
                : CURRICULUM_COLORS[c].badge
            )}
          >
            {curriculumLabel(c)}
          </Link>
        ))}
      </div>

      <form method="get" className="flex flex-wrap items-end gap-3 rounded-xl border bg-secondary/30 p-4">
        <input type="hidden" name="curriculum" value={curriculum ?? ""} />
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Subject</label>
          <select
            name="subjectId"
            defaultValue={params.subjectId ?? ""}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">All subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} · {s.gradeLevel}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" size="sm" className="gap-1.5">
          <Search className="h-3.5 w-3.5" />
          Filter
        </Button>
      </form>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {documents.length === 0 && (
          <div className="sm:col-span-2 lg:col-span-3">
            <EmptyState
              icon={BookOpen}
              title="No documents match yet"
              description="Try a different curriculum or subject filter."
              action={
                <Button size="sm" variant="outline" render={<Link href="/student/documents" />}>
                  Clear filters
                </Button>
              }
            />
          </div>
        )}
        {documents.map((doc) => (
          <Link key={doc.id} href={`/student/documents/${doc.id}`}>
            <Card className="h-full overflow-hidden transition hover:-translate-y-0.5 hover:border-primary hover:shadow-lg">
              <CardContent className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                      CURRICULUM_COLORS[doc.subject.curriculum].badge
                    )}
                  >
                    <BookOpen className="h-5 w-5" />
                  </span>
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-sm font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                    {formatKES(doc.priceKES)}
                  </span>
                </div>
                <div>
                  <p className="font-medium leading-snug">{doc.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    by {doc.teacher.user.name}
                  </p>
                </div>
                <CurriculumBadge curriculum={doc.subject.curriculum} />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
