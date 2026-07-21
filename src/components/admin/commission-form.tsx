"use client";

import { useActionState } from "react";
import { updateCommissionAction } from "@/lib/actions/admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/auth/field-error";

export function CommissionForm({ currentPercent }: { currentPercent: number }) {
  const [state, formAction, pending] = useActionState(updateCommissionAction, null);

  return (
    <form action={formAction} className="flex items-end gap-3">
      <div className="space-y-2">
        <Label htmlFor="commissionPercent">Platform commission (%)</Label>
        <Input
          id="commissionPercent"
          name="commissionPercent"
          type="number"
          min={0}
          max={80}
          step={1}
          defaultValue={currentPercent}
          className="w-32"
        />
        <FieldError messages={state?.fieldErrors?.commissionPercent} />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save"}
      </Button>
    </form>
  );
}
