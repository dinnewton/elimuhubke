import Link from "next/link";
import {
  getPlatformTotals,
  getTeacherRevenueSummaries,
  getWeeklyRevenueSeries,
} from "@/lib/analytics";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WeeklyRevenueChart } from "@/components/admin/weekly-revenue-chart";
import { formatDate, formatKES } from "@/lib/format";

const statusVariant = {
  PENDING: "secondary",
  VERIFIED: "default",
  REJECTED: "destructive",
} as const;

export default async function AdminAnalyticsPage() {
  const [totals, teacherSummaries, weeklyRevenue] = await Promise.all([
    getPlatformTotals(),
    getTeacherRevenueSummaries(),
    getWeeklyRevenueSeries(8),
  ]);

  const topTeachers = [...teacherSummaries]
    .sort((a, b) => b.grossKES - a.grossKES)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Platform-wide activity and revenue.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Students</p>
            <p className="mt-1 text-2xl font-semibold">{totals.studentCount}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              +{totals.newStudentsThisWeek} this week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Teachers</p>
            <p className="mt-1 text-2xl font-semibold">{totals.teacherCount}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {totals.verifiedTeacherCount} verified · {totals.pendingVerificationCount} pending
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Gross revenue generated</p>
            <p className="mt-1 text-2xl font-semibold">{formatKES(totals.grossRevenueKES)}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {totals.completedSessions} sessions · {totals.documentsSold} document sales
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Paid to teachers</p>
            <p className="mt-1 text-2xl font-semibold">{formatKES(totals.totalPaidKES)}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatKES(totals.pendingPayoutKES)} pending next payout
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Revenue by week</CardTitle>
          <CardDescription>
            Completed sessions and document sales, last 8 weeks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WeeklyRevenueChart data={weeklyRevenue} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top teachers by revenue generated</CardTitle>
          <CardDescription>
            All-time gross revenue from completed sessions and document sales.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {topTeachers.length === 0 && (
            <p className="text-sm text-muted-foreground">No teacher activity yet.</p>
          )}
          {topTeachers.map((t) => (
            <Link
              key={t.teacherId}
              href="/admin/teachers"
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 transition hover:border-primary"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{t.name}</p>
                  <Badge variant={statusVariant[t.verificationStatus]}>
                    {t.verificationStatus}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Joined {formatDate(t.joinedAt)} · {t.sessionsCompleted} sessions ·{" "}
                  {t.documentsSold} document sales
                </p>
              </div>
              <div className="text-right text-sm">
                <p className="font-semibold">{formatKES(t.grossKES)}</p>
                <p className="text-xs text-muted-foreground">
                  {formatKES(t.netPaidKES)} paid out
                </p>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
