import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { normalizePhoneDigits, requiresSellerOtp } from "@/lib/seller-otp-config";
import { sellerOtpCookieName, verifySellerOtpToken } from "@/lib/seller-otp-session";

/** Returns 401 JSON if this seller must use OTP and the cookie is missing or invalid. */
export async function guardSellerOtpRequest(
  sellerPhoneRaw: string
): Promise<NextResponse | null> {
  const phone = normalizePhoneDigits(sellerPhoneRaw);
  if (!requiresSellerOtp(phone)) return null;

  let token: string | undefined;
  try {
    const jar = await cookies();
    token = jar.get(sellerOtpCookieName())?.value;
  } catch {
    return NextResponse.json(
      { error: "Seller verification required" },
      { status: 401 }
    );
  }

  const ok = await verifySellerOtpToken(token, phone);
  if (ok) return null;
  return NextResponse.json({ error: "Seller verification required" }, { status: 401 });
}
