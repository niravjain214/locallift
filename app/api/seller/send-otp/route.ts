import { NextResponse } from "next/server";
import { normalizePhoneDigits, requiresSellerOtp, toIndiaE164 } from "@/lib/seller-otp-config";
import { sendVerificationSms } from "@/lib/twilio-verify";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const digits = normalizePhoneDigits(String(body.phone ?? ""));
  const ten = digits.slice(-10);
  if (ten.length < 10) {
    return NextResponse.json({ error: "Enter a valid mobile number" }, { status: 400 });
  }
  if (!requiresSellerOtp(ten)) {
    return NextResponse.json(
      { error: "OTP is not required for this number" },
      { status: 400 }
    );
  }
  try {
    await sendVerificationSms(toIndiaE164(ten));
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to send code";
    return NextResponse.json(
      { error: msg.includes("not configured") ? "SMS verification is not configured on the server" : msg },
      { status: 503 }
    );
  }
  return NextResponse.json({ ok: true });
}
