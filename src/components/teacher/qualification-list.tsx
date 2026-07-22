"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteQualificationAction } from "@/lib/actions/qualification-actions";
import { formatDate } from "@/lib/format";

type Qualification = {
  id: string;
  title: string;
  createdAt: Date;
};

export function QualificationList({ qualifications }: { qualifications: Qualification[] }) {
  const [isPending, startTransition] = useTransition();

  if (qualifications.length === 0) {
    return <p className="text-sm text-muted-foreground">Nothing uploaded yet.</p>;
  }

  return (
    <div className="space-y-2">
      {qualifications.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center justify-between gap-3 rounded-lg border p-3"
        >
          <div className="min-w-0">
            <p className="truncate font-medium">{doc.title}</p>
            <p className="text-xs text-muted-foreground">
              Uploaded {formatDate(doc.createdAt)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              render={<a href={`/api/qualifications/${doc.id}/download`} />}
            >
              <Download className="h-4 w-4" /> View
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  await deleteQualificationAction(doc.id);
                  toast.success("Document removed");
                })
              }
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
