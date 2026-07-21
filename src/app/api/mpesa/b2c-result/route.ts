import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmail, payoutPaidEmail } from "@/lib/email";
import { formatDate, formatKES } from "@/lib/format";

type B2CResultBody = {
  Result: {
    ResultCode: number;
    ResultDesc: string;
    ConversationID: string;
    TransactionID?: string;
  };
};

// Safaricom Daraja posts here once a B2C teacher payout completes or fails.
export async function POST(req: Request) {
  const body = (await req.json()) as B2CResultBody;
  const result = body?.Result;
  if (!result) {
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }

  const payout = await db.payout.findUnique({
    where: { mpesaConversationId: result.ConversationID },
    include: { teacher: { include: { user: true } } },
  });
  if (!payout) {
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }

  if (result.ResultCode === 0) {
    await db.payout.update({
      where: { id: payout.id },
      data: {
        status: "PAID",
        paidAt: new Date(),
        mpesaTransactionId: result.TransactionID,
        resultDescription: result.ResultDesc,
      },
    });

    await sendEmail({
      to: payout.teacher.user.email,
      subject: "You've been paid on ElimuHubKE",
      html: payoutPaidEmail({
        weekRangeText: `${formatDate(payout.weekStart)} – ${formatDate(payout.weekEnd)}`,
        amountText: formatKES(payout.netKES),
      }),
    }).catch((err) => console.error("Failed to send payout email:", err));
  } else {
    await db.payout.update({
      where: { id: payout.id },
      data: { status: "FAILED", resultDescription: result.ResultDesc },
    });
  }

  return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
}
