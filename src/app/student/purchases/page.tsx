import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Download } from "lucide-react";
import { CurriculumBadge } from "@/components/curriculum-badge";
import { EmptyState } from "@/components/empty-state";
import { CURRICULUM_COLORS } from "@/lib/colors";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export default async function StudentPurchasesPage() {
  const user = await requireRole("STUDENT");

  const purchases = await db.documentPurchase.findMany({
    where: {
      studentId: user.studentProfile!.id,
      payment: { status: "SUCCESS" },
    },
    include: { document: { include: { subject: true, teacher: { include: { user: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">My library</h1>

      <div className="space-y-3">
        {purchases.length === 0 && (
          <EmptyState
            icon={BookOpen}
            title="Your library is empty"
            description="Browse the marketplace for notes and past papers from verified teachers."
            action={
              <Button size="sm" render={<Link href="/student/documents" />}>
                Browse marketplace
              </Button>
            }
          />
        )}
        {purchases.map((purchase) => (
          <Card key={purchase.id}>
            <CardContent className="flex flex-wrap items-center gap-4 p-4">
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                  CURRICULUM_COLORS[purchase.document.subject.curriculum].badge
                )}
              >
                <BookOpen className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{purchase.document.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <CurriculumBadge curriculum={purchase.document.subject.curriculum} />
                  <span className="text-xs text-muted-foreground">
                    {purchase.document.subject.name} · by{" "}
                    {purchase.document.teacher.user.name} · bought{" "}
                    {formatDate(purchase.createdAt)}
                  </span>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="gap-2"
                render={<a href={`/api/documents/${purchase.document.id}/download`} />}
              >
                <Download className="h-4 w-4" /> Download
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
