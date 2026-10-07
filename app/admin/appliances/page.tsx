"use client";

import { useEffect, useMemo, useState } from "react";
import type { StoreData } from "@/lib/store";
import { fetchAdminSnapshot } from "@/lib/admin-fetch";
import { DEHRADUN_AREAS } from "@/lib/areas";

export default function AdminAppliancesPage() {
  const [data, setData] = useState<StoreData | null>(null);
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [area, setArea] = useState("all");

  useEffect(() => {
    fetchAdminSnapshot().then(setData);
  }, []);

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.appliances.filter((a) => {
      if (category !== "all" && a.category !== category) return false;
      if (status !== "all" && a.status !== status) return false;
      if (area !== "all") {
        const areas = a.service_areas.split(",").map((x) => x.trim());
        if (!areas.includes(area)) return false;
      }
      return true;
    });
  }, [data, category, status, area]);

  async function patchAppliance(id: string, body: Record<string, unknown>) {
    await fetch(`/api/appliances/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    fetchAdminSnapshot().then(setData);
  }

  if (!data) return <p className="text-slate-600">Loading…</p>;

  const categories = Array.from(new Set(data.appliances.map((a) => a.category)));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-violet-950">Appliances</h1>
      <div className="flex flex-wrap gap-3">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-violet-200 px-3 py-2 text-sm"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-violet-200 px-3 py-2 text-sm"
        >
          <option value="all">All status</option>
          <option value="live">live</option>
          <option value="rented">rented</option>
          <option value="paused">paused</option>
          <option value="deleted">deleted</option>
        </select>
        <select
          value={area}
          onChange={(e) => setArea(e.target.value)}
          className="rounded-lg border border-violet-200 px-3 py-2 text-sm"
        >
          <option value="all">All areas</option>
          {DEHRADUN_AREAS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>
      <div className="overflow-x-auto rounded-xl border border-violet-100 bg-white shadow-sm">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b bg-violet-50">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Seller</th>
              <th className="p-3">Areas</th>
              <th className="p-3">Status</th>
              <th className="p-3">Created</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => {
              const s = data.sellers.find((x) => x.phone === a.seller_phone);
              return (
                <tr key={a.appliance_id} className="border-b border-slate-100">
                  <td className="p-3 font-medium">{a.name}</td>
                  <td className="p-3">{a.category}</td>
                  <td className="p-3">₹{a.daily_price}/d</td>
                  <td className="p-3">
                    {s?.name ?? "—"} ({a.seller_phone})
                  </td>
                  <td className="max-w-[180px] truncate p-3 text-xs">
                    {a.service_areas}
                  </td>
                  <td className="p-3">{a.status}</td>
                  <td className="p-3 text-xs">{a.created_at.slice(0, 10)}</td>
                  <td className="p-3">
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        className="text-left text-xs text-violet-600 underline"
                        onClick={() =>
                          patchAppliance(a.appliance_id, {
                            status:
                              a.status === "paused" ? "live" : "paused",
                          })
                        }
                      >
                        Pause/Resume
                      </button>
                      <button
                        type="button"
                        className="text-left text-xs text-red-600 underline"
                        onClick={() => {
                          if (confirm("Soft-delete listing?"))
                            patchAppliance(a.appliance_id, {
                              status: "deleted",
                            });
                        }}
                      >
                        Delete
                      </button>
                    </div>
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
