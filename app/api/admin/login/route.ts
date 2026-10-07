import { NextResponse } from "next/server";
import { adminSessionToken } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const password = String(body.password ?? "");
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Admin is not configured" }, { status: 503 });
  }
  if (password !== secret) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }
  const token = await adminSessionToken(secret);
  const res = NextResponse.json({ ok: true });
  res.cookies.set("locallift_admin", token, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 14,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
