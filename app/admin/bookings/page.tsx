"use client";

import { useEffect, useMemo, useState } from "react";
import type { Booking } from "@/lib/types";
import type { StoreData } from "@/lib/store";
import { fetchAdminSnapshot } from "@/lib/admin-fetch";

const STATUSES: Booking["status"][] = [
  "pending",
  "confirmed",
  "out_for_delivery",
  "active",
  "return_due",
  "completed",
  "cancelled",
];

export default function AdminBookingsPage() {
  const [data, setData] = useState<StoreData | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sellerPhone, setSellerPhone] = useState("all");

  useEffect(() => {
    fetchAdminSnapshot().then(setData);
  }, []);

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.bookings.filter((b) => {
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (sellerPhone !== "all" && b.seller_phone !== sellerPhone) return false;
      return true;
    });
  }, [data, statusFilter, sellerPhone]);

  async function patchBooking(id: string, body: Record<string, unknown>) {
    await fetch(`/api/bookings/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    fetchAdminSnapshot().then(setData);
  }

  if (!data) return <p className="text-slate-600">Loading…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-violet-950">Bookings</h1>
      <div className="flex flex-wrap gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-violet-200 px-3 py-2 text-sm"
        >
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={sellerPhone}
          onChange={(e) => setSellerPhone(e.target.value)}
          className="rounded-lg border border-violet-200 px-3 py-2 text-sm"
        >
          <option value="all">All sellers</option>
          {data.sellers.map((s) => (
            <option key={s.phone} value={s.phone}>
              {s.name} ({s.phone})
            </option>
          ))}
        </select>
      </div>
      <div className="overflow-x-auto rounded-xl border border-violet-100 bg-white shadow-sm">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="border-b bg-violet-50">
            <tr>
              <th className="p-3">Booking ID</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Appliance</th>
              <th className="p-3">Seller</th>
              <th className="p-3">Dates</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Status</th>
              <th className="p-3">Notes</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => {
              const app = data.appliances.find(
                (a) => a.appliance_id === b.appliance_id
              );
              const sel = data.sellers.find((s) => s.phone === b.seller_phone);
              return (
                <tr key={b.booking_id} className="border-b border-slate-100 align-top">
                  <td className="p-3 font-mono text-xs">{b.booking_id}</td>
                  <td className="p-3">
                    {b.customer_name}
                    <br />
                    <span className="text-xs text-slate-500">{b.customer_phone}</span>
                  </td>
                  <td className="p-3">{app?.name ?? b.appliance_id}</td>
                  <td className="p-3">{sel?.name ?? b.seller_phone}</td>
                  <td className="p-3 text-xs">
                    {b.start_date} → {b.end_date}
                  </td>
                  <td className="p-3">₹{b.total_amount}</td>
                  <td className="p-3">
                    <select
                      value={b.status}
                      onChange={(e) =>
                        patchBooking(b.booking_id, {
                          status: e.target.value as Booking["status"],
                        })
                      }
                      className="max-w-[140px] rounded border px-1 py-1 text-xs"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3">
                    <textarea
                      defaultValue={b.notes}
                      onBlur={(e) => {
                        if (e.target.value !== b.notes)
                          patchBooking(b.booking_id, { notes: e.target.value });
                      }}
                      rows={2}
                      className="w-40 rounded border px-1 py-1 text-xs"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
