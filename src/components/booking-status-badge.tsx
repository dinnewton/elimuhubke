import { Badge } from "@/components/ui/badge";
import type { BookingStatus } from "@/generated/prisma/client";

const classNames: Record<BookingStatus, string> = {
  AWAITING_PAYMENT:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  CONFIRMED:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  IN_PROGRESS: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  COMPLETED: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  CANCELLED:
    "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  NO_SHOW: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
};

const labels: Record<BookingStatus, string> = {
  AWAITING_PAYMENT: "Awaiting payment",
  CONFIRMED: "Confirmed",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "No-show",
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return <Badge className={classNames[status]}>{labels[status]}</Badge>;
}
