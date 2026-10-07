import { NextResponse } from "next/server";
import { matchesBrowseCategory } from "@/lib/areas";
import { newApplianceId } from "@/lib/ids";
import { applianceVisibleInArea } from "@/lib/match";
import { normalizePhoneDigits } from "@/lib/seller-otp-config";
import { guardSellerOtpRequest } from "@/lib/seller-otp-guard";
import { ensureAreasActiveForServiceAreas } from "@/lib/ensure-areas-active";
import {
  findSellerByPhone,
  mutateStore,
  readStore,
  appendApplianceRow,
} from "@/lib/store";
import type { Appliance } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const area = searchParams.get("area") ?? "";
  const sellerPhoneRaw = searchParams.get("seller_phone");
  const sellerPhone = sellerPhoneRaw
    ? normalizePhoneDigits(sellerPhoneRaw).slice(-10)
    : "";
  if (sellerPhone.length >= 10) {
    const denied = await guardSellerOtpRequest(sellerPhone);
    if (denied) return denied;
  }
  const category = searchParams.get("category") ?? "all";
  const minP = searchParams.get("minPrice");
  const maxP = searchParams.get("maxPrice");
  const sort = searchParams.get("sort") ?? "price_asc";
  const refDate =
    searchParams.get("date") ?? new Date().toISOString().slice(0, 10);

  const data = await readStore();

  let list = data.appliances;

  if (sellerPhone) {
    list = list.filter(
      (a) => a.seller_phone === sellerPhone && a.status !== "deleted"
    );
  } else {
    list = list.filter((a) =>
      area ? applianceVisibleInArea(a, area, refDate) : a.status === "live"
    );
  }

  if (category && category !== "all") {
    list = list.filter((a) => matchesBrowseCategory(a.category, category));
  }
  if (minP) {
    const n = Number(minP);
    if (!Number.isNaN(n)) list = list.filter((a) => a.daily_price >= n);
  }
  if (maxP) {
    const n = Number(maxP);
    if (!Number.isNaN(n)) list = list.filter((a) => a.daily_price <= n);
  }

  list.sort((a, b) => {
    if (sort === "price_desc") return b.daily_price - a.daily_price;
    return a.daily_price - b.daily_price;
  });

  const sellers = Object.fromEntries(
    data.sellers.map((s) => [s.phone, s])
  ) as Record<string, (typeof data.sellers)[0]>;

  return NextResponse.json({
    appliances: list.map((a) => ({
      ...a,
      seller_name: sellers[a.seller_phone]?.name ?? "Seller",
    })),
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const seller_phone = normalizePhoneDigits(
    String(body.seller_phone ?? "")
  ).slice(-10);
  if (seller_phone.length < 10) {
    return NextResponse.json({ error: "Seller phone required" }, { status: 400 });
  }
  const denied = await guardSellerOtpRequest(seller_phone);
  if (denied) return denied;

  const data = await readStore();
  let seller = data.sellers.find((s) => s.phone === seller_phone) ?? null;
  if (!seller) {
    seller = await findSellerByPhone(seller_phone);
  }
  if (!seller || seller.status === "paused") {
    return NextResponse.json(
      { error: "Seller not found or paused" },
      { status: 400 }
    );
  }

  const name = String(body.name ?? "").trim();
  if (!name) {
    return NextResponse.json({ error: "Appliance name required" }, { status: 400 });
  }
  const photos = Array.isArray(body.photos) ? body.photos.map(String) : [];
  if (photos.length < 3) {
    return NextResponse.json(
      { error: "Three photos required" },
      { status: 400 }
    );
  }
  const daily_price = Number(body.daily_price);
  const deposit = Number(body.deposit);
  if (Number.isNaN(daily_price) || daily_price <= 0) {
    return NextResponse.json({ error: "Valid daily price required" }, { status: 400 });
  }
  if (Number.isNaN(deposit) || deposit < 0) {
    return NextResponse.json({ error: "Valid deposit required" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const today = new Date().toISOString().slice(0, 10);
  const appliance: Appliance = {
    appliance_id: newApplianceId(),
    seller_phone,
    name,
    category: String(body.category ?? "Other"),
    photos,
    daily_price,
    deposit,
    description: String(body.description ?? ""),
    condition: String(body.condition ?? "Good"),
    service_areas: seller.service_areas,
    status: "live",
    available_from: String(body.available_from ?? today).slice(0, 10),
    available_to: String(body.available_to ?? "").slice(0, 10),
    created_at: now,
    total_rentals: 0,
    total_earnings: 0,
  };

  await mutateStore((d) => {
    d.appliances.push(appliance);
    ensureAreasActiveForServiceAreas(d, appliance.service_areas);
  });

  // Do not silently swallow Sheets write failures; otherwise the client
  // thinks the listing is live but other instances/environments will show 0.
  try {
    await appendApplianceRow(appliance);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to publish listing";
    return NextResponse.json(
      { error: `Failed to publish listing: ${msg}` },
      { status: 503 }
    );
  }

  return NextResponse.json({ ok: true, appliance });
}
