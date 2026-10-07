import { SignJWT, jwtVerify } from "jose";
import { normalizePhoneDigits } from "@/lib/seller-otp-config";

const COOKIE_NAME = "locallift_seller_otp";

function getSecretBytes(): Uint8Array | null {
  const s =
    process.env.SELLER_OTP_SESSION_SECRET ?? process.env.ADMIN_SECRET ?? "";
  if (s.length < 16) return null;
  return new TextEncoder().encode(s);
}

function requireSecret(): Uint8Array {
  const b = getSecretBytes();
  if (!b) {
    throw new Error(
      "Set SELLER_OTP_SESSION_SECRET (or ADMIN_SECRET) to at least 16 characters"
    );
  }
  return b;
}

export function sellerOtpCookieName(): string {
  return COOKIE_NAME;
}

export async function signSellerOtpSession(phoneDigits: string): Promise<string> {
  const phone = normalizePhoneDigits(phoneDigits).slice(-10);
  const key = requireSecret();
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(phone)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

export async function verifySellerOtpToken(
  token: string | undefined,
  expectedPhoneDigits: string
): Promise<boolean> {
  if (!token) return false;
  const key = getSecretBytes();
  if (!key) return false;
  const exp = normalizePhoneDigits(expectedPhoneDigits).slice(-10);
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    const sub =
      typeof payload.sub === "string"
        ? normalizePhoneDigits(payload.sub).slice(-10)
        : "";
    return sub.length === 10 && sub === exp;
  } catch {
    return false;
  }
}
