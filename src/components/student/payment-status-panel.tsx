"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Smartphone, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  simulatePaymentFailureAction,
  simulatePaymentSuccessAction,
  retryPaymentAction,
} from "@/lib/actions/payment-actions";
import type { PaymentStatus } from "@/generated/prisma/client";

export function PaymentStatusPanel({
  paymentId,
  status,
  mockMode,
}: {
  paymentId: string;
  status: PaymentStatus;
  mockMode: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (status !== "PENDING") return;
    const interval = setInterval(() => router.refresh(), 3000);
    return () => clearInterval(interval);
  }, [status, router]);

  if (status === "SUCCESS") {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/15">
          <CheckCircle2 className="h-9 w-9 text-emerald-600 dark:text-emerald-400" />
        </span>
        <p className="text-lg font-semibold">Payment received</p>
        <p className="text-sm text-muted-foreground">
          Your payment was confirmed via M-Pesa.
        </p>
      </div>
    );
  }

  if (status === "FAILED") {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/15">
          <XCircle className="h-9 w-9 text-red-600 dark:text-red-400" />
        </span>
        <p className="text-lg font-semibold">Payment failed</p>
        <p className="text-sm text-muted-foreground">
          The M-Pesa request wasn&apos;t completed. You can try again.
        </p>
        <Button
          disabled={isPending}
          onClick={() => startTransition(() => retryPaymentAction(paymentId))}
        >
          Retry payment
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 py-6 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <Loader2 className="h-9 w-9 animate-spin text-primary" />
      </span>
      <p className="text-lg font-semibold">Waiting for M-Pesa confirmation</p>
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Smartphone className="h-4 w-4" /> Check your phone and enter your M-Pesa PIN.
      </p>
      {mockMode && (
        <div className="mt-4 space-y-2 rounded-lg border border-dashed p-4">
          <p className="text-xs text-muted-foreground">
            Sandbox mode: no real M-Pesa request was sent. Simulate the
            customer&apos;s response:
          </p>
          <div className="flex justify-center gap-2">
            <Button
              size="sm"
              disabled={isPending}
              onClick={() =>
                startTransition(() => simulatePaymentSuccessAction(paymentId))
              }
            >
              Simulate success
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={isPending}
              onClick={() =>
                startTransition(() => simulatePaymentFailureAction(paymentId))
              }
            >
              Simulate failure
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
