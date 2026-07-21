"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteAvailabilityAction } from "@/lib/actions/teacher-actions";
import { formatDateTime } from "@/lib/format";

type Slot = { id: string; startsAt: Date; endsAt: Date; isBooked: boolean };

export function AvailabilityList({ slots }: { slots: Slot[] }) {
  const [isPending, startTransition] = useTransition();

  if (slots.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No upcoming slots — add one above.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {slots.map((slot) => (
        <div
          key={slot.id}
          className="flex items-center justify-between rounded-lg border p-3"
        >
          <div className="text-sm">
            <span className="font-medium">{formatDateTime(slot.startsAt)}</span>
            <span className="text-muted-foreground"> → {formatDateTime(slot.endsAt)}</span>
          </div>
          {slot.isBooked ? (
            <Badge>Booked</Badge>
          ) : (
            <Button
              size="icon-sm"
              variant="ghost"
              disabled={isPending}
              onClick={() => startTransition(() => deleteAvailabilityAction(slot.id))}
              aria-label="Remove slot"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
