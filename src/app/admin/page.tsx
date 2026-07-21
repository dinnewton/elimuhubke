import Link from "next/link";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatKES } from "@/lib/format";

export default async function AdminOverviewPage() {
  const [studentCount, teacherCount, pendingVerification, subjectCount, payoutsPaid] =
    await Promise.all([
      db.studentProfile.count(),
      db.teacherProfile.count(),
      db.teacherProfile.count({ where: { verificationStatus: "PENDING" } }),
      db.subject.count(),
      db.payout.aggregate({ _sum: { netKES: true }, where: { status: "PAID" } }),
    ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Students</p>
            <p className="mt-1 text-2xl font-semibold">{studentCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Teachers</p>
            <p className="mt-1 text-2xl font-semibold">{teacherCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Subjects tracked</p>
            <p className="mt-1 text-2xl font-semibold">{subjectCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total paid to teachers</p>
            <p className="mt-1 text-2xl font-semibold">
              {formatKES(payoutsPaid._sum.netKES ?? 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {pendingVerification > 0 && (
        <Card className="border-accent/40 bg-accent/10">
          <CardContent className="flex items-center justify-between p-4">
            <p className="text-sm">
              {pendingVerification} teacher(s) awaiting verification.
            </p>
            <Button size="sm" render={<Link href="/admin/teachers" />}>
              Review
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick links</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline" render={<Link href="/admin/subjects" />}>
            Manage subjects &amp; rates
          </Button>
          <Button variant="outline" render={<Link href="/admin/payouts" />}>
            Run weekly payouts
          </Button>
          <Button variant="outline" render={<Link href="/admin/settings" />}>
            Platform settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
