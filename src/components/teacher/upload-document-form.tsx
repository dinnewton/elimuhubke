"use client";

import { useActionState } from "react";
import { uploadDocumentAction } from "@/lib/actions/document-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldError } from "@/components/auth/field-error";
import { curriculumLabel } from "@/lib/format";
import type { Curriculum } from "@/generated/prisma/client";

type Subject = { id: string; name: string; curriculum: Curriculum; gradeLevel: string };

export function UploadDocumentForm({ subjects }: { subjects: Subject[] }) {
  const [state, formAction, pending] = useActionState(uploadDocumentAction, null);
  const subjectItems = Object.fromEntries(
    subjects.map((s) => [s.id, `${curriculumLabel(s.curriculum)} · ${s.name} · ${s.gradeLevel}`])
  );

  if (subjects.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Add subjects to your profile first before uploading documents.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="subjectId">Subject</Label>
        <Select name="subjectId" items={subjectItems}>
          <SelectTrigger id="subjectId" className="w-full">
            <SelectValue placeholder="Select a subject" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {curriculumLabel(s.curriculum)} · {s.name} · {s.gradeLevel}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError messages={state?.fieldErrors?.subjectId} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" placeholder="Grade 6 Maths Revision Notes" required />
        <FieldError messages={state?.fieldErrors?.title} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea id="description" name="description" rows={3} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="priceKES">Price (KES)</Label>
        <Input id="priceKES" name="priceKES" type="number" min={20} step={10} required />
        <FieldError messages={state?.fieldErrors?.priceKES} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="file">File (PDF, DOCX, etc. — max 20MB)</Label>
        <Input id="file" name="file" type="file" required />
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Uploading..." : "Upload document"}
      </Button>
    </form>
  );
}
