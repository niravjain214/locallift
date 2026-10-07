import { normalizePhoneDigits } from "@/lib/seller-otp-config";

/**
 * Numbers that complete Twilio OTP on /sell/start and are routed to the admin panel.
 * ADMIN_PHONE — comma-separated 10-digit Indian mobiles (default: 6398453435).
 */
export function isAdminPhone(phoneDigits: string): boolean {
  const raw = process.env.ADMIN_PHONE ?? "6398453435";
  const want = new Set(
    raw
      .split(",")
      .map((s) => normalizePhoneDigits(s.trim()).slice(-10))
      .filter((s) => s.length === 10)
  );
  const d = normalizePhoneDigits(phoneDigits).slice(-10);
  return d.length === 10 && want.has(d);
}
