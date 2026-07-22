import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Star } from "lucide-react";
import { CurriculumBadge } from "@/components/curriculum-badge";
import { EmptyState } from "@/components/empty-state";
import { avatarColorFor, CURRICULUM_COLORS } from "@/lib/colors";
import { curriculumLabel } from "@/lib/format";
import { CURRICULA } from "@/lib/validation";
import { cn } from "@/lib/utils";
import type { Curriculum } from "@/generated/prisma/client";

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

export default async function BrowseTeachersPage({
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

  const teachers = await db.teacherProfile.findMany({
    where: {
      verificationStatus: "VERIFIED",
      ...(curriculum ? { curricula: { has: curriculum } } : {}),
      ...(params.subjectId
        ? { subjects: { some: { subjectId: params.subjectId } } }
        : {}),
    },
    include: { user: true, subjects: { include: { subject: true } } },
    orderBy: { ratingAverage: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Find a teacher</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {teachers.length} verified teacher{teachers.length === 1 ? "" : "s"} ready to help
        </p>
      </div>

      {/* Colorful curriculum quick-filter pills */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/student/teachers"
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
            href={`/student/teachers?curriculum=${c}`}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm font-medium transition",
              curriculum === c
                ? `border-transparent ${CURRICULUM_COLORS[c].solid} text-white`
                : `border-border ${CURRICULUM_COLORS[c].badge} border-transparent`
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
        {teachers.length === 0 && (
          <div className="sm:col-span-2 lg:col-span-3">
            <EmptyState
              icon={Search}
              title="No teachers match those filters"
              description="Try a different curriculum or subject, or check back soon as more teachers join."
              action={
                <Button size="sm" variant="outline" render={<Link href="/student/teachers" />}>
                  Clear filters
                </Button>
              }
            />
          </div>
        )}
        {teachers.map((teacher) => (
          <Link key={teacher.id} href={`/student/teachers/${teacher.id}`}>
            <Card className="h-full overflow-hidden transition hover:-translate-y-0.5 hover:border-primary hover:shadow-lg">
              <div className={cn("h-1.5 w-full", CURRICULUM_COLORS[teacher.curricula[0]]?.solid ?? "bg-primary")} />
              <CardContent className="space-y-3 p-5">
                <div className="flex items-center gap-3">
                  <Avatar className="h-11 w-11">
                    <AvatarFallback className={cn("font-semibold", avatarColorFor(teacher.user.name))}>
                      {initials(teacher.user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{teacher.user.name}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {teacher.ratingCount > 0
                        ? teacher.ratingAverage.toFixed(1)
                        : "New teacher"}
                    </div>
                  </div>
                </div>
                {teacher.bio && (
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {teacher.bio}
                  </p>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {teacher.curricula.map((c) => (
                    <CurriculumBadge key={c} curriculum={c} />
                  ))}
                  {teacher.subjects.slice(0, 3).map(({ subject }) => (
                    <Badge key={subject.id} variant="outline">
                      {subject.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
