"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminProductLookup } from "@/components/AdminProductLookup";
import type { StoreData } from "@/lib/store";
import { fetchAdminSnapshot } from "@/lib/admin-fetch";

export default function AdminHomePage() {
  const [data, setData] = useState<StoreData | null>(null);

  useEffect(() => {
    fetchAdminSnapshot().then(setData);
  }, []);

  if (!data) {
    return <p className="text-slate-600">Loading…</p>;
  }

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const sellersToday = data.sellers.filter((s) =>
    s.joined_at.startsWith(today)
  ).length;
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const sellersWeek = data.sellers.filter(
    (s) => new Date(s.joined_at) >= weekAgo
  ).length;
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const sellersMonth = data.sellers.filter(
    (s) => new Date(s.joined_at) >= monthStart
  ).length;

  const listingsToday = data.appliances.filter((a) =>
    a.created_at.startsWith(today)
  ).length;
  const listingsWeek = data.appliances.filter(
    (a) => new Date(a.created_at) >= weekAgo
  ).length;
  const listingsMonth = data.appliances.filter(
    (a) => new Date(a.created_at) >= monthStart
  ).length;

  const pendingBookings = data.bookings.filter((b) => b.status === "pending")
    .length;
  const activeRentals = data.bookings.filter((b) =>
    ["confirmed", "out_for_delivery", "active", "return_due"].includes(b.status)
  ).length;
  const completedToday = data.bookings.filter(
    (b) =>
      b.status === "completed" &&
      (b.returned_at?.startsWith(today) || b.created_at.startsWith(today))
  ).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-violet-950 sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Overview, metrics, and quick product lookup.
        </p>
      </div>
      <AdminProductLookup />
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        <Stat label="Total sellers" value={data.sellers.length} />
        <Stat label="New sellers today" value={sellersToday} />
        <Stat label="New sellers (7d)" value={sellersWeek} />
        <Stat label="New sellers (month)" value={sellersMonth} />
        <Stat label="Total listings" value={data.appliances.length} />
        <Stat label="New listings today" value={listingsToday} />
        <Stat label="New listings (7d)" value={listingsWeek} />
        <Stat label="New listings (month)" value={listingsMonth} />
        <Stat label="Total bookings" value={data.bookings.length} />
        <Stat label="Pending confirmation" value={pendingBookings} />
        <Stat label="Active rentals" value={activeRentals} />
        <Stat label="Completed (today)" value={completedToday} />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link
          href="/admin/sellers"
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-violet-600 px-5 py-2.5 text-center text-sm font-semibold text-white hover:bg-violet-700"
        >
          Manage sellers
        </Link>
        <Link
          href="/admin/bookings"
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-violet-300 bg-white px-5 py-2.5 text-center text-sm font-semibold text-violet-900 hover:bg-violet-50"
        >
          Manage bookings
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-violet-100/80 bg-white p-4 shadow-sm sm:p-5">
      <p className="text-[11px] font-semibold tracking-wide text-violet-600 uppercase">
        {label}
      </p>
      <p className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        {value}
      </p>
    </div>
  );
}
