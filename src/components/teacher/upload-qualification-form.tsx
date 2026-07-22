"use client";

import { useActionState } from "react";
import { uploadQualificationAction } from "@/lib/actions/qualification-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/auth/field-error";

export function UploadQualificationForm() {
  const [state, formAction, pending] = useActionState(uploadQualificationAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="qual-title">Title</Label>
        <Input
          id="qual-title"
          name="title"
          placeholder="Bachelor of Education certificate"
          required
        />
        <FieldError messages={state?.fieldErrors?.title} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="qual-file">File (PDF, image — max 20MB)</Label>
        <Input id="qual-file" name="file" type="file" required />
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Uploading..." : "Upload document"}
      </Button>
    </form>
  );
}
