import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyAdminCookie } from "@/lib/admin-auth";
import { readStore } from "@/lib/store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const c = (await cookies()).get("locallift_admin")?.value;
  if (!(await verifyAdminCookie(c))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const data = await readStore();
  return NextResponse.json(data);
}
