import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { confirmPaymentSuccess, failPayment } from "@/lib/payments";

type StkCallbackBody = {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: { Name: string; Value?: string | number }[];
      };
    };
  };
};

// Safaricom Daraja posts here after the customer accepts/rejects the STK push.
// We always respond 200 so Safaricom doesn't keep retrying.
export async function POST(req: Request) {
  const body = (await req.json()) as StkCallbackBody;
  const callback = body?.Body?.stkCallback;
  if (!callback) {
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }

  const payment = await db.payment.findUnique({
    where: { mpesaCheckoutRequestId: callback.CheckoutRequestID },
  });
  if (!payment) {
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }

  if (callback.ResultCode === 0) {
    const receipt = callback.CallbackMetadata?.Item.find(
      (i) => i.Name === "MpesaReceiptNumber"
    )?.Value;
    await confirmPaymentSuccess(payment.id, String(receipt ?? "UNKNOWN"));
  } else {
    await failPayment(payment.id, callback.ResultDesc || "Payment failed.");
  }

  return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
}
