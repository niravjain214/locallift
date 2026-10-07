import { NextResponse } from "next/server";
import { mutateStore, readStore } from "@/lib/store";
import type { Booking } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = { params: Promise<{ id: string }> };

const STATUSES: Booking["status"][] = [
  "pending",
  "confirmed",
  "out_for_delivery",
  "active",
  "return_due",
  "completed",
  "cancelled",
];

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();

  let updated: Booking | null = null;
  await mutateStore((data) => {
    const idx = data.bookings.findIndex((b) => b.booking_id === id);
    if (idx < 0) return;
    const cur = data.bookings[idx];
    const nextStatus =
      body.status != null && STATUSES.includes(body.status)
        ? (body.status as Booking["status"])
        : cur.status;
    const now = new Date().toISOString();

    let confirmed_at = cur.confirmed_at;
    let delivered_at = cur.delivered_at;
    let returned_at = cur.returned_at;

    if (nextStatus === "confirmed" && !confirmed_at) confirmed_at = now;
    if (nextStatus === "active" && !delivered_at) delivered_at = now;
    if (nextStatus === "completed" && !returned_at) returned_at = now;

    updated = {
      ...cur,
      status: nextStatus,
      confirmed_at,
      delivered_at,
      returned_at,
      ...(body.payment_status != null && {
        payment_status: body.payment_status as Booking["payment_status"],
      }),
      ...(body.notes != null && { notes: String(body.notes) }),
      ...(body.deposit_returned != null && {
        deposit_returned: Boolean(body.deposit_returned),
      }),
    };
    data.bookings[idx] = updated;
  });

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ booking: updated });
}

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const data = await readStore();
  const booking = data.bookings.find((b) => b.booking_id === id);
  if (!booking) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ booking });
}
