"use client";

import { useMemo, useState } from "react";
import { AppHeader } from "@/components/AppHeader";

type BookingRow = {
  booking_id: string;
  appliance_name?: string;
  start_date: string;
  end_date: string;
  status: string;
  payment_status: string;
  rental_amount: number;
  deposit_amount: number;
  total_amount: number;
  created_at: string;
};

export default function OrdersPage() {
  const [phone, setPhone] = useState("");
  const [items, setItems] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    const res = await fetch(
      `/api/bookings?customer_phone=${encodeURIComponent(phone)}`,
      { cache: "no-store" }
    );
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setItems([]);
      setErr(data.error ?? "Unable to fetch orders");
      return;
    }
    const rows = Array.isArray(data.bookings) ? data.bookings : [];
    rows.sort((a: BookingRow, b: BookingRow) =>
      String(b.created_at ?? "").localeCompare(String(a.created_at ?? ""))
    );
    setItems(rows);
  }

  const totals = useMemo(() => {
    return items.reduce(
      (acc, b) => {
        acc.rental += Number(b.rental_amount ?? 0);
        acc.deposit += Number(b.deposit_amount ?? 0);
        acc.total += Number(b.total_amount ?? 0);
        return acc;
      },
      { rental: 0, deposit: 0, total: 0 }
    );
  }, [items]);

  return (
    <>
      <AppHeader />
      <main className="ll-page max-w-4xl pb-20">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            My orders
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 sm:text-base">
            Enter your booking phone number to view order history and payment details.
          </p>
        </div>

        <form
          onSubmit={lookup}
          className="ll-card ll-card-pad mb-6 grid gap-3 sm:grid-cols-[1fr_auto]"
        >
          <input
            required
            type="tel"
            inputMode="numeric"
            placeholder="Enter your mobile number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="ll-input"
          />
          <button
            type="submit"
            disabled={loading}
            className="ll-btn-primary justify-center disabled:opacity-60"
          >
            {loading ? "Loading..." : "View history"}
          </button>
        </form>

        {err && <p className="mb-4 text-sm text-red-600">{err}</p>}

        {!!items.length && (
          <div className="mb-5 grid gap-3 sm:grid-cols-3">
            <div className="ll-card ll-card-pad">
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Rental total</p>
              <p className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">₹{totals.rental}</p>
            </div>
            <div className="ll-card ll-card-pad">
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Deposit total</p>
              <p className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">₹{totals.deposit}</p>
            </div>
            <div className="ll-card ll-card-pad">
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Grand total</p>
              <p className="mt-1 text-xl font-bold text-teal-700">₹{totals.total}</p>
            </div>
          </div>
        )}

        <section className="space-y-3">
          {items.map((b) => (
            <article key={b.booking_id} className="ll-card ll-card-pad">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    {b.appliance_name ?? "Appliance"}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{b.booking_id}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {b.status}
                </span>
              </div>

              <div className="mt-3 grid gap-2 text-sm text-slate-700 dark:text-slate-300 sm:grid-cols-2">
                <p>
                  <span className="text-slate-500 dark:text-slate-400">Dates:</span> {b.start_date} to {b.end_date}
                </p>
                <p>
                  <span className="text-slate-500 dark:text-slate-400">Payment:</span>{" "}
                  <span className="capitalize">{b.payment_status}</span>
                </p>
                <p>
                  <span className="text-slate-500 dark:text-slate-400">Rental:</span> ₹{b.rental_amount}
                </p>
                <p>
                  <span className="text-slate-500 dark:text-slate-400">Deposit:</span> ₹{b.deposit_amount}
                </p>
                <p className="sm:col-span-2 font-semibold text-slate-900 dark:text-slate-100">
                  Total paid/payable: ₹{b.total_amount}
                </p>
              </div>
            </article>
          ))}

          {!loading && !items.length && !err && (
            <p className="text-sm text-slate-500 dark:text-slate-400">No orders yet for this number.</p>
          )}
        </section>
      </main>
    </>
  );
}

