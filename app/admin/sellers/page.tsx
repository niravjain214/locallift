"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { StoreData } from "@/lib/store";
import { fetchAdminSnapshot } from "@/lib/admin-fetch";

export default function AdminSellersPage() {
  const [data, setData] = useState<StoreData | null>(null);

  useEffect(() => {
    fetchAdminSnapshot().then(setData);
  }, []);

  if (!data) return <p className="text-slate-600">Loading…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-violet-950">Sellers</h1>
      <div className="overflow-x-auto rounded-xl border border-violet-100 bg-white shadow-sm">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="border-b bg-violet-50 text-violet-900">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Shop</th>
              <th className="p-3">Areas</th>
              <th className="p-3">Listings</th>
              <th className="p-3">Earnings</th>
              <th className="p-3">Joined</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.sellers.map((s) => {
              const listings = data.appliances.filter(
                (a) => a.seller_phone === s.phone && a.status !== "deleted"
              ).length;
              return (
                <tr key={s.phone} className="border-b border-slate-100">
                  <td className="p-3 font-medium">{s.name}</td>
                  <td className="p-3 font-mono text-xs">{s.phone}</td>
                  <td className="p-3">{s.shop_name || "—"}</td>
                  <td className="max-w-xs truncate p-3 text-xs text-slate-600">
                    {s.service_areas}
                  </td>
                  <td className="p-3">{listings}</td>
                  <td className="p-3">₹{s.total_earnings}</td>
                  <td className="p-3 text-xs">
                    {s.joined_at.slice(0, 10)}
                  </td>
                  <td className="p-3">{s.status}</td>
                  <td className="p-3">
                    <Link
                      href={`/admin/sellers/${encodeURIComponent(s.phone)}`}
                      className="text-violet-600 underline"
                    >
                      View
                    </Link>
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
