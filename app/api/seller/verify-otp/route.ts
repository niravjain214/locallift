import { NextResponse } from "next/server";
import { adminSessionToken } from "@/lib/admin-auth";
import { isAdminPhone } from "@/lib/admin-phone";
import { normalizePhoneDigits, requiresSellerOtp, toIndiaE164 } from "@/lib/seller-otp-config";
import { sellerOtpCookieName, signSellerOtpSession } from "@/lib/seller-otp-session";
import { checkVerificationCode } from "@/lib/twilio-verify";

const adminCookieOpts = {
  httpOnly: true,
  path: "/",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 14,
  secure: process.env.NODE_ENV === "production",
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const digits = normalizePhoneDigits(String(body.phone ?? ""));
  const ten = digits.slice(-10);
  const code = String(body.code ?? "");
  if (ten.length < 10 || !code.trim()) {
    return NextResponse.json({ error: "Phone and OTP required" }, { status: 400 });
  }
  if (!requiresSellerOtp(ten)) {
    return NextResponse.json({ error: "OTP is not required for this number" }, { status: 400 });
  }
  let approved: boolean;
  try {
    approved = await checkVerificationCode(toIndiaE164(ten), code);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Verification failed";
    return NextResponse.json({ error: msg }, { status: 503 });
  }
  if (!approved) {
    return NextResponse.json({ error: "Invalid or expired code" }, { status: 401 });
  }

  if (isAdminPhone(ten)) {
    const secret = process.env.ADMIN_SECRET;
    if (!secret || secret.length < 16) {
      return NextResponse.json(
        { error: "Admin is not configured (ADMIN_SECRET must be 16+ characters)" },
        { status: 503 }
      );
    }
    const token = await adminSessionToken(secret);
    const res = NextResponse.json({ ok: true, phone: ten, next: "admin" as const });
    res.cookies.set("locallift_admin", token, adminCookieOpts);
    return res;
  }

  let jwt: string;
  try {
    jwt = await signSellerOtpSession(ten);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Session error";
    return NextResponse.json({ error: msg }, { status: 503 });
  }
  const res = NextResponse.json({ ok: true, phone: ten, next: "seller" as const });
  res.cookies.set(sellerOtpCookieName(), jwt, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
