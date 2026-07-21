import { NextResponse } from "next/server";

// Safaricom Daraja posts here if a B2C payout request times out in their queue.
export async function POST() {
  return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
}
