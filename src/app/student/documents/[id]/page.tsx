import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PurchaseDocumentForm } from "@/components/student/purchase-document-form";
import { curriculumLabel, formatKES } from "@/lib/format";

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
        <Badge variant="secondary">
          {curriculumLabel(document.subject.curriculum)} · {document.subject.name} ·{" "}
          {document.subject.gradeLevel}
        </Badge>
        <h1 className="text-2xl font-semibold tracking-tight">{document.title}</h1>
        <p className="text-sm text-muted-foreground">by {document.teacher.user.name}</p>
        {document.description && (
          <p className="text-sm text-muted-foreground">{document.description}</p>
        )}
      </div>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="text-base">{formatKES(document.priceKES)}</CardTitle>
        </CardHeader>
        <CardContent>
          {alreadyOwned ? (
            <p className="text-sm text-muted-foreground">
              You already own this — check your{" "}
              <a href="/student/purchases" className="text-primary underline">
                library
              </a>
              .
            </p>
          ) : (
            <PurchaseDocumentForm documentId={document.id} defaultPhone={user.phone} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
