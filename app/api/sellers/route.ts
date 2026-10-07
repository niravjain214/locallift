import { NextResponse } from "next/server";
import { newSellerId } from "@/lib/ids";
import { guardSellerOtpRequest } from "@/lib/seller-otp-guard";
import { normalizePhoneDigits } from "@/lib/seller-otp-config";
import { ensureAreasActiveForServiceAreas } from "@/lib/ensure-areas-active";
import { mutateStore, appendSellerRow } from "@/lib/store";
import type { Seller } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
  const body = await request.json();
  const phone = normalizePhoneDigits(String(body.phone ?? "")).slice(-10);
  if (phone.length < 10) {
    return NextResponse.json({ error: "Valid phone required" }, { status: 400 });
  }
  const denied = await guardSellerOtpRequest(phone);
  if (denied) return denied;
  const name = String(body.name ?? "").trim();
  if (!name) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }
  const address = String(body.address ?? "").trim();
  if (!address) {
    return NextResponse.json({ error: "Address required" }, { status: 400 });
  }
  const serviceAreas = Array.isArray(body.service_areas)
    ? body.service_areas.map(String)
    : [];
  if (!serviceAreas.length) {
    return NextResponse.json(
      { error: "Select at least one service area" },
      { status: 400 }
    );
  }
  const upi_id = String(body.upi_id ?? "").trim();
  if (!upi_id) {
    return NextResponse.json({ error: "UPI ID required" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const seller: Seller = {
    seller_id: newSellerId(phone),
    phone,
    name,
    shop_name: String(body.shop_name ?? "").trim(),
    address,
    service_areas: serviceAreas.join(","),
    upi_id,
    whatsapp_phone: String(body.whatsapp_phone ?? "").trim(),
    status: "active",
    joined_at: now,
    total_earnings: 0,
    last_payout_at: "",
  };

  await mutateStore((data) => {
    const idx = data.sellers.findIndex((s) => s.phone === phone);
    if (idx >= 0) {
      data.sellers[idx] = { ...data.sellers[idx], ...seller };
    } else {
      data.sellers.push(seller);
    }
    ensureAreasActiveForServiceAreas(data, seller.service_areas);
  });

  try {
    await appendSellerRow(seller);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to register seller";
    return NextResponse.json(
      { error: `Failed to register seller: ${msg}` },
      { status: 503 }
    );
  }

  return NextResponse.json({ ok: true, seller });
}
