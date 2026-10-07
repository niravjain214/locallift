"use client";

import { useEffect, useMemo, useState } from "react";
import type { StoreData } from "@/lib/store";
import { fetchAdminSnapshot } from "@/lib/admin-fetch";

const COMMISSION_PCT = 10;

export default function AdminFinancialsPage() {
  const [data, setData] = useState<StoreData | null>(null);

  useEffect(() => {
    fetchAdminSnapshot().then(setData);
  }, []);

  const stats = useMemo(() => {
    if (!data)
      return {
        gmvWeek: 0,
        gmvMonth: 0,
        commissionWeek: 0,
        commissionMonth: 0,
        pendingPayouts: 0,
      };
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const done = data.bookings.filter((b) => b.status === "completed");
    const inWeek = done.filter(
      (b) => new Date(b.returned_at || b.created_at) >= weekAgo
    );
    const inMonth = done.filter(
      (b) => new Date(b.returned_at || b.created_at) >= monthStart
    );
    const gmvWeek = inWeek.reduce((s, b) => s + b.total_amount, 0);
    const gmvMonth = inMonth.reduce((s, b) => s + b.total_amount, 0);
    const pendingPayouts = data.sellers.reduce(
      (s, x) => s + x.total_earnings,
      0
    );
    return {
      gmvWeek,
      gmvMonth,
      commissionWeek: (gmvWeek * COMMISSION_PCT) / 100,
      commissionMonth: (gmvMonth * COMMISSION_PCT) / 100,
      pendingPayouts,
    };
  }, [data]);

  if (!data) return <p className="text-slate-600">Loading…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-violet-950">Financial summary</h1>
      <p className="text-sm text-slate-600">
        Platform commission assumed at {COMMISSION_PCT}% of GMV (completed
        bookings). Adjust in code for your model.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-violet-100 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-violet-600">GMV this week</p>
          <p className="text-2xl font-bold">₹{stats.gmvWeek.toFixed(0)}</p>
        </div>
        <div className="rounded-xl border border-violet-100 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-violet-600">GMV this month</p>
          <p className="text-2xl font-bold">₹{stats.gmvMonth.toFixed(0)}</p>
        </div>
        <div className="rounded-xl border border-violet-100 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-violet-600">Commission (week)</p>
          <p className="text-2xl font-bold">₹{stats.commissionWeek.toFixed(0)}</p>
        </div>
        <div className="rounded-xl border border-violet-100 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-violet-600">Commission (month)</p>
          <p className="text-2xl font-bold">₹{stats.commissionMonth.toFixed(0)}</p>
        </div>
        <div className="rounded-xl border border-violet-100 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-violet-600">Seller earnings (sheet)</p>
          <p className="text-2xl font-bold">₹{stats.pendingPayouts.toFixed(0)}</p>
          <p className="mt-1 text-xs text-slate-500">
            Tracked on seller rows; reconcile with payouts manually for MVP.
          </p>
        </div>
      </div>
    </div>
  );
}
