import type { StoreData } from "./local";
import type { Seller, Appliance, Booking, AreaRow } from "@/lib/types";
import { DEHRADUN_AREAS } from "../areas";
import { supabaseAdminClient } from "@/lib/supabase/client";
import { normalizePhoneDigits } from "@/lib/seller-otp-config";

function seedAreas(): AreaRow[] {
  return DEHRADUN_AREAS.map((name, i) => ({
    area_name: name,
    display_order: i,
    active: true,
  }));
}

function toNullableTimestamp(v: string): string | null {
  const s = String(v ?? "").trim();
  if (!s) return null;
  // Keep as ISO string; Postgres timestamptz can parse it.
  return s;
}

function toNullableDate(v: string): string | null {
  const s = String(v ?? "").trim();
  if (!s) return null;
  return s.slice(0, 10);
}

function parseSupabaseNumber(n: unknown): number {
  if (typeof n === "number") return n;
  const s = String(n ?? "").trim();
  const x = Number(s);
  return Number.isFinite(x) ? x : 0;
}

function normalizePhotosForDb(photos: unknown): string[] {
  if (!photos) return [];
  if (Array.isArray(photos)) return photos.map((p) => String(p));
  return [];
}

function getStorageBucket(): string {
  return process.env.SUPABASE_STORAGE_BUCKET ?? "appliance-photos";
}

function parseDataUrl(u: string): { contentType: string; b64: string } | null {
  // Example: data:image/jpeg;base64,/9j/4AAQ...
  const m = /^data:([^;]+);base64,(.+)$/.exec(u);
  if (!m) return null;
  return { contentType: m[1], b64: m[2] };
}

function extFromContentType(contentType: string): string {
  const p = contentType.split("/")[1] ?? "jpg";
  if (p === "jpeg") return "jpg";
  return p;
}

async function photosToPublicUrls(params: {
  applianceId: string;
  sellerPhone: string;
  photos: string[];
}): Promise<string[]> {
  const { applianceId, sellerPhone, photos } = params;

  const supabase = supabaseAdminClient();
  const bucket = getStorageBucket();

  const uploadOne = async (p: string, i: number): Promise<string | null> => {
    if (!p) return null;
    // If already a URL, keep it.
    if (!p.startsWith("data:")) return p;

    const parsed = parseDataUrl(p);
    if (!parsed) return null;

    const ext = extFromContentType(parsed.contentType);
    const objectPath = `${normalizePhoneDigits(sellerPhone).slice(-10)}/${applianceId}/${i}.${ext}`;

    const fileBuf = Buffer.from(parsed.b64, "base64");
    const contentType = parsed.contentType;

    const uploadRes = await supabase.storage
      .from(bucket)
      .upload(objectPath, fileBuf, {
        contentType,
        upsert: true,
      });

    if (uploadRes.error) throw uploadRes.error;

    const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);
    return data.publicUrl;
  };

  const out = await Promise.all(photos.slice(0, 10).map(uploadOne));
  return out.filter(Boolean) as string[];
}

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function readStore(): Promise<StoreData> {
  const supabase = supabaseAdminClient();

  const [sellersRes, appliancesRes, bookingsRes, areasRes] = await Promise.all([
    supabase.from("sellers").select("*"),
    supabase.from("appliances").select("*"),
    supabase.from("bookings").select("*"),
    supabase.from("areas").select("*"),
  ]);

  if (sellersRes.error) throw sellersRes.error;
  if (appliancesRes.error) throw appliancesRes.error;
  if (bookingsRes.error) throw bookingsRes.error;
  if (areasRes.error) throw areasRes.error;

  const areasFromDb = (areasRes.data ?? []).map((a) => ({
    area_name: String(a.area_name),
    display_order: Number(a.display_order ?? 0),
    active: Boolean(a.active),
  })) as AreaRow[];

  const areas = areasFromDb.length ? areasFromDb : seedAreas();

  const sellers = (sellersRes.data ?? []).map((s) => {
    const serviceAreas = String(s.service_areas ?? "");
    return {
      seller_id: String(s.seller_id),
      phone: normalizePhoneDigits(String(s.phone ?? "")),
      name: String(s.name ?? ""),
      shop_name: String(s.shop_name ?? ""),
      address: String(s.address ?? ""),
      service_areas: serviceAreas,
      upi_id: String(s.upi_id ?? ""),
      whatsapp_phone: s.whatsapp_phone ? String(s.whatsapp_phone) : undefined,
      status: (s.status === "paused" ? "paused" : "active") as Seller["status"],
      joined_at: String(s.joined_at ?? ""),
      total_earnings: parseSupabaseNumber(s.total_earnings),
      last_payout_at: String(s.last_payout_at ?? ""),
    } satisfies Seller;
  }) as Seller[];

  const appliances = (appliancesRes.data ?? []).map((a) => ({
    appliance_id: String(a.appliance_id),
    seller_phone: normalizePhoneDigits(String(a.seller_phone ?? "")),
    name: String(a.name ?? ""),
    category: String(a.category ?? ""),
    photos: normalizePhotosForDb(a.photos),
    daily_price: parseSupabaseNumber(a.daily_price),
    deposit: parseSupabaseNumber(a.deposit),
    description: String(a.description ?? ""),
    condition: String(a.condition ?? ""),
    service_areas: String(a.service_areas ?? ""),
    status: (a.status === "paused" ? "paused" : a.status === "deleted" ? "deleted" : a.status === "rented" ? "rented" : "live") as Appliance["status"],
    available_from: toNullableDate(String(a.available_from ?? "")) ?? "",
    available_to: toNullableDate(String(a.available_to ?? "")) ?? "",
    created_at: String(a.created_at ?? ""),
    total_rentals: Number(a.total_rentals ?? 0),
    total_earnings: parseSupabaseNumber(a.total_earnings),
  })) as Appliance[];

  const bookings = (bookingsRes.data ?? []).map((b) => ({
    booking_id: String(b.booking_id),
    appliance_id: String(b.appliance_id),
    seller_phone: normalizePhoneDigits(String(b.seller_phone ?? "")),
    customer_name: String(b.customer_name ?? ""),
    customer_phone: String(b.customer_phone ?? ""),
    customer_whatsapp: Boolean(b.customer_whatsapp),
    customer_address: String(b.customer_address ?? ""),
    landmark: String(b.landmark ?? ""),
    start_date: String(b.start_date ?? ""),
    end_date: String(b.end_date ?? ""),
    total_days: Number(b.total_days ?? 0),
    rental_amount: parseSupabaseNumber(b.rental_amount),
    deposit_amount: parseSupabaseNumber(b.deposit_amount),
    total_amount: parseSupabaseNumber(b.total_amount),
    special_requests: String(b.special_requests ?? ""),
    status: (b.status ?? "pending") as Booking["status"],
    payment_status: (b.payment_status ?? "pending") as Booking["payment_status"],
    created_at: String(b.created_at ?? ""),
    confirmed_at: String(b.confirmed_at ?? ""),
    delivered_at: String(b.delivered_at ?? ""),
    returned_at: String(b.returned_at ?? ""),
    deposit_returned: Boolean(b.deposit_returned),
    notes: String(b.notes ?? ""),
  })) as Booking[];

  return {
    sellers,
    appliances,
    bookings,
    areas,
  };
}

async function upsertAll<T extends Record<string, any>>(
  table: string,
  rows: T[],
  conflictColumn: string
): Promise<void> {
  if (!rows.length) return;
  const supabase = supabaseAdminClient();
  const res = await supabase.from(table).upsert(rows, { onConflict: conflictColumn });
  if (res.error) throw res.error;
}

export async function writeStore(data: StoreData): Promise<void> {
  // Upsert entities. We do not attempt deletes because this app uses soft-delete
  // (`appliances.status = "deleted"`) instead.
  const appliancesWithUrls = await Promise.all(
    data.appliances.map(async (a) => ({
      ...a,
      photos: await photosToPublicUrls({
        applianceId: a.appliance_id,
        sellerPhone: a.seller_phone,
        photos: a.photos,
      }),
      seller_phone: normalizePhoneDigits(a.seller_phone),
      // DB columns use `date`, so never upsert empty strings.
      available_from:
        toNullableDate(String(a.available_from ?? "")) ??
        new Date().toISOString().slice(0, 10),
      available_to: toNullableDate(String(a.available_to ?? "")),
    }))
  );

  const bookingsSanitized = data.bookings.map((b) => ({
    ...b,
    seller_phone: normalizePhoneDigits(b.seller_phone).slice(-10),
    customer_phone: normalizePhoneDigits(b.customer_phone).slice(-10),
    start_date: toNullableDate(b.start_date) ?? new Date().toISOString().slice(0, 10),
    end_date: toNullableDate(b.end_date) ?? new Date().toISOString().slice(0, 10),
    // DB columns use `timestamptz`, so never upsert empty strings.
    confirmed_at: toNullableTimestamp(b.confirmed_at),
    delivered_at: toNullableTimestamp(b.delivered_at),
    returned_at: toNullableTimestamp(b.returned_at),
  }));

  await Promise.all([
    upsertAll("sellers", data.sellers, "seller_id"),
    upsertAll("appliances", appliancesWithUrls, "appliance_id"),
    upsertAll("bookings", bookingsSanitized, "booking_id"),
    upsertAll("areas", data.areas, "area_name"),
  ]);
}

export async function withStore<T>(
  fn: (data: StoreData) => Promise<T> | T
): Promise<T> {
  const data = await readStore();
  return fn(data);
}

export async function mutateStore(
  fn: (data: StoreData) => void | Promise<void>
): Promise<StoreData> {
  const data = await readStore();
  await fn(data);
  await writeStore(data);
  return data;
}

export async function findSellerByPhone(phoneDigits: string): Promise<Seller | null> {
  const supabase = supabaseAdminClient();
  const phone = normalizePhoneDigits(phoneDigits).slice(-10);
  if (phone.length !== 10) return null;
  const res = await supabase.from("sellers").select("*").eq("phone", phone).maybeSingle();
  if (res.error) throw res.error;
  if (!res.data) return null;
  // Reuse `readStore` mapping by converting one-row store shape.
  // For simplicity, map inline.
  const s = res.data as any;
  return {
    seller_id: String(s.seller_id),
    phone: normalizePhoneDigits(String(s.phone)),
    name: String(s.name ?? ""),
    shop_name: String(s.shop_name ?? ""),
    address: String(s.address ?? ""),
    service_areas: String(s.service_areas ?? ""),
    upi_id: String(s.upi_id ?? ""),
    whatsapp_phone: s.whatsapp_phone ? String(s.whatsapp_phone) : undefined,
    status: s.status === "paused" ? "paused" : "active",
    joined_at: String(s.joined_at ?? ""),
    total_earnings: parseSupabaseNumber(s.total_earnings),
    last_payout_at: String(s.last_payout_at ?? ""),
  };
}

export async function listSellersFromDb(): Promise<Seller[]> {
  const supabase = supabaseAdminClient();
  const res = await supabase.from("sellers").select("*");
  if (res.error) throw res.error;
  const sellers = (res.data ?? []).map((s: any) => ({
    seller_id: String(s.seller_id),
    phone: normalizePhoneDigits(String(s.phone ?? "")),
    name: String(s.name ?? ""),
    shop_name: String(s.shop_name ?? ""),
    address: String(s.address ?? ""),
    service_areas: String(s.service_areas ?? ""),
    upi_id: String(s.upi_id ?? ""),
    whatsapp_phone: s.whatsapp_phone ? String(s.whatsapp_phone) : undefined,
    status: s.status === "paused" ? "paused" : "active",
    joined_at: String(s.joined_at ?? ""),
    total_earnings: parseSupabaseNumber(s.total_earnings),
    last_payout_at: String(s.last_payout_at ?? ""),
  })) as Seller[];
  return sellers;
}

export async function listAppliancesFromDb(): Promise<Appliance[]> {
  const supabase = supabaseAdminClient();
  const res = await supabase.from("appliances").select("*");
  if (res.error) throw res.error;
  const appliances = (res.data ?? []).map((a: any) => {
    const status = a.status as Appliance["status"];
    return {
      appliance_id: String(a.appliance_id),
      seller_phone: normalizePhoneDigits(String(a.seller_phone ?? "")),
      name: String(a.name ?? ""),
      category: String(a.category ?? ""),
      photos: normalizePhotosForDb(a.photos),
      daily_price: parseSupabaseNumber(a.daily_price),
      deposit: parseSupabaseNumber(a.deposit),
      description: String(a.description ?? ""),
      condition: String(a.condition ?? ""),
      service_areas: String(a.service_areas ?? ""),
      status: status === "paused" ? "paused" : status === "rented" ? "rented" : status === "deleted" ? "deleted" : "live",
      available_from: String(a.available_from ?? ""),
      available_to: String(a.available_to ?? "") || "",
      created_at: String(a.created_at ?? ""),
      total_rentals: Number(a.total_rentals ?? 0),
      total_earnings: parseSupabaseNumber(a.total_earnings),
    } as Appliance;
  });
  return appliances;
}

export async function appendSellerRow(s: Seller): Promise<void> {
  const supabase = supabaseAdminClient();
  const row = {
    seller_id: s.seller_id,
    phone: normalizePhoneDigits(s.phone).slice(-10),
    name: s.name,
    shop_name: s.shop_name,
    address: s.address,
    service_areas: s.service_areas,
    upi_id: s.upi_id,
    whatsapp_phone: s.whatsapp_phone ?? null,
    status: s.status,
    joined_at: s.joined_at || new Date().toISOString(),
    total_earnings: s.total_earnings,
    last_payout_at: s.last_payout_at ?? "",
  };
  const res = await supabase.from("sellers").upsert(row, { onConflict: "seller_id" });
  if (res.error) throw res.error;
}

export async function appendApplianceRow(a: Appliance): Promise<void> {
  const supabase = supabaseAdminClient();
  const row = {
    appliance_id: a.appliance_id,
    seller_phone: normalizePhoneDigits(a.seller_phone).slice(-10),
    name: a.name,
    category: a.category,
    photos: await photosToPublicUrls({
      applianceId: a.appliance_id,
      sellerPhone: a.seller_phone,
      photos: a.photos,
    }),
    daily_price: a.daily_price,
    deposit: a.deposit,
    description: a.description,
    condition: a.condition,
    service_areas: a.service_areas,
    status: a.status,
    available_from: toNullableDate(a.available_from) ?? new Date().toISOString().slice(0, 10),
    available_to: toNullableDate(a.available_to),
    created_at: a.created_at || new Date().toISOString(),
    total_rentals: a.total_rentals,
    total_earnings: a.total_earnings,
  };
  const res = await supabase.from("appliances").upsert(row, { onConflict: "appliance_id" });
  if (res.error) throw res.error;
}

export async function appendBookingRow(b: Booking): Promise<void> {
  const supabase = supabaseAdminClient();
  const row = {
    booking_id: b.booking_id,
    appliance_id: b.appliance_id,
    seller_phone: normalizePhoneDigits(b.seller_phone).slice(-10),
    customer_name: b.customer_name,
    customer_phone: normalizePhoneDigits(b.customer_phone).slice(-10),
    customer_whatsapp: b.customer_whatsapp,
    customer_address: b.customer_address,
    landmark: b.landmark,
    start_date: toNullableDate(b.start_date) ?? new Date().toISOString().slice(0, 10),
    end_date: toNullableDate(b.end_date) ?? new Date().toISOString().slice(0, 10),
    total_days: b.total_days,
    rental_amount: b.rental_amount,
    deposit_amount: b.deposit_amount,
    total_amount: b.total_amount,
    special_requests: b.special_requests,
    status: b.status,
    payment_status: b.payment_status,
    created_at: b.created_at || new Date().toISOString(),
    confirmed_at: toNullableTimestamp(b.confirmed_at),
    delivered_at: toNullableTimestamp(b.delivered_at),
    returned_at: toNullableTimestamp(b.returned_at),
    deposit_returned: b.deposit_returned,
    notes: b.notes,
  };
  const res = await supabase.from("bookings").upsert(row, { onConflict: "booking_id" });
  if (res.error) throw res.error;
}

