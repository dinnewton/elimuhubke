import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getUnpaidEarnings } from "@/lib/payouts";
import { getPlatformSettings } from "@/lib/platform-settings";
import { formatDate, formatKES } from "@/lib/format";

const statusVariant = {
  PENDING: "secondary",
  PROCESSING: "outline",
  PAID: "default",
  FAILED: "destructive",
} as const;

export default async function TeacherEarningsPage() {
  const user = await requireRole("TEACHER");
  const teacher = await db.teacherProfile.findUniqueOrThrow({
    where: { userId: user.id },
  });

  const [{ grossKES, bookings, purchases }, settings, payouts] = await Promise.all([
    getUnpaidEarnings(teacher.id),
    getPlatformSettings(),
    db.payout.findMany({
      where: { teacherId: teacher.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const commissionKES = Math.round((grossKES * settings.commissionPercent) / 100);
  const netKES = grossKES - commissionKES;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Earnings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Paid out every week via M-Pesa, minus Tusome&apos;s commission.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Unpaid so far</CardTitle>
          <CardDescription>
            {bookings.length} completed session(s) · {purchases.length} document
            sale(s) — included in the next payout run.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Gross</span>
            <span>{formatKES(grossKES)}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Commission ({settings.commissionPercent}%)</span>
            <span>− {formatKES(commissionKES)}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-primary/10 p-3 font-semibold text-primary">
            <span>Estimated next payout</span>
            <span>{formatKES(netKES)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payout history</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {payouts.length === 0 && (
            <p className="text-sm text-muted-foreground">No payouts yet.</p>
          )}
          {payouts.map((payout) => (
            <div
              key={payout.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">
                    {formatDate(payout.weekStart)} – {formatDate(payout.weekEnd)}
                  </p>
                  <Badge variant={statusVariant[payout.status]}>{payout.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Sent to {payout.phone}</p>
              </div>
              <p className="font-semibold">{formatKES(payout.netKES)}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
