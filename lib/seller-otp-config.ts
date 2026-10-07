/** 10-digit Indian mobile digits only (no country code). */
export function normalizePhoneDigits(input: string): string {
  let d = String(input ?? "").replace(/\D/g, "");
  if (d.startsWith("91") && d.length === 12) d = d.slice(2);
  if (d.startsWith("0") && d.length === 11) d = d.slice(1);
  return d;
}

export function toIndiaE164(digits10: string): string {
  const d = normalizePhoneDigits(digits10);
  return d.length >= 10 ? `+91${d.slice(-10)}` : `+91${d}`;
}

/**
 * Comma-separated list in SELLER_OTP_PHONE, e.g. 6398453435,9876543210
 * These numbers must complete Twilio Verify before seller APIs / dashboard.
 */
export function requiresSellerOtp(phoneDigits: string): boolean {
  const raw = process.env.SELLER_OTP_PHONE ?? "6398453435";
  const want = new Set(
    raw
      .split(",")
      .map((s) => normalizePhoneDigits(s.trim()).slice(-10))
      .filter((s) => s.length === 10)
  );
  const d = normalizePhoneDigits(phoneDigits).slice(-10);
  return d.length === 10 && want.has(d);
}
