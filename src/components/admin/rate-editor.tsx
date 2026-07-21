"use client";

import { useActionState } from "react";
import { updateRateAction } from "@/lib/actions/admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RateEditor({
  subjectId,
  currentRate,
}: {
  subjectId: string;
  currentRate: number;
}) {
  const [, formAction, pending] = useActionState(updateRateAction, null);

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="subjectId" value={subjectId} />
      <span className="text-sm text-muted-foreground">KES</span>
      <Input
        name="hourlyRateKES"
        type="number"
        min={50}
        step={10}
        defaultValue={currentRate}
        className="h-8 w-24"
      />
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        Save
      </Button>
    </form>
  );
}
