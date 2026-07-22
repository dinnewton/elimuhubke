import "server-only";
import { db } from "@/lib/db";

const shortDateFormatter = new Intl.DateTimeFormat("en-KE", {
  day: "numeric",
  month: "short",
});

export type TeacherRevenueSummary = {
  teacherId: string;
  name: string;
  email: string;
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
  joinedAt: Date;
  sessionsCompleted: number;
  documentsSold: number;
  grossKES: number;
  netPaidKES: number;
};

// All-time revenue a teacher has generated (completed sessions + successful
// document sales), regardless of whether it's been paid out yet.
export async function getTeacherRevenueSummaries(): Promise<TeacherRevenueSummary[]> {
  const teachers = await db.teacherProfile.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  return Promise.all(
    teachers.map(async (teacher) => {
      const [bookingsAgg, bookingsCount, purchasesAgg, purchasesCount, paidAgg] =
        await Promise.all([
          db.booking.aggregate({
            where: { teacherId: teacher.id, status: "COMPLETED" },
            _sum: { totalKES: true },
          }),
          db.booking.count({
            where: { teacherId: teacher.id, status: "COMPLETED" },
          }),
          db.documentPurchase.aggregate({
            where: {
              document: { teacherId: teacher.id },
              payment: { status: "SUCCESS" },
            },
            _sum: { priceKES: true },
          }),
          db.documentPurchase.count({
            where: {
              document: { teacherId: teacher.id },
              payment: { status: "SUCCESS" },
            },
          }),
          db.payout.aggregate({
            where: { teacherId: teacher.id, status: "PAID" },
            _sum: { netKES: true },
          }),
        ]);

      return {
        teacherId: teacher.id,
        name: teacher.user.name,
        email: teacher.user.email,
        verificationStatus: teacher.verificationStatus,
        joinedAt: teacher.createdAt,
        sessionsCompleted: bookingsCount,
        documentsSold: purchasesCount,
        grossKES: (bookingsAgg._sum.totalKES ?? 0) + (purchasesAgg._sum.priceKES ?? 0),
        netPaidKES: paidAgg._sum.netKES ?? 0,
      };
    })
  );
}

export type PlatformTotals = {
  studentCount: number;
  teacherCount: number;
  verifiedTeacherCount: number;
  pendingVerificationCount: number;
  newStudentsThisWeek: number;
  newTeachersThisWeek: number;
  grossRevenueKES: number;
  totalPaidKES: number;
  totalCommissionKES: number;
  pendingPayoutKES: number;
  completedSessions: number;
  documentsSold: number;
};

export async function getPlatformTotals(): Promise<PlatformTotals> {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    studentCount,
    teacherCount,
    verifiedTeacherCount,
    newStudentsThisWeek,
    newTeachersThisWeek,
    bookingsAgg,
    purchasesAgg,
    paidAgg,
  ] = await Promise.all([
    db.studentProfile.count(),
    db.teacherProfile.count(),
    db.teacherProfile.count({ where: { verificationStatus: "VERIFIED" } }),
    db.studentProfile.count({ where: { createdAt: { gte: weekAgo } } }),
    db.teacherProfile.count({ where: { createdAt: { gte: weekAgo } } }),
    db.booking.aggregate({
      where: { status: "COMPLETED" },
      _sum: { totalKES: true },
      _count: true,
    }),
    db.documentPurchase.aggregate({
      where: { payment: { status: "SUCCESS" } },
      _sum: { priceKES: true },
      _count: true,
    }),
    db.payout.aggregate({
      where: { status: "PAID" },
      _sum: { netKES: true, commissionKES: true },
    }),
  ]);

  const grossRevenueKES =
    (bookingsAgg._sum.totalKES ?? 0) + (purchasesAgg._sum.priceKES ?? 0);
  const totalPaidKES = paidAgg._sum.netKES ?? 0;
  const totalCommissionKES = paidAgg._sum.commissionKES ?? 0;

  return {
    studentCount,
    teacherCount,
    verifiedTeacherCount,
    pendingVerificationCount: teacherCount - verifiedTeacherCount,
    newStudentsThisWeek,
    newTeachersThisWeek,
    grossRevenueKES,
    totalPaidKES,
    totalCommissionKES,
    // Money owed to teachers that hasn't cleared a PAID payout yet.
    pendingPayoutKES: Math.max(grossRevenueKES - totalPaidKES - totalCommissionKES, 0),
    completedSessions: bookingsAgg._count,
    documentsSold: purchasesAgg._count,
  };
}

export type WeeklyRevenuePoint = { label: string; totalKES: number };

// Buckets all-time completed-session and document-sale revenue into the last
// `weeksBack` Mon-Sun weeks, oldest first.
export async function getWeeklyRevenueSeries(weeksBack = 8): Promise<WeeklyRevenuePoint[]> {
  const now = new Date();
  const daysSinceMonday = (now.getDay() + 6) % 7;
  const currentWeekMonday = new Date(now);
  currentWeekMonday.setHours(0, 0, 0, 0);
  currentWeekMonday.setDate(currentWeekMonday.getDate() - daysSinceMonday);

  const earliestStart = new Date(currentWeekMonday);
  earliestStart.setDate(earliestStart.getDate() - (weeksBack - 1) * 7);

  const [bookings, purchases] = await Promise.all([
    db.booking.findMany({
      where: { status: "COMPLETED", completedAt: { gte: earliestStart } },
      select: { totalKES: true, completedAt: true },
    }),
    db.documentPurchase.findMany({
      where: { payment: { status: "SUCCESS" }, createdAt: { gte: earliestStart } },
      select: { priceKES: true, createdAt: true },
    }),
  ]);

  const buckets: (WeeklyRevenuePoint & { weekStart: Date })[] = Array.from(
    { length: weeksBack },
    (_, i) => {
      const weekStart = new Date(earliestStart);
      weekStart.setDate(weekStart.getDate() + i * 7);
      return { weekStart, label: shortDateFormatter.format(weekStart), totalKES: 0 };
    }
  );

  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  function addToBucket(date: Date | null, amount: number) {
    if (!date) return;
    const idx = Math.floor((date.getTime() - earliestStart.getTime()) / msPerWeek);
    if (idx >= 0 && idx < buckets.length) buckets[idx].totalKES += amount;
  }

  bookings.forEach((b) => addToBucket(b.completedAt, b.totalKES));
  purchases.forEach((p) => addToBucket(p.createdAt, p.priceKES));

  return buckets.map(({ label, totalKES }) => ({ label, totalKES }));
}
