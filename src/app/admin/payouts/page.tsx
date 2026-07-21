import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RunPayoutsButton } from "@/components/admin/run-payouts-button";
import { formatDate, formatKES } from "@/lib/format";
import { mpesaMockMode } from "@/lib/mpesa";

const statusVariant = {
  PENDING: "secondary",
  PROCESSING: "outline",
  PAID: "default",
  FAILED: "destructive",
} as const;

export default async function AdminPayoutsPage() {
  const payouts = await db.payout.findMany({
    include: { teacher: { include: { user: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Payouts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pays every teacher for completed sessions and document sales from
            the prior Mon–Sun week, minus platform commission, via M-Pesa
            B2C.
            {mpesaMockMode && " Running in sandbox mode — payouts settle instantly."}
          </p>
        </div>
        <RunPayoutsButton />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">History</CardTitle>
          <CardDescription>Most recent 50 payout runs.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {payouts.length === 0 && (
            <p className="text-sm text-muted-foreground">No payouts yet.</p>
          )}
          {payouts.map((payout) => (
            <div
              key={payout.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{payout.teacher.user.name}</p>
                  <Badge variant={statusVariant[payout.status]}>{payout.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDate(payout.weekStart)} – {formatDate(payout.weekEnd)} ·{" "}
                  {payout.phone}
                </p>
              </div>
              <div className="text-right text-sm">
                <p className="text-muted-foreground">
                  Gross {formatKES(payout.grossKES)} − {payout.commissionPercent}%
                </p>
                <p className="font-semibold">{formatKES(payout.netKES)}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
