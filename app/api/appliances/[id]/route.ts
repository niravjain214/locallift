import { NextResponse } from "next/server";
import { guardSellerOtpRequest } from "@/lib/seller-otp-guard";
import { mutateStore, readStore } from "@/lib/store";
import type { Appliance } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const data = await readStore();
  const appliance = data.appliances.find((a) => a.appliance_id === id);
  if (!appliance || appliance.status === "deleted") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const seller = data.sellers.find((s) => s.phone === appliance.seller_phone);
  return NextResponse.json({
    appliance,
    seller_name: seller?.name ?? "Seller",
    seller_shop: seller?.shop_name ?? "",
  });
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const dataPre = await readStore();
  const curPre = dataPre.appliances.find((a) => a.appliance_id === id);
  if (!curPre) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const denied = await guardSellerOtpRequest(curPre.seller_phone);
  if (denied) return denied;

  let updated: Appliance | null = null;
  await mutateStore((data) => {
    const idx = data.appliances.findIndex((a) => a.appliance_id === id);
    if (idx < 0) return;
    const cur = data.appliances[idx];
    updated = {
      ...cur,
      ...(body.daily_price != null && {
        daily_price: Number(body.daily_price),
      }),
      ...(body.deposit != null && { deposit: Number(body.deposit) }),
      ...(body.name != null && { name: String(body.name) }),
      ...(body.description != null && { description: String(body.description) }),
      ...(body.condition != null && { condition: String(body.condition) }),
      ...(body.category != null && { category: String(body.category) }),
      ...(body.photos != null &&
        Array.isArray(body.photos) && { photos: body.photos.map(String) }),
      ...(body.available_from != null && {
        available_from: String(body.available_from).slice(0, 10),
      }),
      ...(body.available_to != null && {
        available_to: String(body.available_to).slice(0, 10),
      }),
      ...(body.status != null &&
        ["live", "rented", "paused", "deleted"].includes(body.status) && {
          status: body.status as Appliance["status"],
        }),
    };
    data.appliances[idx] = updated;
  });

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ appliance: updated });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const dataPre = await readStore();
  const curPre = dataPre.appliances.find((a) => a.appliance_id === id);
  if (curPre) {
    const denied = await guardSellerOtpRequest(curPre.seller_phone);
    if (denied) return denied;
  }
  await mutateStore((data) => {
    const idx = data.appliances.findIndex((a) => a.appliance_id === id);
    if (idx < 0) return;
    data.appliances[idx] = {
      ...data.appliances[idx],
      status: "deleted",
    };
  });
  return NextResponse.json({ ok: true });
}
