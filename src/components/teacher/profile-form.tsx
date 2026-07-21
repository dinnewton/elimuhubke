"use client";

import { useActionState } from "react";
import { updateTeacherProfileAction } from "@/lib/actions/teacher-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/auth/field-error";

export function ProfileForm({
  bio,
  mpesaPayoutPhone,
}: {
  bio: string | null;
  mpesaPayoutPhone: string | null;
}) {
  const [state, formAction, pending] = useActionState(updateTeacherProfileAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" name="bio" rows={4} defaultValue={bio ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="mpesaPayoutPhone">Payout M-Pesa number</Label>
        <Input
          id="mpesaPayoutPhone"
          name="mpesaPayoutPhone"
          placeholder="07XXXXXXXX"
          defaultValue={mpesaPayoutPhone ?? ""}
        />
        <p className="text-xs text-muted-foreground">
          Leave blank to use your account phone number for weekly payouts.
        </p>
        <FieldError messages={state?.fieldErrors?.mpesaPayoutPhone} />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save profile"}
      </Button>
    </form>
  );
}
