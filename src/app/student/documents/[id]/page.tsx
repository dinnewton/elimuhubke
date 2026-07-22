import { notFound } from "next/navigation";
import { BookOpen, CheckCircle2 } from "lucide-react";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CurriculumBadge } from "@/components/curriculum-badge";
import { PurchaseDocumentForm } from "@/components/student/purchase-document-form";
import { CURRICULUM_COLORS } from "@/lib/colors";
import { formatKES } from "@/lib/format";
import { cn } from "@/lib/utils";

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireRole("STUDENT");

  const document = await db.document.findUnique({
    where: { id },
    include: { subject: true, teacher: { include: { user: true } } },
  });
  if (!document || !document.isPublished) notFound();

  const alreadyOwned = await db.documentPurchase.findFirst({
    where: {
      documentId: id,
      studentId: user.studentProfile!.id,
      payment: { status: "SUCCESS" },
    },
  });

  return (
    <div className="mx-auto grid max-w-3xl gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="space-y-4">
        <span
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-2xl",
            CURRICULUM_COLORS[document.subject.curriculum].badge
          )}
        >
          <BookOpen className="h-7 w-7" />
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <CurriculumBadge curriculum={document.subject.curriculum} />
          <span className="text-sm text-muted-foreground">
            {document.subject.name} · {document.subject.gradeLevel}
          </span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">{document.title}</h1>
        <p className="text-sm text-muted-foreground">by {document.teacher.user.name}</p>
        {document.description && (
          <p className="text-sm text-muted-foreground">{document.description}</p>
        )}
      </div>

      <Card className="h-fit overflow-hidden">
        <div className="h-1.5 w-full bg-amber-400" />
        <CardHeader>
          <CardTitle className="text-2xl text-amber-600 dark:text-amber-400">
            {formatKES(document.priceKES)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alreadyOwned ? (
            <div className="flex items-start gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                You already own this — check your{" "}
                <a href="/student/purchases" className="font-medium underline">
                  library
                </a>
                .
              </p>
            </div>
          ) : (
            <PurchaseDocumentForm documentId={document.id} defaultPhone={user.phone} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
