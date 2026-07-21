import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { curriculumLabel } from "@/lib/format";
import { CURRICULA } from "@/lib/validation";
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
          {teachers.length} verified teacher{teachers.length === 1 ? "" : "s"}
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
        {teachers.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No teachers match those filters yet.
          </p>
        )}
        {teachers.map((teacher) => (
          <Link key={teacher.id} href={`/student/teachers/${teacher.id}`}>
            <Card className="h-full transition hover:border-primary hover:shadow-md">
              <CardContent className="space-y-3 p-5">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {initials(teacher.user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{teacher.user.name}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                      {teacher.ratingCount > 0
                        ? teacher.ratingAverage.toFixed(1)
                        : "New"}
                    </div>
                  </div>
                </div>
                {teacher.bio && (
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {teacher.bio}
                  </p>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {teacher.subjects.slice(0, 4).map(({ subject }) => (
                    <Badge key={subject.id} variant="secondary">
                      {curriculumLabel(subject.curriculum)} · {subject.name}
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
