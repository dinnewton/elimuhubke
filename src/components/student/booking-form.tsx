"use client";

import { useActionState } from "react";
import { Wallet } from "lucide-react";
import { createBookingAction } from "@/lib/actions/booking-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldError } from "@/components/auth/field-error";
import { formatDateTime, formatKES } from "@/lib/format";

type Subject = { id: string; name: string; gradeLevel: string; hourlyRateKES: number };
type Slot = { id: string; startsAt: Date; endsAt: Date; durationHours: number };

export function BookingForm({
  subjects,
  slots,
  defaultPhone,
}: {
  subjects: Subject[];
  slots: Slot[];
  defaultPhone: string;
}) {
  const [state, formAction, pending] = useActionState(createBookingAction, null);
  const subjectItems = Object.fromEntries(
    subjects.map((s) => [s.id, `${s.name} · ${s.gradeLevel} · ${formatKES(s.hourlyRateKES)}/hr`])
  );

  if (subjects.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        This teacher hasn&apos;t set up any priced subjects yet.
      </p>
    );
  }

  if (slots.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No open slots right now — check back soon.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="subjectId">Subject</Label>
        <Select name="subjectId" defaultValue={subjects[0].id} items={subjectItems}>
          <SelectTrigger id="subjectId" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name} · {s.gradeLevel} · {formatKES(s.hourlyRateKES)}/hr
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError messages={state?.fieldErrors?.subjectId} />
      </div>

      <div className="space-y-2">
        <Label>Pick a time slot</Label>
        <div className="space-y-2">
          {slots.map((slot, i) => (
            <label
              key={slot.id}
              className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition-colors has-checked:border-primary has-checked:bg-primary/5 hover:border-primary/40"
            >
              <input
                type="radio"
                name="availabilityId"
                value={slot.id}
                defaultChecked={i === 0}
                required
                className="accent-primary"
              />
              <span>
                {formatDateTime(slot.startsAt)} ({slot.durationHours}h)
              </span>
            </label>
          ))}
        </div>
        <FieldError messages={state?.fieldErrors?.availabilityId} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">M-Pesa phone number</Label>
        <Input id="phone" name="phone" defaultValue={defaultPhone} required />
        <FieldError messages={state?.fieldErrors?.phone} />
      </div>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" className="w-full gap-2" disabled={pending}>
        <Wallet className="h-4 w-4" />
        {pending ? "Starting M-Pesa payment..." : "Book & pay via M-Pesa"}
      </Button>
    </form>
  );
}
