"use client";

import { useActionState } from "react";
import { addAvailabilityAction } from "@/lib/actions/teacher-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/auth/field-error";

export function AddAvailabilityForm() {
  const [state, formAction, pending] = useActionState(addAvailabilityAction, null);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <div className="space-y-2">
        <Label htmlFor="startsAt">Starts</Label>
        <Input id="startsAt" name="startsAt" type="datetime-local" required />
        <FieldError messages={state?.fieldErrors?.startsAt} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="endsAt">Ends</Label>
        <Input id="endsAt" name="endsAt" type="datetime-local" required />
        <FieldError messages={state?.fieldErrors?.endsAt} />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Adding..." : "Add slot"}
      </Button>
      {state?.error && (
        <p className="sm:col-span-3 text-sm text-destructive">{state.error}</p>
      )}
    </form>
  );
}
