"use client";

import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";

const LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  out_for_delivery: "Out for Delivery",
  active: "Active",
  return_due: "Return Due",
  completed: "Completed",
  cancelled: "Cancelled",
  Accepted: "Accepted",
};

export default function TrackPage() {
  const [booking_id, setBid] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [err, setErr] = useState("");

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const params = new URLSearchParams({ booking_id, phone });
    const res = await fetch(`/api/bookings/track?${params}`, { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) {
      setStatus(null);
      setErr(data.error ?? "Not found");
      return;
    }
    setStatus(data.booking.status);
    setName(data.appliance_name ?? "");
  }

  return (
    <>
      <AppHeader />
      <main className="ll-page max-w-lg">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            Track booking
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 sm:text-base">
            Enter your booking ID and the phone number you used when booking.
          </p>
        </div>
        <form
          onSubmit={lookup}
          className="ll-card ll-card-pad flex flex-col gap-4"
        >
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Booking ID
            <input
              required
              value={booking_id}
              onChange={(e) => setBid(e.target.value.trim())}
              placeholder="BK-YYYYMMDD-XXX"
              className="ll-input font-mono text-sm"
            />
          </label>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Phone number
            <input
              required
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="ll-input"
            />
          </label>
          {err && <p className="text-sm text-red-600">{err}</p>}
          <button type="submit" className="ll-btn-primary w-full justify-center">
            Check status
          </button>
        </form>
        {status && (
          <div className="ll-card mt-6 border-emerald-200/80 bg-gradient-to-b from-emerald-50/90 to-white ll-card-pad dark:border-emerald-900/60 dark:from-emerald-950/40 dark:to-slate-900">
            <p className="text-sm font-medium text-emerald-800">Appliance</p>
            <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">{name}</p>
            <p className="mt-4 text-sm text-emerald-800">Status</p>
            <p className="mt-1 text-xl font-bold text-emerald-900">
              {LABELS[status] ?? status}
            </p>
          </div>
        )}
      </main>
    </>
  );
}
