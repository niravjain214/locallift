import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyAdminCookie } from "@/lib/admin-auth";
import { mutateStore } from "@/lib/store";

export async function POST(request: Request) {
  const c = (await cookies()).get("locallift_admin")?.value;
  if (!(await verifyAdminCookie(c))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const area_name = String(body.area_name ?? "").trim();
  const active = Boolean(body.active);
  if (!area_name) {
    return NextResponse.json({ error: "area_name required" }, { status: 400 });
  }

  await mutateStore((data) => {
    const idx = data.areas.findIndex((a) => a.area_name === area_name);
    if (idx >= 0) data.areas[idx].active = active;
    else
      data.areas.push({
        area_name,
        display_order: data.areas.length,
        active,
      });
  });

  return NextResponse.json({ ok: true });
}
