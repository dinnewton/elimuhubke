"use client";

import { useActionState, useEffect, useRef } from "react";
import { createExerciseAction } from "@/lib/actions/exercise-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/auth/field-error";

export function CreateExerciseForm({ bookingId }: { bookingId: string }) {
  const [state, formAction, pending] = useActionState(createExerciseAction, null);
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state?.error && !state?.fieldErrors) {
      formRef.current?.reset();
    }
    wasPending.current = pending;
  }, [pending, state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <input type="hidden" name="bookingId" value={bookingId} />
      <div className="space-y-2">
        <Label htmlFor="ex-title">Exercise title</Label>
        <Input id="ex-title" name="title" placeholder="Fractions worksheet 3" required />
        <FieldError messages={state?.fieldErrors?.title} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ex-instructions">Instructions (optional)</Label>
        <Textarea
          id="ex-instructions"
          name="instructions"
          rows={2}
          placeholder="Complete questions 1-10 and show your working."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ex-file">Attach a file (optional)</Label>
        <Input id="ex-file" name="file" type="file" />
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Sending..." : "Send exercise"}
      </Button>
    </form>
  );
}
