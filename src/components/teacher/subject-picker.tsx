"use client";

import { useTransition } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  addTeacherSubjectAction,
  removeTeacherSubjectAction,
} from "@/lib/actions/teacher-actions";
import { curriculumLabel } from "@/lib/format";
import type { Curriculum } from "@/generated/prisma/client";

type Subject = {
  id: string;
  name: string;
  curriculum: Curriculum;
  gradeLevel: string;
};

export function SubjectPicker({
  availableSubjects,
  mySubjectIds,
}: {
  availableSubjects: Subject[];
  mySubjectIds: string[];
}) {
  const [isPending, startTransition] = useTransition();
  const mySubjects = availableSubjects.filter((s) => mySubjectIds.includes(s.id));
  const otherSubjects = availableSubjects.filter((s) => !mySubjectIds.includes(s.id));

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-medium">You teach</p>
        <div className="flex flex-wrap gap-2">
          {mySubjects.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No subjects added yet — pick from below.
            </p>
          )}
          {mySubjects.map((subject) => (
            <Badge key={subject.id} variant="secondary" className="gap-1 pr-1">
              {curriculumLabel(subject.curriculum)} · {subject.name} ·{" "}
              {subject.gradeLevel}
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  startTransition(() => removeTeacherSubjectAction(subject.id))
                }
                className="ml-1 rounded-full p-0.5 hover:bg-background/50"
                aria-label={`Remove ${subject.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-sm font-medium">Add a subject</p>
        <div className="flex flex-wrap gap-2">
          {otherSubjects.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No more subjects available for your curricula yet.
            </p>
          )}
          {otherSubjects.map((subject) => (
            <Button
              key={subject.id}
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => startTransition(() => addTeacherSubjectAction(subject.id))}
              className="gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              {curriculumLabel(subject.curriculum)} · {subject.name} ·{" "}
              {subject.gradeLevel}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
