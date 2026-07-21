"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { markBookingCompleteAction } from "@/lib/actions/teacher-actions";

export function MarkCompleteButton({ bookingId }: { bookingId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await markBookingCompleteAction(bookingId);
          toast.success("Session marked complete");
        })
      }
    >
      Mark complete
    </Button>
  );
}
