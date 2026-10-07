import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const url = new URL(request.url);
  const res = NextResponse.redirect(new URL("/admin/login", url.origin));
  res.cookies.set("locallift_admin", "", { path: "/", maxAge: 0 });
  return res;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const res = NextResponse.redirect(new URL("/admin/login", url.origin));
  res.cookies.set("locallift_admin", "", { path: "/", maxAge: 0 });
  return res;
}
