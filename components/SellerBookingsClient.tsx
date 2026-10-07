"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import type { Booking } from "@/lib/types";

type Props = { phone: string };

export function SellerBookingsClient({ phone }: Props) {
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    fetch(`/api/bookings?seller_phone=${encodeURIComponent(phone)}`, {
      credentials: "include",
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((d) => setBookings(d.bookings ?? []));
  }, [phone]);

  const sections = {
    pending: bookings.filter((b) => b.status === "pending"),
    active: bookings.filter((b) =>
      ["confirmed", "out_for_delivery", "active", "return_due"].includes(b.status)
    ),
    done: bookings.filter((b) => b.status === "completed"),
  };

  return (
    <>
      <AppHeader variant="seller" />
      <main className="ll-page max-w-4xl space-y-6 sm:space-y-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Bookings
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Requests, active rentals, and history
            </p>
          </div>
          <Link
            href={`/seller/${encodeURIComponent(phone)}`}
            className="ll-btn-secondary w-full justify-center sm:w-auto"
          >
            ← Dashboard
          </Link>
        </div>
        <Section title="New requests" items={sections.pending} />
        <Section title="Active rentals" items={sections.active} detailed />
        <Section title="Completed" items={sections.done} />
      </main>
    </>
  );
}

function Section({
  title,
  items,
  detailed,
}: {
  title: string;
  items: Booking[];
  detailed?: boolean;
}) {
  return (
    <section className="ll-card ll-card-pad">
      <h2 className="font-semibold text-slate-900">{title}</h2>
      <ul className="mt-3 space-y-3 text-sm">
        {items.map((b) => (
          <li
            key={b.booking_id}
            className="rounded-xl border border-slate-100 bg-slate-50/90 p-4 shadow-sm"
          >
            <p className="font-mono text-xs text-slate-500">{b.booking_id}</p>
            <p className="font-medium">
              {b.customer_name} · {b.customer_phone}
            </p>
            <p className="text-slate-600">
              {b.start_date} → {b.end_date} · ₹{b.total_amount} ({b.status})
            </p>
            {detailed && (
              <p className="mt-1 text-xs text-slate-500">{b.customer_address}</p>
            )}
          </li>
        ))}
        {!items.length && <li className="text-slate-500">None</li>}
      </ul>
    </section>
  );
}
