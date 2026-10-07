import { NextResponse } from "next/server";
import { readStore } from "@/lib/store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const booking_id = String(searchParams.get("booking_id") ?? "").trim();
  const phone = String(searchParams.get("phone") ?? "").replace(/\D/g, "");

  if (!booking_id || phone.length < 10) {
    return NextResponse.json(
      { error: "Booking ID and phone required" },
      { status: 400 }
    );
  }

  const data = await readStore();
  const booking = data.bookings.find(
    (b) => b.booking_id === booking_id && b.customer_phone === phone
  );
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const appliance = data.appliances.find(
    (a) => a.appliance_id === booking.appliance_id
  );

  return NextResponse.json({
    booking,
    appliance_name: appliance?.name ?? "",
  });
}
