"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitExerciseResponseAction } from "@/lib/actions/exercise-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function SubmitExerciseForm({ exerciseId }: { exerciseId: string }) {
  const [state, formAction, pending] = useActionState(submitExerciseResponseAction, null);
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state?.error && !state?.fieldErrors) {
      formRef.current?.reset();
    }
    wasPending.current = pending;
  }, [pending, state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-2 rounded-lg border border-dashed p-3">
      <input type="hidden" name="exerciseId" value={exerciseId} />
      <p className="text-xs font-medium text-muted-foreground">Submit your work</p>
      <Input name="file" type="file" required className="h-8 text-xs" />
      <Textarea
        name="note"
        rows={2}
        placeholder="Note for your teacher (optional)"
        className="text-xs"
      />
      {state?.error && <p className="text-xs text-destructive">{state.error}</p>}
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        {pending ? "Uploading..." : "Send response"}
      </Button>
    </form>
  );
}
