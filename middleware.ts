import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdminCookie } from "@/lib/admin-auth";
import { normalizePhoneDigits, requiresSellerOtp } from "@/lib/seller-otp-config";
import { sellerOtpCookieName, verifySellerOtpToken } from "@/lib/seller-otp-session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/seller/")) {
    const m = /^\/seller\/([^/]+)/.exec(pathname);
    if (m) {
      const ten = normalizePhoneDigits(decodeURIComponent(m[1])).slice(-10);
      if (ten.length === 10 && requiresSellerOtp(ten)) {
        const token = request.cookies.get(sellerOtpCookieName())?.value;
        const ok = await verifySellerOtpToken(token, ten);
        if (!ok) {
          const u = request.nextUrl.clone();
          u.pathname = "/sell/start";
          u.searchParams.set("phone", ten);
          return NextResponse.redirect(u);
        }
      }
    }
  }

  if (!pathname.startsWith("/admin")) return NextResponse.next();
  if (pathname.startsWith("/admin/login")) return NextResponse.next();

  const token = request.cookies.get("locallift_admin")?.value;
  const ok = await verifyAdminCookie(token);
  if (!ok) {
    const u = request.nextUrl.clone();
    u.pathname = "/admin/login";
    u.searchParams.set("next", pathname);
    return NextResponse.redirect(u);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/seller/:path*"],
};
