import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { curriculumLabel, formatDate } from "@/lib/format";

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
          <p className="text-sm text-muted-foreground">
            Nothing purchased yet — browse the marketplace to get started.
          </p>
        )}
        {purchases.map((purchase) => (
          <Card key={purchase.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-medium">{purchase.document.title}</p>
                <p className="text-xs text-muted-foreground">
                  {curriculumLabel(purchase.document.subject.curriculum)} ·{" "}
                  {purchase.document.subject.name} · by{" "}
                  {purchase.document.teacher.user.name} · bought{" "}
                  {formatDate(purchase.createdAt)}
                </p>
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
