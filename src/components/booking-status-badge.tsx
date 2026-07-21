import { Badge } from "@/components/ui/badge";
import type { BookingStatus } from "@/generated/prisma/client";

const variants: Record<
  BookingStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  AWAITING_PAYMENT: "outline",
  CONFIRMED: "default",
  IN_PROGRESS: "default",
  COMPLETED: "secondary",
  CANCELLED: "destructive",
  NO_SHOW: "destructive",
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
  return <Badge variant={variants[status]}>{labels[status]}</Badge>;
}
