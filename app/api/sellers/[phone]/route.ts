import { NextResponse } from "next/server";
import { normalizePhoneDigits } from "@/lib/seller-otp-config";
import { guardSellerOtpRequest } from "@/lib/seller-otp-guard";
import { ensureAreasActiveForServiceAreas } from "@/lib/ensure-areas-active";
import { mutateStore, readStore } from "@/lib/store";
import type { Seller } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = { params: Promise<{ phone: string }> };

export async function GET(request: Request, { params }: Params) {
  const { phone: raw } = await params;
  const phone = normalizePhoneDigits(decodeURIComponent(raw)).slice(-10);
  const denied = await guardSellerOtpRequest(phone);
  if (denied) return denied;
  const data = await readStore();
  const seller = data.sellers.find((s) => s.phone === phone) ?? null;
  if (!seller) {
    return NextResponse.json({ error: "Seller not found" }, { status: 404 });
  }
  return NextResponse.json({ seller });
}

export async function PATCH(request: Request, { params }: Params) {
  const { phone: raw } = await params;
  const phone = normalizePhoneDigits(decodeURIComponent(raw)).slice(-10);
  const denied = await guardSellerOtpRequest(phone);
  if (denied) return denied;
  const body = await request.json();

  let updated: Seller | null = null;
  await mutateStore((data) => {
    const idx = data.sellers.findIndex((s) => s.phone === phone);
    if (idx < 0) return;
    const cur = data.sellers[idx];
    updated = {
      ...cur,
      ...(body.name != null && { name: String(body.name) }),
      ...(body.shop_name != null && { shop_name: String(body.shop_name) }),
      ...(body.address != null && { address: String(body.address) }),
      ...(body.upi_id != null && { upi_id: String(body.upi_id) }),
      ...(body.whatsapp_phone != null && {
        whatsapp_phone: String(body.whatsapp_phone),
      }),
      ...(body.service_areas != null && {
        service_areas: Array.isArray(body.service_areas)
          ? body.service_areas.join(",")
          : String(body.service_areas),
      }),
      ...(body.status != null &&
        (body.status === "active" || body.status === "paused") && {
          status: body.status,
        }),
    };
    data.sellers[idx] = updated;
    const newAreas = updated.service_areas;
    ensureAreasActiveForServiceAreas(data, newAreas);
    for (const a of data.appliances) {
      if (a.seller_phone === phone && a.status !== "deleted") {
        a.service_areas = newAreas;
      }
    }
  });

  if (!updated) {
    return NextResponse.json({ error: "Seller not found" }, { status: 404 });
  }
  return NextResponse.json({ seller: updated });
}
