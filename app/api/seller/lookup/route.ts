import { NextResponse } from "next/server";
import { normalizePhoneDigits, requiresSellerOtp } from "@/lib/seller-otp-config";
import { readStore } from "@/lib/store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const digits = normalizePhoneDigits(String(body.phone ?? ""));
  if (digits.length < 10) {
    return NextResponse.json({ error: "Enter a valid mobile number" }, { status: 400 });
  }
  const ten = digits.slice(-10);
  const data = await readStore();
  const registered = data.sellers.some((s) => s.phone === ten);
  return NextResponse.json({
    phone: ten,
    registered,
    requiresOtp: requiresSellerOtp(ten),
  });
}
