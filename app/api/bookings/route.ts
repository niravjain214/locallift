import { NextResponse } from "next/server";
import { normalizePhoneDigits } from "@/lib/seller-otp-config";
import { guardSellerOtpRequest } from "@/lib/seller-otp-guard";
import { newBookingId } from "@/lib/ids";
import { applianceAvailableForDates } from "@/lib/match";
import { mutateStore, readStore, appendBookingRow } from "@/lib/store";
import type { Booking } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function daysInclusive(start: string, end: string): number {
  const s = new Date(start.slice(0, 10));
  const e = new Date(end.slice(0, 10));
  const diff = Math.round((e.getTime() - s.getTime()) / (24 * 60 * 60 * 1000));
  return diff >= 0 ? diff + 1 : 0;
}

export async function POST(request: Request) {
  const body = await request.json();
  const appliance_id = String(body.appliance_id ?? "");
  const area = String(body.area ?? "").trim();
  const customer_name = String(body.customer_name ?? "").trim();
  const customer_phone = String(body.customer_phone ?? "").replace(/\D/g, "");
  const customer_address = String(body.customer_address ?? "").trim();
  const landmark = String(body.landmark ?? "").trim();
  const start_date = String(body.start_date ?? "").slice(0, 10);
  const end_date = String(body.end_date ?? "").slice(0, 10);

  if (!customer_name || customer_phone.length < 10) {
    return NextResponse.json(
      { error: "Name and valid phone required" },
      { status: 400 }
    );
  }
  if (!customer_address || !landmark) {
    return NextResponse.json(
      { error: "Address and landmark required" },
      { status: 400 }
    );
  }
  if (!start_date || !end_date || !area) {
    return NextResponse.json(
      { error: "Area and dates required" },
      { status: 400 }
    );
  }

  const data = await readStore();
  const appliance = data.appliances.find((a) => a.appliance_id === appliance_id);
  if (!appliance || appliance.status === "deleted") {
    return NextResponse.json({ error: "Appliance not found" }, { status: 404 });
  }
  if (!applianceAvailableForDates(appliance, area, start_date, end_date)) {
    return NextResponse.json(
      { error: "Not available for selected area or dates" },
      { status: 400 }
    );
  }

  const total_days = daysInclusive(start_date, end_date);
  if (total_days <= 0) {
    return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
  }

  const rental_amount = Math.round(appliance.daily_price * total_days * 100) / 100;
  const deposit_amount = appliance.deposit;
  const total_amount = rental_amount + deposit_amount;

  const now = new Date().toISOString();
  const booking: Booking = {
    booking_id: newBookingId(),
    appliance_id,
    seller_phone: appliance.seller_phone,
    customer_name,
    customer_phone,
    customer_whatsapp: Boolean(body.customer_whatsapp),
    customer_address,
    landmark,
    start_date,
    end_date,
    total_days,
    rental_amount,
    deposit_amount,
    total_amount,
    special_requests: String(body.special_requests ?? ""),
    status: "pending",
    payment_status: "pending",
    created_at: now,
    confirmed_at: "",
    delivered_at: "",
    returned_at: "",
    deposit_returned: false,
    notes: "",
  };

  await mutateStore((d) => {
    d.bookings.push(booking);
  });

  await appendBookingRow(booking).catch(() => {});

  return NextResponse.json({
    ok: true,
    booking_id: booking.booking_id,
    message:
      "Booking received! Our team will call you within 30 minutes.",
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("seller_phone");
  const customerRaw = searchParams.get("customer_phone");
  const seller_phone = raw
    ? normalizePhoneDigits(raw).slice(-10)
    : "";
  const customer_phone = customerRaw
    ? normalizePhoneDigits(customerRaw).slice(-10)
    : "";
  if (seller_phone.length >= 10) {
    const denied = await guardSellerOtpRequest(seller_phone);
    if (denied) return denied;
  }
  const data = await readStore();
  let list = data.bookings;
  if (seller_phone) {
    list = list.filter((b) => b.seller_phone === seller_phone);
  }
  if (customer_phone) {
    list = list.filter(
      (b) => normalizePhoneDigits(String(b.customer_phone)).slice(-10) === customer_phone
    );
  }

  const applianceNameById = new Map(
    data.appliances.map((a) => [a.appliance_id, a.name] as const)
  );

  return NextResponse.json({
    bookings: list.map((b) => ({
      ...b,
      appliance_name: applianceNameById.get(b.appliance_id) ?? "Appliance",
    })),
  });
}
