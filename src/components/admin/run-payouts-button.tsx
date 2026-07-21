"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { runPayoutsAction } from "@/lib/actions/admin-actions";
import { formatKES } from "@/lib/format";

export function RunPayoutsButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      disabled={isPending}
      className="gap-2"
      onClick={() =>
        startTransition(async () => {
          const summary = await runPayoutsAction();
          if (summary.teachersPaid === 0) {
            toast.info("No unpaid earnings to pay out this run.");
          } else {
            toast.success(
              `Paid ${summary.teachersPaid} teacher(s), total ${formatKES(
                summary.totalNetKES
              )}`
            );
          }
        })
      }
    >
      <PlayCircle className="h-4 w-4" />
      {isPending ? "Running..." : "Run weekly payouts now"}
    </Button>
  );
}
