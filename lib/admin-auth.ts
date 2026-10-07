/** Session token — Web Crypto SHA-256, works in Edge middleware and Node routes. */
export async function adminSessionToken(secret: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`locallift:${secret}`)
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyAdminCookie(
  cookieVal: string | undefined
): Promise<boolean> {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || !cookieVal) return false;
  const expected = await adminSessionToken(secret);
  return cookieVal === expected;
}
