"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  rejectTeacherAction,
  verifyTeacherAction,
} from "@/lib/actions/admin-actions";

export function TeacherVerifyButtons({ teacherProfileId }: { teacherProfileId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await verifyTeacherAction(teacherProfileId);
            toast.success("Teacher verified");
          })
        }
      >
        Verify
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await rejectTeacherAction(teacherProfileId);
            toast.error("Teacher rejected");
          })
        }
      >
        Reject
      </Button>
    </div>
  );
}
