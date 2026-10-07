"use client";

import { useEffect, useState } from "react";
import type { StoreData } from "@/lib/store";
import { fetchAdminSnapshot } from "@/lib/admin-fetch";
import { parseServiceAreas } from "@/lib/match";

export default function AdminAreasPage() {
  const [data, setData] = useState<StoreData | null>(null);

  useEffect(() => {
    fetchAdminSnapshot().then(setData);
  }, []);

  if (!data) return <p className="text-slate-600">Loading…</p>;

  const snapshot = data;

  function countForArea(areaName: string): number {
    return snapshot.appliances.filter((a) => {
      if (a.status === "deleted") return false;
      return parseServiceAreas(a.service_areas).includes(areaName);
    }).length;
  }

  async function toggle(area_name: string, active: boolean) {
    await fetch("/api/admin/areas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ area_name, active }),
      credentials: "include",
      cache: "no-store",
    });
    fetchAdminSnapshot().then(setData);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-violet-950">Areas</h1>
      <div className="overflow-x-auto rounded-xl border border-violet-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-violet-50">
            <tr>
              <th className="p-3">Area</th>
              <th className="p-3">Order</th>
              <th className="p-3">Active</th>
              <th className="p-3">Listings count</th>
            </tr>
          </thead>
          <tbody>
            {snapshot.areas
              .slice()
              .sort((a, b) => a.display_order - b.display_order)
              .map((ar) => (
                <tr key={ar.area_name} className="border-b border-slate-100">
                  <td className="p-3 font-medium">{ar.area_name}</td>
                  <td className="p-3">{ar.display_order}</td>
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => toggle(ar.area_name, !ar.active)}
                      className={
                        ar.active
                          ? "text-emerald-600"
                          : "text-slate-400 line-through"
                      }
                    >
                      {ar.active ? "enabled" : "disabled"}
                    </button>
                  </td>
                  <td className="p-3">{countForArea(ar.area_name)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-slate-500">
        Disabled areas are only a label here unless you wire them into browse.
        Adding or updating a seller/listing automatically re-enables any
        service area names they use.
      </p>
    </div>
  );
}
